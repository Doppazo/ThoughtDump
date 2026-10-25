// The vault: an Obsidian-style folder of markdown (.md) notes.
// It's saved on the server in the signed-in user's account (Firebase), and
// kept in memory here while the app is open so screens stay fast.
//
// Note rules (from the research report "AI second brain knowledge graph"):
// - One idea, question, or task per note. File name = title, unique across the vault.
// - Only [[links]] draw lines in a graph, so categories, people, projects and
//   places are stored as lists of links in the info block.
// - Hub notes (in hubs/) appear once 3 notes share a category, or once a
//   person/project/place is mentioned twice.
// - Up to 3 AI links per note, each with a reason, marked (AI), kept between
//   markers so they can be removed in bulk.
// - Fields the user edits are never overwritten by the AI.
(function () {
  const FOLDERS = ["raw", "audio", "ideas", "thoughts", "todos", "hubs"];
  const NOTE_FOLDERS = ["ideas", "thoughts", "todos"];
  const TYPES = ["idea", "note", "question", "task", "reminder"];
  const FOLDER_FOR = { idea: "ideas", note: "thoughts", question: "thoughts", task: "todos", reminder: "todos" };
  const ENTITY_FIELDS = { people: "person", projects: "project", places: "place" };
  const HUB_AT = 3;       // a category gets a hub note once this many notes share it
  const ENTITY_AT = 2;    // a person/project/place gets a note once mentioned this often
  const MAX_AI_LINKS = 3;
  const MAX_TAGS = 3;
  const AI_START = "<!-- ai-related:start -->";
  const AI_END = "<!-- ai-related:end -->";
  const REJECTED_PATH = ".thoughtdump/rejected-links.json";

  // ---------- Storage (the user's account on the server) ----------
  let cache = null;      // path -> { path, data, modified, audio? }
  let loading = null;
  let cloud = false;     // true when saved in Firebase, false in test mode
  async function load() {
    if (cache) return cache;
    if (!loading) {
      loading = (async () => {
        const r = await Api.json("GET", "/api/vault");
        const m = new Map();
        (r.files || []).forEach((f) => m.set(f.path, f));
        cloud = !!r.cloud;
        cache = m;
        return m;
      })().finally(() => { loading = null; });
    }
    return loading;
  }
  function reset() { cache = null; }
  const q = (path) => encodeURIComponent(path);
  async function putFile(path, data) {
    const m = await load();
    if (data instanceof Blob) {
      await Api.request("POST", `/api/audio?path=${q(path)}`, { body: data, headers: { "Content-Type": data.type || "application/octet-stream" } });
      m.set(path, { path, data, modified: Date.now(), audio: true });
      return;
    }
    await Api.json("PUT", "/api/vault", { json: { path, data } });
    m.set(path, { path, data, modified: Date.now() });
  }
  async function getFile(path) {
    const m = await load();
    const f = m.get(path);
    if (f && f.audio && !(f.data instanceof Blob)) {
      const res = await Api.request("GET", `/api/audio?path=${q(path)}`);
      f.data = await res.blob();
    }
    return f || null;
  }
  async function deleteFile(path) {
    const m = await load();
    await Api.request("DELETE", `/api/vault?path=${q(path)}`);
    m.delete(path);
  }
  async function allFiles() { return [...(await load()).values()]; }

  // ---------- Small helpers ----------
  const pad = (n) => String(n).padStart(2, "0");
  const shortDate = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const stamp = (d = new Date()) => `${shortDate(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`; // Obsidian date & time
  const fileStamp = (d = new Date()) => `${shortDate(d)} ${pad(d.getHours())}${pad(d.getMinutes())}`;
  const niceDate = (d = new Date()) => d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
  const toDate = (s) => { const d = new Date(String(s || "")); return isNaN(d) ? new Date() : d; };
  const isMd = (f) => typeof f.data === "string" && f.path.endsWith(".md");
  const baseName = (path) => path.split("/").pop().replace(/\.md$/, "");
  const folderOf = (path) => path.split("/")[0];
  const L = (name) => `[[${name}]]`;
  const unlink = (v) => String(v || "").replace(/^\[\[/, "").replace(/\]\]$/, "").split("|")[0].trim();
  const asList = (v) => (Array.isArray(v) ? v : v ? [v] : []);
  const uniq = (arr) => [...new Set(arr.filter(Boolean))];

  // Titles become file names: drop characters that break links or file names.
  function safeName(title) {
    return String(title || "Untitled")
      .replace(/:/g, " - ")
      .replace(/%%|[#|^[\]\\/*?"<>]/g, "")
      .replace(/\s+/g, " ").replace(/[ .]+$/, "").trim().slice(0, 100) || "Untitled";
  }
  // Tags: lowercase, words joined with hyphens, must contain a letter.
  function tagify(t) {
    const s = String(t || "").toLowerCase().replace(/^#/, "").trim().replace(/\s+/g, "-").replace(/[^a-z0-9_\-/]/g, "");
    return /[a-z_]/.test(s) ? s : "";
  }

  // ---------- Info block (YAML) ----------
  function scalar(v) {
    if (typeof v === "boolean" || typeof v === "number") return String(v);
    const s = String(v);
    if (/^\d{4}-\d\d-\d\d(T\d\d:\d\d(:\d\d)?)?$/.test(s)) return s;
    if (/^[A-Za-z][\w .'\-/]*$/.test(s) && !/^(true|false|null|yes|no|on|off)$/i.test(s)) return s;
    return JSON.stringify(s);
  }
  function toYaml(meta) {
    const out = [];
    for (const [k, v] of Object.entries(meta)) {
      if (v === undefined || v === null || v === "") continue;
      if (Array.isArray(v)) {
        if (!v.length) continue;
        out.push(`${k}:`);
        v.forEach((x) => out.push(`  - ${scalar(x)}`));
      } else out.push(`${k}: ${scalar(v)}`);
    }
    return out.join("\n");
  }
  function parseScalar(raw) {
    const v = raw.trim();
    if (v === "true" || v === "false") return v === "true";
    if (/^-?\d+(\.\d+)?$/.test(v)) return Number(v);
    if (v.startsWith('"')) { try { return JSON.parse(v); } catch { return v.slice(1, -1); } }
    if (v.startsWith("'") && v.endsWith("'")) return v.slice(1, -1).replace(/''/g, "'");
    return v;
  }
  function parseYaml(block) {
    const meta = {};
    const lines = block.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const m = lines[i].match(/^([\w-]+):\s*(.*)$/);
      if (!m) continue;
      const [, key, val] = m;
      if (val.trim() === "") {
        const list = [];
        while (i + 1 < lines.length && /^\s*-\s+/.test(lines[i + 1])) list.push(parseScalar(lines[++i].replace(/^\s*-\s+/, "")));
        meta[key] = list.length ? list : "";
      } else if (val.trim().startsWith("[") && val.trim().endsWith("]")) { // old inline lists
        const inner = val.trim().slice(1, -1).trim();
        meta[key] = inner ? inner.split(",").map(parseScalar) : [];
      } else meta[key] = parseScalar(val);
    }
    return meta;
  }

  // ---------- Reading and writing a note ----------
  // ---
  // info block
  // ---
  // # Title
  // *Sat, Oct 25, 2026*
  //
  // Text...
  //
  // ## Related
  // <!-- ai-related:start -->
  // - [[Other note]]: reason (AI)
  // <!-- ai-related:end -->
  // - [[Link the user added]]: reason
  function parse(text) {
    let rest = String(text || "");
    let meta = {};
    const fm = rest.match(/^---\n([\s\S]*?)\n---\n?/);
    if (fm) { meta = parseYaml(fm[1]); rest = rest.slice(fm[0].length); }
    const tm = rest.match(/^#\s+(.+)$/m);
    const title = tm ? tm[1].trim() : "";
    rest = rest.replace(/^#\s+.+\n?/m, "").replace(/^\*[^*\n]+\*\n?/, "");

    const relatedAi = [], relatedUser = [];
    const rel = rest.match(/(^|\n)## Related\n([\s\S]*?)(?=\n## |$)/);
    if (rel) {
      let inAi = false;
      rel[2].split("\n").forEach((line) => {
        if (line.includes(AI_START)) { inAi = true; return; }
        if (line.includes(AI_END)) { inAi = false; return; }
        const m = line.match(/^-\s*\[\[([^\]|#]+)[^\]]*\]\]\s*:?\s*(.*)$/);
        if (!m) return;
        const why = m[2].replace(/\s*\(AI\)\s*$/, "").trim();
        (inAi ? relatedAi : relatedUser).push({ title: m[1].trim(), why });
      });
      rest = rest.replace(rel[0], rel[1]);
    }
    return { meta, title, body: rest.trim(), relatedAi, relatedUser, links: links(text) };
  }

  function stringify({ meta = {}, title = "", body = "", relatedAi = [], relatedUser = [] }) {
    let out = `---\n${toYaml(meta)}\n---\n# ${title}\n*${niceDate(toDate(meta.created))}*\n`;
    if (body) out += `\n${body.trim()}\n`;
    if (relatedAi.length || relatedUser.length) {
      out += `\n## Related\n`;
      if (relatedAi.length) out += `${AI_START}\n${relatedAi.map((r) => `- [[${r.title}]]${r.why ? ": " + r.why : ""} (AI)`).join("\n")}\n${AI_END}\n`;
      if (relatedUser.length) out += `${relatedUser.map((r) => `- [[${r.title}]]${r.why ? ": " + r.why : ""}`).join("\n")}\n`;
    }
    return out;
  }

  // Every [[link]] in a text
  function links(text) {
    const out = [];
    const re = /!?\[\[([^\]|#]+)(?:[|#][^\]]*)?\]\]/g;
    let m;
    while ((m = re.exec(String(text || "")))) out.push(m[1].trim());
    return out;
  }

  // ---------- Finding things ----------
  async function list(folder) {
    const files = await allFiles();
    return files.filter((f) => (folder ? folderOf(f.path) === folder : !f.path.startsWith(".")))
      .sort((a, b) => b.modified - a.modified);
  }
  async function read(path) { const f = await getFile(path); return f ? f.data : null; }
  async function exists(path) { return !!(await getFile(path)); }
  async function findByName(name) {
    const files = await allFiles();
    return files.find((f) => baseName(f.path) === name || f.path.split("/").pop() === name) || null;
  }
  async function allNotes() {
    return (await allFiles()).filter((f) => isMd(f) && NOTE_FOLDERS.includes(folderOf(f.path)))
      .map((f) => ({ path: f.path, name: baseName(f.path), ...parse(f.data) }));
  }

  // Names in a vault must be unique, because links use the name
  function uniqueName(name, taken, when) {
    if (!taken.has(name)) return name;
    let n = `${name} ${shortDate(when)}`, k = 2;
    const base = n;
    while (taken.has(n)) n = `${base} ${k++}`;
    return n;
  }

  // Aliases: "Mom" and "my mother" both point to the [[Mom]] note
  function aliasMap(files) {
    const map = new Map();
    files.filter((f) => isMd(f) && folderOf(f.path) === "hubs").forEach((f) => {
      const name = baseName(f.path);
      map.set(name.toLowerCase(), name);
      asList(parse(f.data).meta.aliases).forEach((a) => map.set(String(a).toLowerCase().trim(), name));
    });
    return (raw) => { const n = safeName(unlink(raw)); return map.get(n.toLowerCase()) || n; };
  }

  // Word overlap between two titles (0 = nothing shared, 1 = same words)
  const STOP = new Set("the a an and or but to of for in on at by with about from my me i is be it this that need should would could will have has do".split(" "));
  const words = (s) => new Set(String(s).toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w)));
  function overlap(a, b) {
    const A = words(a), B = words(b);
    if (!A.size || !B.size) return 0;
    let both = 0;
    A.forEach((w) => { if (B.has(w)) both++; });
    return both / (A.size + B.size - both);
  }
  async function similar(title, { folders = NOTE_FOLDERS, min = 0.5, openTodosOnly = false } = {}) {
    let best = null;
    for (const n of await allNotes()) {
      if (!folders.includes(folderOf(n.path))) continue;
      if (openTodosOnly && n.meta.done) continue;
      const score = overlap(title, n.title || n.name);
      if (score >= min && (!best || score > best.score)) best = { path: n.path, name: n.name, score };
    }
    return best;
  }
  // A to-do you already have (the app should ask before keeping both)
  const findDuplicateTodo = (title) => similar(title, { folders: ["todos"], openTodosOnly: true });
  // An idea or thought you said before (the new note links back to it)
  const findRevisit = (title) => similar(title, { folders: ["ideas", "thoughts"] });

  // ---------- Saving ----------
  // Save a thought the AI pulled out (idea, note, question, task, reminder)
  async function saveNote(n) {
    const when = n.when || new Date();
    const type = TYPES.includes(n.type) ? n.type : "note";
    const folder = FOLDER_FOR[type];
    const files = await allFiles();
    const taken = new Set(files.filter(isMd).map((f) => baseName(f.path)));
    const name = uniqueName(safeName(n.title), taken, when);
    const resolve = aliasMap(files);
    const rejected = await loadRejected();

    const related = [];
    for (const r of n.related || []) {
      const t = r && safeName(r.title);
      if (!t || t === name || !taken.has(t) || related.some((x) => x.title === t)) continue;
      if (rejected.has(pairKey(name, t))) continue;
      related.push({ title: t, why: String(r.why || "").trim() });
      if (related.length >= MAX_AI_LINKS) break;
    }

    const meta = {
      type,
      categories: uniq(asList(n.categories).map((c) => safeName(unlink(c)))).map(L),
      tags: uniq(asList(n.tags).map(tagify)).slice(0, MAX_TAGS),
    };
    for (const field of Object.keys(ENTITY_FIELDS)) meta[field] = uniq(asList(n[field]).map(resolve)).map(L);
    Object.assign(meta, {
      aliases: uniq(asList(n.aliases).map(String)),
      created: stamp(when),
      source: n.source ? L(n.source) : undefined,
      done: folder === "todos" ? !!n.done : undefined,
      ai_generated: n.aiGenerated === false ? undefined : true,
      example: n.example || undefined,
    });

    let body = String(n.summary || "").trim();
    if (n.revisits && taken.has(n.revisits)) {
      const old = files.find((f) => baseName(f.path) === n.revisits);
      const d = old ? toDate(parse(old.data).meta.created) : null;
      body += `\n\n*Revisits [[${n.revisits}]]${d ? " from " + niceDate(d) : ""}.*`;
    }

    const path = `${folder}/${name}.md`;
    await putFile(path, stringify({ meta, title: name, body, relatedAi: related }));
    if (!n.skipHubs) await syncHubs();
    return path;
  }

  // Save what the user added, word for word (voice, typed note, or upload)
  async function saveRaw({ kind = "typed", text = "", audioBlob, audioExt = "webm", made = [], example, when = new Date() }) {
    const files = await allFiles();
    const taken = new Set(files.map((f) => f.path));
    let name = `${fileStamp(when)} ${kind}`, k = 2;
    const base = name;
    while (taken.has(`raw/${name}.md`)) name = `${base} ${k++}`;
    let audioFile;
    if (audioBlob) {
      audioFile = `${name}.${audioExt}`;
      await putFile(`audio/${audioFile}`, audioBlob);
    }
    const pending = !!audioBlob && !text.trim();
    const meta = {
      type: "raw", kind, created: stamp(when),
      audio: audioFile ? L(audioFile) : undefined,
      transcript: pending ? "pending" : undefined,
      example: example || undefined,
    };
    const path = `raw/${name}.md`;
    await putFile(path, rawText({ meta, kind, audioFile, text, made }));
    return { name, path, audioPath: audioFile ? `audio/${audioFile}` : null };
  }
  function rawText({ meta, kind, audioFile, text, made }) {
    const label = { voice: "Voice note", typed: "Typed note", upload: "Uploaded recording" }[kind] || "Note";
    let body = "";
    if (audioFile) body += `![[${audioFile}]]\n\n`;
    body += `## ${kind === "typed" ? "Text" : "Transcript"}\n`;
    body += text.trim() || "_The transcript will appear here once AI is connected._";
    if (made && made.length) body += `\n\n## Notes made from this\n${made.map((t) => `- [[${t}]]`).join("\n")}`;
    return `---\n${toYaml(meta)}\n---\n# ${label}\n*${niceDate(toDate(meta.created))}*\n\n${body}\n`;
  }
  // After the AI makes notes from a raw file, list them in it
  async function setMadeFrom(rawPath, titles) {
    const text = await read(rawPath);
    if (text == null) return;
    const cleaned = text.replace(/\n*## Notes made from this\n[\s\S]*$/, "").trimEnd();
    const add = titles.length ? `\n\n## Notes made from this\n${titles.map((t) => `- [[${t}]]`).join("\n")}` : "";
    await putFile(rawPath, cleaned + add + "\n");
  }

  // ---------- Hub notes (categories, people, projects, places) ----------
  async function syncHubs() {
    const files = await allFiles();
    const taken = new Set(files.filter(isMd).map((f) => baseName(f.path)));
    const counts = new Map();
    for (const f of files) {
      if (!isMd(f) || !NOTE_FOLDERS.includes(folderOf(f.path))) continue;
      const { meta } = parse(f.data);
      const add = (vals, kind) => asList(vals).forEach((v) => {
        const name = unlink(v);
        if (!name) return;
        const c = counts.get(name) || { kind, n: 0, allExample: true };
        c.n++;
        if (!meta.example) c.allExample = false;
        counts.set(name, c);
      });
      add(meta.categories, "category");
      for (const [field, kind] of Object.entries(ENTITY_FIELDS)) add(meta[field], kind);
    }
    for (const [name, c] of counts) {
      const need = c.kind === "category" ? HUB_AT : ENTITY_AT;
      if (c.n >= need && !taken.has(name)) {
        await putFile(`hubs/${name}.md`, hubText(name, c.kind, c.allExample));
        taken.add(name);
      }
    }
  }
  function hubText(name, kind, example) {
    const about = {
      category: "Every note in this category links here, so it becomes a cluster in your graph.",
      person: "Everything you've said about this person links here.",
      project: "Every note about this project links here.",
      place: "Every note that mentions this place links here.",
    }[kind];
    const meta = { type: "hub", kind, created: stamp(), example: example || undefined };
    return `---\n${toYaml(meta)}\n---\n# ${name}\n*${niceDate()}*\n\n${about}\n`;
  }
  // Alternate names for a hub note ("Mom", "my mother")
  async function setAliases(name, aliases) {
    const path = `hubs/${name}.md`;
    const text = await read(path);
    if (text == null) return false;
    const p = parse(text);
    p.meta.aliases = uniq(aliases.map(String));
    const rest = text.replace(/^---\n[\s\S]*?\n---\n?/, "");
    await putFile(path, `---\n${toYaml(p.meta)}\n---\n${rest}`);
    return true;
  }

  // ---------- Editing ----------
  // Change a note. Edits by the user are remembered in "user_edited",
  // and the AI (byUser: false) never overwrites those fields.
  async function updateNote(path, changes, { byUser = true } = {}) {
    const text = await read(path);
    if (text == null) throw new Error("Note not found: " + path);
    const p = parse(text);
    const edited = new Set(asList(p.meta.user_edited));
    const allowed = (k) => byUser || !edited.has(k);
    const files = await allFiles();
    const resolve = aliasMap(files);

    for (const [k, v] of Object.entries(changes)) {
      if (k === "title" || k === "body" || !allowed(k)) continue;
      if (k === "categories") p.meta.categories = uniq(asList(v).map((c) => safeName(unlink(c)))).map(L);
      else if (ENTITY_FIELDS[k]) p.meta[k] = uniq(asList(v).map(resolve)).map(L);
      else if (k === "tags") p.meta.tags = uniq(asList(v).map(tagify)).slice(0, MAX_TAGS);
      else p.meta[k] = v;
      if (byUser) edited.add(k);
    }
    if ("body" in changes && allowed("body")) { p.body = String(changes.body); if (byUser) edited.add("body"); }
    const renaming = "title" in changes && safeName(changes.title) !== p.title && allowed("title");
    if (renaming && byUser) edited.add("title");
    if (byUser && edited.size) {
      delete p.meta.user_edited;
      p.meta.user_edited = [...edited];
    }
    // Changing the type can move the note to another folder (e.g. idea -> task moves to todos/)
    let target = path;
    const newFolder = FOLDER_FOR[p.meta.type];
    if (newFolder && NOTE_FOLDERS.includes(folderOf(path)) && newFolder !== folderOf(path)) {
      target = `${newFolder}/${baseName(path)}.md`;
      if (newFolder === "todos") { if (p.meta.done === undefined) p.meta.done = false; }
      else delete p.meta.done;
    }
    await putFile(target, stringify(p));
    if (target !== path) await deleteFile(path);
    const newPath = renaming ? await rename(target, changes.title) : target;
    await syncHubs();
    return newPath;
  }

  // Links you add yourself (kept outside the AI's block, never removed by the AI)
  async function addUserLink(path, targetName, why = "") {
    const p = parse(await read(path));
    const t = safeName(targetName);
    if (t === baseName(path) || p.relatedUser.some((r) => r.title === t) || p.relatedAi.some((r) => r.title === t)) return false;
    p.relatedUser.push({ title: t, why: String(why || "").trim() });
    await putFile(path, stringify(p));
    return true;
  }
  async function removeUserLink(path, targetName) {
    const p = parse(await read(path));
    p.relatedUser = p.relatedUser.filter((r) => r.title !== targetName);
    await putFile(path, stringify(p));
  }

  // Everything that points at a note: [[links]] in other notes, hubs, and raw files
  async function backlinks(name) {
    const out = [];
    for (const f of await allFiles()) {
      if (!isMd(f) || baseName(f.path) === name) continue;
      if (links(f.data).includes(name)) out.push({ path: f.path, name: baseName(f.path), folder: folderOf(f.path) });
    }
    return out;
  }

  // Delete a note and take it out of the "Notes made from this" list of its raw file
  async function deleteNote(path) {
    const text = await read(path);
    await deleteFile(path);
    const src = text ? unlink(parse(text).meta.source) : "";
    if (src) {
      const raw = await read(`raw/${src}.md`);
      if (raw) {
        const name = baseName(path);
        await putFile(`raw/${src}.md`, raw.replace(new RegExp(`\\n- \\[\\[${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\]\\]`, "g"), ""));
      }
    }
  }

  // Change a note's title: renames the file and fixes every [[link]] to it
  async function rename(path, newTitle) {
    const oldName = baseName(path);
    const files = await allFiles();
    const taken = new Set(files.filter(isMd).map((f) => baseName(f.path)));
    taken.delete(oldName);
    const newName = uniqueName(safeName(newTitle), taken, new Date());
    if (newName === oldName) return path;
    const newPath = `${folderOf(path)}/${newName}.md`;
    const text = await read(path);
    await putFile(newPath, text.replace(/^# .+$/m, `# ${newName}`));
    await deleteFile(path);
    const esc = oldName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`\\[\\[${esc}(?=[\\]|#])`, "g");
    for (const f of await allFiles()) {
      if (typeof f.data === "string" && f.data.match(re)) await putFile(f.path, f.data.replace(re, `[[${newName}`));
    }
    return newPath;
  }

  // Remove one AI link, and remember not to suggest that pair again
  async function removeAiLink(path, target) {
    const p = parse(await read(path));
    p.relatedAi = p.relatedAi.filter((r) => r.title !== target);
    await putFile(path, stringify(p));
    const rejected = await loadRejected();
    rejected.add(pairKey(baseName(path), target));
    await putFile(REJECTED_PATH, JSON.stringify([...rejected], null, 2));
  }
  const pairKey = (a, b) => [a, b].sort().join(" | ");
  async function loadRejected() {
    try { return new Set(JSON.parse((await read(REJECTED_PATH)) || "[]")); } catch { return new Set(); }
  }

  async function remove(path) { await deleteFile(path); }
  async function write(path, text) { await putFile(path, text); }
  async function readAudio(path) { const f = await getFile(path); return f && f.data instanceof Blob ? f.data : null; }

  // ---------- Example notes ----------
  async function clearExamples() {
    let n = 0;
    for (const f of await allFiles()) {
      if (!isMd(f)) continue;
      const { meta } = parse(f.data);
      if (!meta.example) continue;
      if (meta.audio) await deleteFile(`audio/${unlink(meta.audio)}`);
      await deleteFile(f.path);
      n++;
    }
    return n;
  }

  // A new account starts with example notes (once), so the screens aren't empty
  const SEEDED = ".thoughtdump/seeded.json";
  async function seedIfEmpty() {
    const m = await load();
    if (m.has(SEEDED)) return;
    if (!(await list()).length) await seedExamples();
    await putFile(SEEDED, JSON.stringify({ seeded: stamp() }));
  }

  // What the AI needs to know to sort a new dump consistently (see docs/ai-note-rules.md)
  async function aiContext(text) {
    const files = await allFiles();
    const notes = await allNotes();
    const cats = new Map(), tags = new Map(), ents = new Map();
    for (const n of notes) {
      asList(n.meta.categories).forEach((c) => { const k = unlink(c); cats.set(k, (cats.get(k) || 0) + 1); });
      asList(n.meta.tags).forEach((t) => tags.set(t, (tags.get(t) || 0) + 1));
      for (const [field, kind] of Object.entries(ENTITY_FIELDS)) {
        asList(n.meta[field]).forEach((v) => { const k = unlink(v); if (k && !ents.has(k)) ents.set(k, { name: k, kind, aliases: [] }); });
      }
    }
    files.filter((f) => isMd(f) && folderOf(f.path) === "hubs").forEach((f) => {
      const { meta } = parse(f.data);
      if (meta.kind === "category") return;
      const name = baseName(f.path);
      ents.set(name, { name, kind: meta.kind || "person", aliases: asList(meta.aliases).map(String) });
    });
    // The notes most related to this dump (by shared words), then the newest
    const scored = notes.map((n) => ({ n, s: overlap(text, `${n.title || n.name} ${n.body}`), t: toDate(n.meta.created).getTime() }))
      .sort((a, b) => b.s - a.s || b.t - a.t).slice(0, 15);
    const byCount = (m) => [...m.entries()].sort((a, b) => b[1] - a[1]);
    return {
      categories: byCount(cats).map(([name, count]) => ({ name, count })),
      tags: byCount(tags).slice(0, 30).map(([t]) => t),
      entities: [...ents.values()],
      candidates: scored.map(({ n }) => ({ title: n.name, type: n.meta.type, categories: asList(n.meta.categories).map(unlink) })),
    };
  }

  async function seedExamples() {
    const day = 86400000, now = Date.now();
    const at = (d) => new Date(now - d * day);
    const ex = { example: true, skipHubs: true };

    const r1 = await saveRaw({ kind: "typed", example: true, when: at(6),
      text: "laundry pickup for dorms?? people hate doing laundry. other students could do the pickups. also need to learn SQL at some point, prof lee said it helps with the internship" });
    const n1 = await saveNote({ ...ex, when: at(6), source: r1.name, type: "idea",
      title: "Campus laundry pickup could run on student couriers",
      summary: "Students hand off a bag and another student brings it back washed and folded the next day. Start with one dorm to test it.",
      categories: ["Business Ideas"], tags: ["campus", "startups"], projects: ["Campus Laundry App"] });
    const n2 = await saveNote({ ...ex, when: at(6), source: r1.name, type: "note",
      title: "Learning SQL would help with my internship",
      summary: "Prof. Lee said SQL comes up a lot in internships. It would also help me track numbers for any business idea.",
      categories: ["Learning"], tags: ["skills"], people: ["Prof. Lee"] });
    await setMadeFrom(r1.path, [n1, n2].map(baseName));

    const r2 = await saveRaw({ kind: "voice", example: true, when: at(4),
      text: "coffee idea, a monthly box of beans from small boston roasters. and I need to email professor lee about the group project deadline before friday" });
    const n3 = await saveNote({ ...ex, when: at(4), source: r2.name, type: "idea",
      title: "Monthly box of beans from small Boston roasters",
      summary: "A coffee subscription for students and young workers that features a different local roaster every month.",
      categories: ["Business Ideas"], tags: ["subscriptions"], places: ["Boston"] });
    const n4 = await saveNote({ ...ex, when: at(4), source: r2.name, type: "task",
      title: "Email Prof. Lee about the group project deadline",
      summary: "Ask before Friday whether we can get a few extra days.",
      categories: ["School"], tags: ["deadlines"], people: ["Prof. Lee"] });
    await setMadeFrom(r2.path, [n3, n4].map(baseName));

    const r3 = await saveRaw({ kind: "voice", example: true, when: at(2),
      text: "call grandma sunday, haven't called in two weeks. would students actually pay for the laundry thing? I should post a five question survey in the dorm group chat" });
    const n5 = await saveNote({ ...ex, when: at(2), source: r3.name, type: "reminder",
      title: "Call grandma on Sunday",
      summary: "I haven't called her in two weeks.",
      categories: ["Personal"], tags: ["family"], people: ["Grandma"] });
    const n6 = await saveNote({ ...ex, when: at(2), source: r3.name, type: "question",
      title: "Would students pay for laundry pickup",
      summary: "I need to find out before building anything.",
      categories: ["Business Ideas"], tags: ["validation"], projects: ["Campus Laundry App"],
      related: [{ title: baseName(n1), why: "tests demand for the courier idea" }] });
    const n7 = await saveNote({ ...ex, when: at(2), source: r3.name, type: "task",
      title: "Post a five-question laundry survey in the dorm chat",
      summary: "Keep it to five questions. Ask about price and how often they'd use it.",
      categories: ["Business Ideas"], tags: ["validation"], projects: ["Campus Laundry App"],
      related: [{ title: baseName(n6), why: "how I'll find out if students would pay" }] });
    await setMadeFrom(r3.path, [n5, n6, n7].map(baseName));

    await syncHubs(); // makes Business Ideas, Campus Laundry App, and Prof. Lee hubs
    await setAliases("Prof. Lee", ["Professor Lee", "prof lee"]);
  }

  // ---------- Download as an Obsidian vault (.zip) ----------
  const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  function crc32(bytes) { let c = 0xffffffff; for (let i = 0; i < bytes.length; i++) c = CRC[(c ^ bytes[i]) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }
  async function exportZip(root = "Thought Dump") {
    const enc = new TextEncoder();
    const files = (await allFiles()).filter((f) => !f.path.startsWith("."));
    const d = new Date();
    const time = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1);
    const date = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
    const parts = [], central = [];
    let offset = 0;
    for (const f of files) {
      const name = enc.encode(`${root}/${f.path}`);
      if (typeof f.data !== "string" && !(f.data instanceof Blob)) await getFile(f.path); // download audio first
      const data = typeof f.data === "string" ? enc.encode(f.data) : new Uint8Array(await f.data.arrayBuffer());
      const crc = crc32(data);
      const h = new DataView(new ArrayBuffer(30));
      h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(6, 0x0800, true);
      h.setUint16(10, time, true); h.setUint16(12, date, true); h.setUint32(14, crc, true);
      h.setUint32(18, data.length, true); h.setUint32(22, data.length, true); h.setUint16(26, name.length, true);
      parts.push(h.buffer, name, data);
      const c = new DataView(new ArrayBuffer(46));
      c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true); c.setUint16(8, 0x0800, true);
      c.setUint16(12, time, true); c.setUint16(14, date, true); c.setUint32(16, crc, true);
      c.setUint32(20, data.length, true); c.setUint32(24, data.length, true); c.setUint16(28, name.length, true);
      c.setUint32(42, offset, true);
      central.push(c.buffer, name);
      offset += 30 + name.length + data.length;
    }
    const size = central.reduce((s, b) => s + b.byteLength, 0);
    const end = new DataView(new ArrayBuffer(22));
    end.setUint32(0, 0x06054b50, true); end.setUint16(8, files.length, true); end.setUint16(10, files.length, true);
    end.setUint32(12, size, true); end.setUint32(16, offset, true);
    return new Blob([...parts, ...central, end.buffer], { type: "application/zip" });
  }

  window.Vault = {
    FOLDERS, NOTE_FOLDERS, FOLDER_FOR, MAX_AI_LINKS, MAX_TAGS, asList,
    list, read, readAudio, write, exists, remove, findByName, allNotes,
    saveNote, saveRaw, setMadeFrom, updateNote, rename, removeAiLink, setAliases, syncHubs,
    addUserLink, removeUserLink, backlinks, deleteNote,
    findDuplicateTodo, findRevisit, similar,
    seedIfEmpty, clearExamples, exportZip, aiContext, reset,
    get cloud() { return cloud; },
    parse, stringify, links, baseName, folderOf, safeName, tagify, unlink, stamp,
  };
})();
