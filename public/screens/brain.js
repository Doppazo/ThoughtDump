// Second Brain tab: every note as a color-coded card, grouped by category.
// Tap a card to open it: edit every part (to fix AI mistakes), see its
// Connections (links, backlinks, hubs) and a small graph of its neighbors.
let pendingOpen = null;
let activeShowDetail = null;

window.Screens = window.Screens || {};
window.Screens.brain = {
  open(path, { from = "brain" } = {}) {
    pendingOpen = { path, from };
    if (location.hash === "#brain" && activeShowDetail) {
      activeShowDetail(path, null, from);
      pendingOpen = null;
    } else {
      location.hash = "brain";
    }
  },
  render(el) {
    const TYPES = [
      { id: "idea", label: "Idea" }, { id: "note", label: "Thought" }, { id: "question", label: "Question" },
      { id: "task", label: "To-do" }, { id: "reminder", label: "Reminder" },
    ];
    const TYPE_LABEL = Object.fromEntries(TYPES.map((t) => [t.id, t.label]));
    const FILTERS = [
      { id: "all", label: "All" }, { id: "ideas", label: "Ideas" },
      { id: "thoughts", label: "Thoughts" }, { id: "todos", label: "To-dos" },
      { id: "raw", label: "Raw" },
    ];
    const DAY = 86400000;
    let filter = "all", query = "";

    const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
    const list = (v) => (Array.isArray(v) ? v : v ? [v] : []);
    const names = (v) => list(v).map(Vault.unlink).filter(Boolean);
    const csv = (s) => String(s || "").split(",").map((x) => x.trim()).filter(Boolean);
    function ago(created) {
      const t = new Date(String(created || "")).getTime();
      if (!t) return "";
      const d = Date.now() - t;
      if (d < 3600000) return "just now";
      if (d < DAY) return Math.floor(d / 3600000) + "h ago";
      const n = Math.floor(d / DAY);
      return n === 1 ? "yesterday" : n < 7 ? n + " days ago" : new Date(t).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }
    const colorOf = (meta, folder) =>
      folder === "raw" ? "var(--t-raw)" : folder === "hubs" ? "#FFFFFF" : `var(--t-${meta.type || "note"})`;

    // ---------- List of cards ----------
    async function showList() {
      AudioPlayer.stopAll();
      el.innerHTML = `
        <h1 class="screen-title">Second Brain</h1>
        <p class="screen-sub" id="b-stats">Loading…</p>
        <label class="sr-only" for="b-search">Search your notes</label>
        <input class="field b-search" id="b-search" type="search" placeholder="Search your notes" value="${esc(query)}">
        <div class="b-chips" id="b-chips" role="group" aria-label="Filter by type"></div>
        <div id="b-groups"></div>`;
      const [notes, rawFiles] = await Promise.all([
        Vault.allNotes(),
        Vault.list("raw"),
      ]);
      const linkCount = notes.reduce((s, n) => s + n.relatedAi.length + n.relatedUser.length, 0);
      el.querySelector("#b-stats").textContent = `${notes.length} notes · ${linkCount} connections`;

      const chips = el.querySelector("#b-chips");
      FILTERS.forEach((f) => {
        let n = 0;
        if (f.id === "all") n = notes.length;
        else if (f.id === "raw") n = rawFiles.length;
        else n = notes.filter((x) => Vault.folderOf(x.path) === f.id).length;
        const b = document.createElement("button");
        b.type = "button";
        b.className = "b-chip";
        b.setAttribute("aria-pressed", String(filter === f.id));
        b.innerHTML = `${esc(f.label)} <span>${n}</span>`;
        b.onclick = () => { filter = f.id; showList(); };
        chips.appendChild(b);
      });
      const search = el.querySelector("#b-search");
      search.addEventListener("input", () => { query = search.value; drawGroups(notes, rawFiles); });
      drawGroups(notes, rawFiles);
    }

    function drawGroups(notes, rawFiles = []) {
      const root = el.querySelector("#b-groups");
      root.innerHTML = "";
      const qy = query.trim().toLowerCase();

      if (filter === "raw") {
        const parsedRaw = rawFiles.map((f) => {
          const p = Vault.parse(f.data);
          const words = (p.body.split(/## (?:Transcript|Text)\n/)[1] || "").split("\n## ")[0].trim();
          const made = Vault.links((p.body.split("## Notes made from this")[1] || ""));
          const kind = p.meta.kind || "voice";
          return {
            path: f.path,
            name: Vault.baseName(f.path),
            kind,
            created: p.meta.created || f.modified,
            hasAudio: !!p.meta.audio,
            words,
            made,
            title: p.title || { voice: "Voice note", typed: "Typed note", upload: "Uploaded recording" }[kind] || "Original",
          };
        });
        const shownRaw = parsedRaw.filter((r) => {
          if (!qy) return true;
          const hay = [r.name, r.title, r.words, r.kind].join(" ").toLowerCase();
          return hay.includes(qy);
        });
        if (!shownRaw.length) {
          root.innerHTML = `<div class="placeholder"><p>${qy ? "Nothing matches that search." : "No raw recordings or notes yet. Use the Capture tab to speak or type."}</p></div>`;
          return;
        }
        const sec = document.createElement("section");
        sec.className = "b-group";
        sec.innerHTML = `<h2 class="b-group-title">Raw captures <span>${shownRaw.length}</span></h2>`;
        shownRaw.forEach((r) => sec.appendChild(rawCard(r)));
        root.appendChild(sec);
        return;
      }

      const shown = notes.filter((n) => {
        if (filter !== "all" && Vault.folderOf(n.path) !== filter) return false;
        if (!qy) return true;
        const hay = [n.name, n.body, ...names(n.meta.categories), ...list(n.meta.tags), ...names(n.meta.people), ...names(n.meta.projects), ...names(n.meta.places)].join(" ").toLowerCase();
        return hay.includes(qy);
      });
      if (!shown.length) {
        root.innerHTML = `<div class="placeholder"><p>${qy ? "Nothing matches that search." : "No notes here yet. Capture a thought and it'll show up here, sorted."}</p></div>`;
        return;
      }
      const groups = new Map();
      shown.forEach((n) => {
        const g = names(n.meta.categories)[0] || "No category";
        if (!groups.has(g)) groups.set(g, []);
        groups.get(g).push(n);
      });
      [...groups.entries()].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0])).forEach(([cat, items]) => {
        const sec = document.createElement("section");
        sec.className = "b-group";
        sec.innerHTML = `<h2 class="b-group-title">${esc(cat)} <span>${items.length}</span></h2>`;
        items.sort((a, b) => String(b.meta.created).localeCompare(String(a.meta.created))).forEach((n) => sec.appendChild(card(n)));
        root.appendChild(sec);
      });
    }

    function card(n) {
      const c = document.createElement("button");
      c.type = "button";
      c.className = "note-card b-card" + (n.meta.done ? " is-done" : "");
      c.style.setProperty("--c", colorOf(n.meta, Vault.folderOf(n.path)));
      const links = n.relatedAi.length + n.relatedUser.length;
      const sum = n.body.replace(/\*Revisits[^*]*\*/g, "").trim();
      c.innerHTML = `
        <span class="type-pill">${esc(TYPE_LABEL[n.meta.type] || "Note")}${n.meta.done ? " · done" : ""}</span>
        <span class="note-title">${esc(n.name)}</span>
        <span class="note-sum b-clamp">${esc(sum)}</span>
        <span class="note-foot b-foot">
          <span>${esc(ago(n.meta.created))}</span>
          ${links ? `<span>${links} link${links === 1 ? "" : "s"}</span>` : ""}
          ${list(n.meta.user_edited).length ? `<span class="ai-badge">Edited</span>` : n.meta.ai_generated ? `<span class="ai-badge">AI</span>` : ""}
        </span>`;
      c.onclick = () => showDetail(n.path);
      return c;
    }

    function rawCard(r) {
      const c = document.createElement("button");
      c.type = "button";
      c.className = "note-card b-card";
      c.style.setProperty("--c", "var(--t-raw)");
      const kindLabel = {
        voice: "Voice note",
        typed: "Typed note",
        upload: "Uploaded recording",
      }[r.kind] || "Original";
      const snippet = r.words.startsWith("_") ? "Transcript not available yet." : r.words;
      const madeText = r.made.length ? `${r.made.length} note${r.made.length === 1 ? "" : "s"} made` : "";
      c.innerHTML = `
        <span class="type-pill" style="--c:var(--t-raw)">${esc(kindLabel)}</span>
        <span class="note-title">${esc(r.title || kindLabel)}</span>
        <span class="note-sum b-clamp">${esc(snippet)}</span>
        <span class="note-foot b-foot">
          <span>${esc(ago(r.created))}</span>
          ${r.hasAudio ? `<span>🎙️ Recording</span>` : ""}
          ${madeText ? `<span>${esc(madeText)}</span>` : ""}
        </span>`;
      c.onclick = () => showDetail(r.path);
      return c;
    }

    // ---------- One note, opened ----------
    async function showDetail(path, flash, from) {
      AudioPlayer.stopAll();
      const text = await Vault.read(path);
      if (text == null) { showList(); return; }
      const folder = Vault.folderOf(path);
      if (folder === "raw") return showRaw(path, text, from);
      if (folder === "hubs") return showHub(path, text, from);
      const n = Vault.parse(text);
      const name = Vault.baseName(path);
      const isTodo = folder === "todos";
      window.scrollTo(0, 0);

      const backLabel = from === "todo" ? "‹ To-Do" : from === "graph" ? "‹ Graph" : from === "ask" ? "‹ Ask" : "‹ Second Brain";
      el.innerHTML = `
        <button class="row-back b-back" type="button" id="d-back">${backLabel}</button>
        <article class="b-detail" style="--c:${colorOf(n.meta, folder)}">
          <span class="type-pill">${esc(TYPE_LABEL[n.meta.type] || "Note")}</span>
          <label class="sr-only" for="d-title">Title</label>
          <textarea class="d-title" id="d-title" rows="2">${esc(name)}</textarea>
          <p class="d-meta" id="d-meta"></p>

          <div class="d-field"><span class="d-label">Type</span><div class="b-chips" id="d-type" role="radiogroup" aria-label="Type"></div></div>
          ${isTodo ? `<label class="d-done"><input type="checkbox" id="d-done" ${n.meta.done ? "checked" : ""}> Done</label>` : ""}
          <div class="d-field"><label class="d-label" for="d-body">Note</label><textarea class="field d-body" id="d-body" rows="4">${esc(n.body)}</textarea></div>
          <div class="d-field"><label class="d-label" for="d-cats">Category</label><input class="field" id="d-cats" value="${esc(names(n.meta.categories).join(", "))}" placeholder="Business Ideas"></div>
          <div class="d-field"><label class="d-label" for="d-tags">Tags</label><input class="field" id="d-tags" value="${esc(list(n.meta.tags).join(", "))}" placeholder="campus, startups"></div>
          <div class="d-field"><label class="d-label" for="d-people">People</label><input class="field" id="d-people" value="${esc(names(n.meta.people).join(", "))}" placeholder="Prof. Lee"></div>
          <div class="d-field"><label class="d-label" for="d-projects">Projects</label><input class="field" id="d-projects" value="${esc(names(n.meta.projects).join(", "))}"></div>
          <div class="d-field"><label class="d-label" for="d-places">Places</label><input class="field" id="d-places" value="${esc(names(n.meta.places).join(", "))}"></div>
          <p class="d-hint">Separate several with commas. Anything you change here, the AI won't overwrite.</p>
          <div class="d-actions">
            <button class="pill-btn d-delete" type="button" id="d-delete">Delete</button>
            <button class="btn-primary" type="button" id="d-save">Save changes</button>
          </div>
          <p class="capture-note" id="d-status" role="status" aria-live="polite"></p>
        </article>

        <section id="d-source"></section>

        <h2 class="section-title">Connections</h2>
        <div class="b-graph-wrap" id="d-graph"></div>
        <div id="d-links"></div>`;

      const $ = (s) => el.querySelector(s);
      const status = $("#d-status");
      $("#d-back").onclick = () => {
        if (from && from !== "brain") location.hash = from;
        else showList();
      };
      if (flash) status.textContent = flash;

      // Created date, and who made it
      const edited = list(n.meta.user_edited);
      $("#d-meta").textContent = [
        n.meta.created ? new Date(String(n.meta.created)).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" }) : "",
        edited.length ? "edited by you" : n.meta.ai_generated ? "made by AI" : "",
      ].filter(Boolean).join(" · ");

      // Type picker
      let type = n.meta.type || "note";
      const typeBox = $("#d-type");
      TYPES.forEach((t) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "b-chip";
        b.setAttribute("role", "radio");
        b.setAttribute("aria-checked", String(type === t.id));
        b.style.setProperty("--c", `var(--t-${t.id})`);
        b.textContent = t.label;
        b.onclick = () => { type = t.id; typeBox.querySelectorAll(".b-chip").forEach((x) => x.setAttribute("aria-checked", String(x === b))); };
        typeBox.appendChild(b);
      });

      // Save: only send what changed
      $("#d-save").onclick = async () => {
        const changes = {};
        const title = $("#d-title").value.replace(/\s+/g, " ").trim();
        if (!title) { status.textContent = "Give it a title first."; return; }
        if (title !== name) changes.title = title;
        if (type !== (n.meta.type || "note")) changes.type = type;
        if ($("#d-body").value.trim() !== n.body.trim()) changes.body = $("#d-body").value.trim();
        const same = (a, b) => a.join("|") === b.join("|");
        [["categories", "#d-cats", names(n.meta.categories)], ["tags", "#d-tags", list(n.meta.tags)],
         ["people", "#d-people", names(n.meta.people)], ["projects", "#d-projects", names(n.meta.projects)],
         ["places", "#d-places", names(n.meta.places)]].forEach(([k, id, old]) => {
          const v = csv($(id).value);
          if (!same(v, old)) changes[k] = v;
        });
        if (isTodo && $("#d-done").checked !== !!n.meta.done) changes.done = $("#d-done").checked;
        if (!Object.keys(changes).length) { status.textContent = "Nothing changed."; return; }
        $("#d-save").disabled = true;
        status.textContent = "Saving…";
        try {
          const newPath = await Vault.updateNote(path, changes);
          showDetail(newPath, "Saved.", from);
        } catch (e) {
          console.error(e);
          $("#d-save").disabled = false;
          status.textContent = e && e.code === "offline" ? "Can't reach the server. Try again." : "Couldn't save. Try again.";
        }
      };

      // Delete (tap twice)
      let armed = false;
      $("#d-delete").onclick = async () => {
        if (!armed) { armed = true; $("#d-delete").textContent = "Tap again to delete"; return; }
        try {
          await Vault.deleteNote(path);
          if (from && from !== "brain") location.hash = from;
          else showList();
        }
        catch (e) { console.error(e); status.textContent = "Couldn't delete. Try again."; }
      };

      // Where it came from: the original words (and recording)
      const src = Vault.unlink(n.meta.source);
      if (src) drawSource($("#d-source"), src);

      await drawConnections(path, n);
    }

    async function drawSource(box, srcName) {
      const rawText = await Vault.read(`raw/${srcName}.md`);
      if (rawText == null) return;
      const r = Vault.parse(rawText);
      const words = (r.body.split(/## (?:Transcript|Text)\n/)[1] || "").split("\n## ")[0].trim();
      box.innerHTML = `
        <h2 class="section-title">Source</h2>
        <div class="note-card" style="--c:var(--t-raw)">
          <span class="type-pill">Original</span>
          <span class="note-title">${esc(r.title || "Original")}</span>
          <blockquote class="source-quote b-quote"></blockquote>
          <button class="chip" type="button" id="d-open-raw">Open original</button>
        </div>`;
      box.querySelector(".b-quote").textContent = words.startsWith("_") ? "Transcript not available yet." : words;
      const audio = Vault.unlink(r.meta.audio);
      if (audio) {
        const p = AudioPlayer.create({ load: () => Vault.readAudio(`audio/${audio}`), label: "original recording" });
        box.querySelector(".b-quote").after(p.el);
      }
      box.querySelector("#d-open-raw").onclick = () => showDetail(`raw/${srcName}.md`);
    }

    // ---------- Connections: small graph + lists ----------
    async function drawConnections(path, n) {
      const name = Vault.baseName(path);
      const files = await Vault.list();
      const byName = new Map(files.filter((f) => typeof f.data === "string").map((f) => [Vault.baseName(f.path), f]));
      const back = (await Vault.backlinks(name)).filter((b) => b.folder !== "raw" || b.name === Vault.unlink(n.meta.source));
      const hubs = [
        ...names(n.meta.categories).map((x) => ({ name: x, kind: "Category" })),
        ...names(n.meta.people).map((x) => ({ name: x, kind: "Person" })),
        ...names(n.meta.projects).map((x) => ({ name: x, kind: "Project" })),
        ...names(n.meta.places).map((x) => ({ name: x, kind: "Place" })),
      ];

      // Neighbors for the graph (one step out from this note)
      const nodes = new Map();
      const add = (nm, kind) => { if (nm && nm !== name && !nodes.has(nm)) nodes.set(nm, kind); };
      n.relatedAi.forEach((r) => add(r.title, "link"));
      n.relatedUser.forEach((r) => add(r.title, "link"));
      back.forEach((b) => add(b.name, b.folder === "raw" ? "raw" : "link"));
      hubs.forEach((h) => add(h.name, "hub"));
      drawGraph(el.querySelector("#d-graph"), name, [...nodes.entries()].slice(0, 14), byName);

      // Lists
      const box = el.querySelector("#d-links");
      box.innerHTML = "";
      const section = (title) => {
        const s = document.createElement("div");
        s.className = "list b-links";
        s.innerHTML = `<p class="b-links-title">${esc(title)}</p>`;
        box.appendChild(s);
        return s;
      };
      const linkRow = (target, why, onRemove, badge) => {
        const row = document.createElement("div");
        row.className = "row b-link-row";
        const open = document.createElement("button");
        open.type = "button";
        open.className = "b-link-open";
        open.innerHTML = `<span class="row-name"></span><span class="row-sub"></span>`;
        open.querySelector(".row-name").textContent = target;
        open.querySelector(".row-sub").textContent = [why, badge].filter(Boolean).join(" · ");
        open.onclick = () => { const f = byName.get(target); if (f) showDetail(f.path); };
        row.appendChild(open);
        if (onRemove) {
          const x = document.createElement("button");
          x.type = "button";
          x.className = "b-x";
          x.setAttribute("aria-label", `Remove link to ${target}`);
          x.textContent = "×";
          x.onclick = async () => { try { await onRemove(); showDetail(path, "Link removed."); } catch (e) { console.error(e); } };
          row.appendChild(x);
        }
        return row;
      };

      if (n.relatedAi.length) {
        const s = section("Linked by AI");
        n.relatedAi.forEach((r) => s.appendChild(linkRow(r.title, r.why, () => Vault.removeAiLink(path, r.title), "AI")));
      }
      if (n.relatedUser.length) {
        const s = section("Your links");
        n.relatedUser.forEach((r) => s.appendChild(linkRow(r.title, r.why, () => Vault.removeUserLink(path, r.title))));
      }
      const backNotes = back.filter((b) => Vault.NOTE_FOLDERS.includes(b.folder));
      if (backNotes.length) {
        const s = section("Linked from");
        backNotes.forEach((b) => s.appendChild(linkRow(b.name, "")));
      }
      if (hubs.length) {
        const s = section("Part of");
        hubs.forEach((h) => s.appendChild(linkRow(h.name, h.kind + (byName.has(h.name) ? "" : " (hub appears once it has more notes)"))));
      }

      // Add a link yourself
      const others = files.filter((f) => typeof f.data === "string" && Vault.NOTE_FOLDERS.includes(Vault.folderOf(f.path)) && Vault.baseName(f.path) !== name);
      const addBox = document.createElement("div");
      addBox.className = "list b-links b-add";
      addBox.innerHTML = `
        <p class="b-links-title">Link another note</p>
        <label class="sr-only" for="d-link-to">Note to link</label>
        <input class="field" id="d-link-to" list="d-link-options" placeholder="Start typing a note's title">
        <datalist id="d-link-options">${others.map((f) => `<option value="${esc(Vault.baseName(f.path))}">`).join("")}</datalist>
        <label class="sr-only" for="d-link-why">Why they connect</label>
        <input class="field" id="d-link-why" placeholder="Why they connect (optional)">
        <button class="pill-btn" type="button" id="d-link-add">Add link</button>`;
      box.appendChild(addBox);
      addBox.querySelector("#d-link-add").onclick = async () => {
        const target = addBox.querySelector("#d-link-to").value.trim();
        if (!byName.has(target)) { el.querySelector("#d-status").textContent = ""; addBox.querySelector("#d-link-to").focus(); addBox.querySelector("#d-link-to").setCustomValidity("Pick a note from the list"); addBox.querySelector("#d-link-to").reportValidity(); return; }
        try {
          await Vault.addUserLink(path, target, addBox.querySelector("#d-link-why").value);
          showDetail(path, "Link added.");
        } catch (e) { console.error(e); }
      };
      addBox.querySelector("#d-link-to").addEventListener("input", (e) => e.target.setCustomValidity(""));
    }

    // Small, still graph: this note in the middle, its neighbors around it.
    function drawGraph(box, center, nodes, byName) {
      const W = 340, H = 280, cx = W / 2, cy = H / 2, R = 104;
      if (!nodes.length) {
        box.innerHTML = `<p class="b-graph-empty">No connections yet. Link a note below, or capture more thoughts.</p>`;
        return;
      }
      const ns = "http://www.w3.org/2000/svg";
      const svg = document.createElementNS(ns, "svg");
      svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
      svg.setAttribute("class", "b-graph");
      svg.setAttribute("role", "img");
      svg.setAttribute("aria-label", `${center} and ${nodes.length} connected notes`);
      const short = (s) => (s.length > 18 ? s.slice(0, 17) + "…" : s);
      const pos = nodes.map((_, i) => {
        const a = -Math.PI / 2 + (i / nodes.length) * Math.PI * 2;
        return [cx + Math.cos(a) * R, cy + Math.sin(a) * R * 0.86];
      });
      nodes.forEach(([nm, kind], i) => {
        const line = document.createElementNS(ns, "line");
        line.setAttribute("x1", cx); line.setAttribute("y1", cy);
        line.setAttribute("x2", pos[i][0]); line.setAttribute("y2", pos[i][1]);
        line.setAttribute("class", "b-edge" + (kind === "link" ? " is-link" : ""));
        svg.appendChild(line);
      });
      nodes.forEach(([nm, kind], i) => {
        const f = byName.get(nm);
        const meta = f ? Vault.parse(f.data).meta : {};
        const folder = f ? Vault.folderOf(f.path) : kind === "hub" ? "hubs" : "";
        const g = document.createElementNS(ns, "g");
        g.setAttribute("class", "b-node" + (f ? " is-open" : ""));
        g.setAttribute("transform", `translate(${pos[i][0]},${pos[i][1]})`);
        if (f) { g.setAttribute("tabindex", "0"); g.setAttribute("role", "button"); g.setAttribute("aria-label", `Open ${nm}`); }
        const dot = document.createElementNS(ns, "circle");
        dot.setAttribute("r", kind === "hub" ? 9 : 7);
        if (kind === "hub") { dot.setAttribute("fill", "#000"); dot.setAttribute("stroke", "#fff"); dot.setAttribute("stroke-width", "2"); }
        else dot.setAttribute("style", `fill:${colorOf(meta, folder)}`);
        const label = document.createElementNS(ns, "text");
        label.setAttribute("y", 22);
        label.setAttribute("text-anchor", "middle");
        label.textContent = short(nm);
        g.append(dot, label);
        if (f) {
          const open = () => showDetail(f.path);
          g.addEventListener("click", open);
          g.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
        }
        svg.appendChild(g);
      });
      const mid = document.createElementNS(ns, "g");
      mid.setAttribute("transform", `translate(${cx},${cy})`);
      mid.setAttribute("class", "b-node is-center");
      const c = document.createElementNS(ns, "circle");
      c.setAttribute("r", 13);
      const t = document.createElementNS(ns, "text");
      t.setAttribute("y", 30);
      t.setAttribute("text-anchor", "middle");
      t.textContent = short(center);
      mid.append(c, t);
      svg.appendChild(mid);
      box.innerHTML = "";
      box.appendChild(svg);
    }

    // ---------- A raw file (the original words) ----------
    function showRaw(path, text, from) {
      const r = Vault.parse(text);
      const words = (r.body.split(/## (?:Transcript|Text)\n/)[1] || "").split("\n## ")[0].trim();
      const made = Vault.links((r.body.split("## Notes made from this")[1] || ""));
      const backLabel = from === "todo" ? "‹ To-Do" : from === "graph" ? "‹ Graph" : from === "ask" ? "‹ Ask" : "‹ Second Brain";
      el.innerHTML = `
        <button class="row-back b-back" type="button" id="d-back">${backLabel}</button>
        <article class="b-detail" style="--c:var(--t-raw)">
          <span class="type-pill">Original</span>
          <h1 class="d-title-static">${esc(r.title || "Original")}</h1>
          <p class="d-meta">${esc(new Date(String(r.meta.created)).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }))} · saved word for word</p>
          <div id="r-player"></div>
          <blockquote class="source-quote b-quote"></blockquote>
        </article>
        <div id="r-made"></div>`;
      el.querySelector("#d-back").onclick = () => {
        if (from && from !== "brain") location.hash = from;
        else showList();
      };
      el.querySelector(".b-quote").textContent = words.startsWith("_") ? "Transcript not available yet." : words;
      const audio = Vault.unlink(r.meta.audio);
      if (audio) el.querySelector("#r-player").appendChild(AudioPlayer.create({ load: () => Vault.readAudio(`audio/${audio}`), label: "recording" }).el);
      if (made.length) {
        const s = document.createElement("div");
        s.className = "list b-links";
        s.innerHTML = `<p class="b-links-title">Notes made from this</p>`;
        made.forEach((m) => {
          const b = document.createElement("button");
          b.type = "button";
          b.className = "row";
          b.innerHTML = `<span class="row-name"></span><span class="row-right">›</span>`;
          b.querySelector(".row-name").textContent = m;
          b.onclick = async () => { const f = await Vault.findByName(m); if (f) showDetail(f.path, null, from); };
          s.appendChild(b);
        });
        el.querySelector("#r-made").appendChild(s);
      }
    }

    // ---------- A hub (category, person, project, place) ----------
    async function showHub(path, text, from) {
      const h = Vault.parse(text);
      const name = Vault.baseName(path);
      const back = (await Vault.backlinks(name)).filter((b) => Vault.NOTE_FOLDERS.includes(b.folder));
      const isEntity = h.meta.kind && h.meta.kind !== "category";
      const backLabel = from === "todo" ? "‹ To-Do" : from === "graph" ? "‹ Graph" : from === "ask" ? "‹ Ask" : "‹ Second Brain";
      el.innerHTML = `
        <button class="row-back b-back" type="button" id="d-back">${backLabel}</button>
        <article class="b-detail" style="--c:#FFFFFF">
          <span class="type-pill">${esc((h.meta.kind || "hub").replace(/^./, (c) => c.toUpperCase()))}</span>
          <h1 class="d-title-static">${esc(name)}</h1>
          <p class="d-meta">${esc(h.body)}</p>
          ${isEntity ? `
          <div class="d-field"><label class="d-label" for="h-aliases">Also called</label>
            <input class="field" id="h-aliases" value="${esc(list(h.meta.aliases).join(", "))}" placeholder="Mom, my mother"></div>
          <div class="d-actions"><button class="btn-primary" type="button" id="h-save">Save</button></div>
          <p class="capture-note" id="h-status" role="status" aria-live="polite"></p>` : ""}
        </article>
        <h2 class="section-title">${back.length} note${back.length === 1 ? "" : "s"} here</h2>
        <div class="list b-links" id="h-list"></div>`;
      el.querySelector("#d-back").onclick = () => {
        if (from && from !== "brain") location.hash = from;
        else showList();
      };
      const listEl = el.querySelector("#h-list");
      back.forEach((b) => {
        const row = document.createElement("button");
        row.type = "button";
        row.className = "row";
        row.innerHTML = `<span class="row-name"></span><span class="row-right">›</span>`;
        row.querySelector(".row-name").textContent = b.name;
        row.onclick = () => showDetail(b.path, null, from);
        listEl.appendChild(row);
      });
      if (isEntity) {
        el.querySelector("#h-save").onclick = async () => {
          try { await Vault.setAliases(name, csv(el.querySelector("#h-aliases").value)); el.querySelector("#h-status").textContent = "Saved. The AI will match these names to this note."; }
          catch (e) { console.error(e); el.querySelector("#h-status").textContent = "Couldn't save. Try again."; }
        };
      }
    }

    activeShowDetail = (p, flash, from) => showDetail(p, flash, from);
    if (pendingOpen) {
      const target = pendingOpen;
      pendingOpen = null;
      showDetail(target.path, null, target.from);
    } else {
      showList();
    }
  },
};
