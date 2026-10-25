// Capture tab (main screen): record, type, or upload.
// Flow: the original (and audio) is saved to raw/ and audio/, the AI turns the
// recording into accurate text, then the AI sorts it into notes in the vault.
// While recording, the browser's own speech-to-text shows live words on screen;
// the final text comes from the AI (or the live words if the AI is unavailable).
window.Screens = window.Screens || {};
window.Screens.capture = {
  render(el) {
    const SAMPLE = "ok so walking to class and I had this thought, what if there was an app that shows which dining hall has the shortest line right now. also I need to email professor lee about the group project deadline before friday. would students actually pay for laundry pickup or should it be free with ads? oh and remind me to start running 3 times a week again";
    const TYPE_LABEL = { idea: "Idea", note: "Thought", question: "Question", task: "To-do", reminder: "Reminder" };
    const MAX_REC_MS = 5 * 60 * 1000;      // keeps recordings under the 4 MB upload limit
    const MAX_UPLOAD = 4 * 1024 * 1024;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

    let mode = "idle";
    let rec = null, stream = null, chunks = [], started = 0, timer = null, discard = false;
    let live = null, liveFinal = "", liveText = "";

    const h = new Date().getHours();
    const part = h < 5 ? "tonight" : h < 12 ? "this morning" : h < 17 ? "this afternoon" : h < 22 ? "this evening" : "tonight";
    const HEADINGS = { idle: `What's on your mind ${part}?`, recording: "Listening…", typing: "Type it out", saving: "One moment…", result: "Got it." };

    el.innerHTML = `
      <div class="capture">
        <h1 class="capture-q" id="cap-q"></h1>
        <div id="cap-body"></div>
        <p class="capture-note" id="cap-note" role="status" aria-live="polite"></p>
        <input type="file" id="cap-file" accept="audio/*" hidden>
      </div>`;
    const q = el.querySelector("#cap-q");
    const body = el.querySelector("#cap-body");
    const note = el.querySelector("#cap-note");
    const fileInput = el.querySelector("#cap-file");
    const say = (msg) => { note.textContent = msg || ""; };

    const MIC = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>';
    const STOP = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="7" width="10" height="10" rx="2.5" fill="currentColor" stroke="none"/></svg>';
    const PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z" fill="currentColor" stroke="none"/></svg>';

    // ---------- Screens inside the Capture tab ----------
    function setMode(m, label) {
      mode = m;
      q.textContent = HEADINGS[m];
      if (m === "idle") {
        body.innerHTML = `
          <div class="ring-wrap">
            <div class="ring" aria-hidden="true"></div>
            <button class="rec" id="rec-btn" type="button" aria-label="Start recording">${MIC}</button>
            <span class="rec-label">Tap to record</span>
          </div>
          <div class="capture-alts">
            <button class="pill-btn" type="button" id="type-btn">Type instead</button>
            <button class="pill-btn" type="button" id="upload-btn">Upload a recording</button>
          </div>`;
        body.querySelector("#rec-btn").onclick = startRecording;
        body.querySelector("#type-btn").onclick = () => { say(""); setMode("typing"); };
        body.querySelector("#upload-btn").onclick = () => { say(""); fileInput.click(); };
      } else if (m === "recording") {
        body.innerHTML = `
          <div class="ring-wrap recording">
            <div class="ring" aria-hidden="true"></div>
            <button class="rec is-recording" id="rec-btn" type="button" aria-label="Stop and save recording">${STOP}</button>
            <span class="rec-label"><span id="rec-time">0:00</span> · Tap to stop</span>
          </div>
          <p class="live-text" id="live-text" aria-live="polite"></p>
          <div class="capture-alts"><button class="pill-btn" type="button" id="cancel-rec">Cancel</button></div>`;
        body.querySelector("#rec-btn").onclick = () => stopRecording(false);
        body.querySelector("#cancel-rec").onclick = () => stopRecording(true);
      } else if (m === "typing") {
        body.innerHTML = `
          <div class="type-card">
            <label class="sr-only" for="type-text">Type your thoughts</label>
            <textarea id="type-text" rows="8" placeholder="Type everything on your mind. Ideas, to-dos, questions, all mixed together. Don't organize it."></textarea>
            <div class="type-actions">
              <button class="pill-btn" type="button" id="sample-btn">Try a sample ramble</button>
              <span class="type-actions-end">
                <button class="pill-btn" type="button" id="type-cancel">Cancel</button>
                <button class="btn-primary" type="button" id="type-save">Save</button>
              </span>
            </div>
          </div>`;
        const ta = body.querySelector("#type-text");
        ta.focus();
        ta.addEventListener("keydown", (e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); saveTyped(); } });
        body.querySelector("#sample-btn").onclick = () => { ta.value = SAMPLE; ta.focus(); say("Sample loaded. Tap Save to see it get sorted."); };
        body.querySelector("#type-cancel").onclick = () => { say(""); setMode("idle"); };
        body.querySelector("#type-save").onclick = saveTyped;
      } else if (m === "saving") {
        body.innerHTML = `<div class="saving"><span class="spinner" aria-hidden="true"></span></div><p class="saving-label" id="saving-label"></p>`;
        progress(label || "Saving…");
      }
    }
    const progress = (t) => { const s = el.querySelector("#saving-label"); if (s) s.textContent = t; };

    // ---------- Live words while recording (browser speech-to-text) ----------
    function startLive() {
      liveFinal = ""; liveText = "";
      if (!SR) return;
      try {
        live = new SR();
        live.continuous = true;
        live.interimResults = true;
        live.lang = navigator.language || "en-US";
        live.onresult = (e) => {
          let interim = "";
          for (let i = e.resultIndex; i < e.results.length; i++) {
            const r = e.results[i];
            if (r.isFinal) liveFinal += r[0].transcript.trim() + " ";
            else interim += r[0].transcript;
          }
          liveText = (liveFinal + interim).trim();
          const t = el.querySelector("#live-text");
          if (t) t.textContent = liveText;
        };
        live.onerror = () => {};
        live.onend = () => { if (live && rec && rec.state === "recording") { try { live.start(); } catch {} } };
        live.start();
      } catch { live = null; }
    }
    function stopLive() { const l = live; live = null; if (l) { try { l.stop(); } catch {} } }

    // ---------- Recording ----------
    async function startRecording() {
      say("");
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !window.MediaRecorder) {
        say("Recording doesn't work in this browser. Try Chrome or Safari, or type instead.");
        return;
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (e) {
        say(e && e.name === "NotAllowedError" ? "Microphone access is blocked. Allow the microphone for this site in your browser settings, then try again."
          : e && e.name === "NotFoundError" ? "No microphone found on this device."
          : "Couldn't start the microphone. Try again.");
        return;
      }
      const type = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"].find((t) => MediaRecorder.isTypeSupported(t));
      try {
        rec = new MediaRecorder(stream, type ? { mimeType: type } : undefined);
        chunks = [];
        discard = false;
        rec.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data); };
        rec.onstop = onRecordingStopped;
        rec.start(1000);
      } catch (e) {
        console.warn("Recorder couldn't start:", e);
        stream.getTracks().forEach((t) => t.stop());
        rec = null;
        say("Couldn't start recording on this device. Try again, or type instead.");
        return;
      }
      started = Date.now();
      setMode("recording");
      startLive();
      timer = setInterval(() => {
        const s = Math.floor((Date.now() - started) / 1000);
        const t = el.querySelector("#rec-time");
        if (t) t.textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
        if (Date.now() - started > MAX_REC_MS) { say("Recordings stop at 5 minutes."); stopRecording(false); }
      }, 250);
    }
    function stopRecording(cancel) {
      if (!rec || rec.state === "inactive") return;
      discard = cancel;
      clearInterval(timer);
      stopLive();
      rec.stop();
      stream.getTracks().forEach((t) => t.stop());
    }
    async function onRecordingStopped() {
      if (discard) { setMode("idle"); say("Recording discarded."); return; }
      const mime = (rec && rec.mimeType) || "audio/webm";
      const blob = new Blob(chunks, { type: mime });
      if (Date.now() - started < 1000 || blob.size < 1000) { setMode("idle"); say("That was too short. Try again."); return; }
      const ext = mime.includes("mp4") ? "m4a" : mime.includes("ogg") ? "ogg" : "webm";
      await saveAudio({ kind: "voice", blob, ext, fallbackText: liveText });
    }
    // If you leave the tab mid-recording, keep what you said
    const onLeave = () => { if (rec && rec.state === "recording") stopRecording(false); };
    window.addEventListener("hashchange", onLeave, { once: true });

    // ---------- Upload ----------
    fileInput.addEventListener("change", async () => {
      const f = fileInput.files && fileInput.files[0];
      fileInput.value = "";
      if (!f) return;
      if (!/^audio\//.test(f.type) && !/\.(m4a|mp3|wav|webm|ogg|aac|flac|opus)$/i.test(f.name)) { say("That doesn't look like an audio file."); return; }
      if (f.size > MAX_UPLOAD) { say("That file is over 4 MB. Try a shorter recording (about 4 minutes)."); return; }
      const ext = (f.name.match(/\.([a-z0-9]+)$/i) || [, "m4a"])[1].toLowerCase();
      await saveAudio({ kind: "upload", blob: f, ext, fallbackText: "" });
    });

    // ---------- Saving: audio (voice or upload) ----------
    async function saveAudio({ kind, blob, ext, fallbackText }) {
      setMode("saving", "Turning your words into text…");
      let text = "", source = "ai", problem = "";
      try {
        const form = new FormData();
        form.append("audio", blob, `recording.${ext}`);
        const r = await Api.json("POST", "/api/transcribe", { body: form });
        text = String(r.transcript || "").trim();
      } catch (e) {
        console.warn("Transcription failed:", e);
        if (e.code === "auth") return expired();
      }
      if (!text && fallbackText) { text = fallbackText; source = "live"; }
      if (!text) problem = "Couldn't turn the recording into text, so it's saved as audio only.";
      try {
        progress("Saving your recording…");
        const raw = await Vault.saveRaw({ kind, audioBlob: blob, audioExt: ext, text });
        const sorted = text ? await sortIntoNotes(text, raw) : { notes: [] };
        showResult({ raw: { ...raw, kind, text, source }, ...sorted, problem: problem || sorted.problem });
      } catch (e) { failed(e, "idle"); }
    }

    // ---------- Saving: typed ----------
    async function saveTyped() {
      const ta = el.querySelector("#type-text");
      const text = ta ? ta.value.trim() : "";
      if (!text) { say("Type something first."); if (ta) ta.focus(); return; }
      say("");
      setMode("saving", "Saving your words…");
      try {
        const raw = await Vault.saveRaw({ kind: "typed", text });
        const sorted = await sortIntoNotes(text, raw);
        showResult({ raw: { ...raw, kind: "typed", text }, ...sorted });
      } catch (e) { failed(e, "typing", text); }
    }

    // ---------- The AI sorts the text into notes ----------
    async function sortIntoNotes(text, raw) {
      progress("Sorting your thoughts…");
      let res;
      try {
        res = await Api.json("POST", "/api/organize", { json: { text, context: await Vault.aiContext(text) } });
      } catch (e) {
        if (e.code === "auth") throw e;
        console.warn("Sorting failed:", e);
        return { notes: [], problem: "Saved word for word, but the AI couldn't sort it right now." };
      }
      const made = [];
      for (const t of res.thoughts || []) {
        let dupOf = null, revisits = t.revisits || undefined;
        const words = `${t.title} ${t.summary}`;
        if (Vault.FOLDER_FOR[t.type] === "todos") dupOf = await Vault.findDuplicateTodo(words);
        else if (!revisits) { const r = await Vault.findRevisit(words); if (r) revisits = r.name; }
        const path = await Vault.saveNote({ ...t, revisits, source: raw.name, skipHubs: true });
        made.push({ path, type: t.type, title: Vault.baseName(path), summary: t.summary, dupOf, revisits });
      }
      await Vault.syncHubs();
      await Vault.setMadeFrom(raw.path, made.map((m) => m.title));
      return { notes: made, usedAI: !!res.usedAI };
    }

    function failed(e, back, text) {
      console.error(e);
      if (e && e.code === "auth") return expired();
      setMode(back);
      if (back === "typing" && text) { const ta = el.querySelector("#type-text"); if (ta) ta.value = text; }
      say(e && e.code === "offline" ? "Can't reach the server. Check your connection and try again." : "Couldn't save. Try again.");
    }
    function expired() { say("Your sign-in expired. Sign in again."); setTimeout(() => Auth.signOut(), 1500); }

    // ---------- After saving: what went into the vault ----------
    function chip(label, icon) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "chip";
      b.innerHTML = `${icon || ""}<span></span>`;
      b.querySelector("span").textContent = label;
      return b;
    }
    let rawPlayer = null; // the podcast-style player for this capture's recording

    function showResult({ raw, notes, usedAI, problem }) {
      mode = "result";
      q.textContent = HEADINGS.result;
      body.innerHTML = "";
      const wrap = document.createElement("div");
      wrap.className = "result";

      // The original, word for word
      const rawCard = document.createElement("article");
      rawCard.className = "note-card";
      rawCard.style.setProperty("--c", "var(--t-raw)");
      rawCard.innerHTML = `<span class="type-pill"></span><h3 class="note-title"></h3><p class="note-sum"></p><div class="note-foot"></div>`;
      rawCard.querySelector(".type-pill").textContent = "Original";
      rawCard.querySelector(".note-title").textContent = { voice: "Voice note", typed: "Typed note", upload: "Uploaded recording" }[raw.kind];
      const snippet = raw.text ? `“${raw.text.length > 180 ? raw.text.slice(0, 180) + "…" : raw.text}”` : "";
      rawCard.querySelector(".note-sum").textContent = raw.audioPath
        ? (snippet || "Saved as audio.") + (raw.source === "live" ? " (from live words; the AI transcript wasn't available)" : "")
        : `Saved word for word, and ${notes.length} note${notes.length === 1 ? "" : "s"} made from it.`;
      rawPlayer = null;
      if (raw.audioPath) {
        rawPlayer = AudioPlayer.create({ load: () => Vault.readAudio(raw.audioPath), label: "recording" });
        rawCard.querySelector(".note-foot").replaceWith(rawPlayer.el);
      }
      wrap.appendChild(rawCard);

      notes.forEach((n) => wrap.appendChild(noteCard(n, raw)));

      const hintText = problem || (notes.length && usedAI === false ? "The AI wasn't available, so this used simple sorting. Add the Gemini key to turn on AI sorting." : "");
      if (hintText) {
        const hint = document.createElement("p");
        hint.className = "result-hint";
        hint.textContent = hintText;
        wrap.appendChild(hint);
      }
      const again = document.createElement("button");
      again.type = "button";
      again.className = "btn-primary btn-wide";
      again.textContent = "Capture another";
      again.onclick = () => { AudioPlayer.stopAll(); say(""); setMode("idle"); };
      wrap.appendChild(again);
      body.appendChild(wrap);
      say(notes.length ? `Saved ${notes.length + 1} files to your vault.` : "Saved to your vault.");
    }

    function noteCard(n, raw) {
      const card = document.createElement("article");
      card.className = "note-card";
      card.dataset.path = n.path;
      card.style.setProperty("--c", `var(--t-${n.type})`);
      card.innerHTML = `<span class="type-pill"></span><h3 class="note-title"></h3><p class="note-sum"></p><div class="note-foot"></div>`;
      card.querySelector(".type-pill").textContent = TYPE_LABEL[n.type] || "Note";
      card.querySelector(".note-title").textContent = n.title;
      card.querySelector(".note-sum").textContent = n.summary;
      const foot = card.querySelector(".note-foot");

      const ai = document.createElement("span");
      ai.className = "ai-badge";
      ai.textContent = "AI";
      ai.title = "Made by AI. You can edit it in the Brain tab (Phase 4).";
      foot.appendChild(ai);

      // Source: play the recording, or show the original words
      if (raw.audioPath) {
        // Source: jump up to the recording and play it
        const src = chip("Source", PLAY);
        src.onclick = () => {
          if (!rawPlayer) return;
          rawPlayer.el.scrollIntoView({ behavior: "smooth", block: "center" });
          rawPlayer.play().catch(() => say("Couldn't play that recording."));
        };
        foot.appendChild(src);
      } else {
        const src = chip("Source: your words");
        const quote = document.createElement("blockquote");
        quote.className = "source-quote";
        quote.hidden = true;
        quote.textContent = raw.text || "";
        src.onclick = () => { quote.hidden = !quote.hidden; };
        foot.appendChild(src);
        card.appendChild(quote);
      }

      if (n.revisits && !n.dupOf) {
        const p = document.createElement("p");
        p.className = "note-flag";
        p.textContent = `You've said something like this before: "${n.revisits}". It's linked.`;
        card.appendChild(p);
      }
      if (n.dupOf) {
        const box = document.createElement("div");
        box.className = "note-flag dup";
        const p = document.createElement("p");
        p.textContent = `Looks like a to-do you already have: "${n.dupOf.name}".`;
        const keep = chip("Keep both");
        const drop = chip("Remove this one");
        keep.onclick = () => box.remove();
        drop.onclick = async () => {
          try {
            await Vault.remove(n.path);
            const left = [...el.querySelectorAll(".note-card[data-path]")].map((c) => c.dataset.path).filter((x) => x !== n.path);
            await Vault.setMadeFrom(raw.path, left.map(Vault.baseName));
            card.remove();
            say("Removed the duplicate.");
          } catch (e) { console.error(e); say("Couldn't remove it. Try again."); }
        };
        const btns = document.createElement("div");
        btns.className = "note-foot";
        btns.append(keep, drop);
        box.append(p, btns);
        card.appendChild(box);
      }
      return card;
    }

    setMode("idle");
  },
};
