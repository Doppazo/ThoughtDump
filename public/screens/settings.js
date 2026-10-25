// Settings. For now: "Your vault" (peek at the saved files), download, and clear examples.
// More settings come in Phase 6.
window.Screens = window.Screens || {};
window.Screens.settings = {
  render(el) {
    const ABOUT = {
      raw: "Everything you added, word for word",
      audio: "Your voice recordings",
      ideas: "Ideas the AI found",
      thoughts: "Notes and questions",
      todos: "Tasks and reminders",
      hubs: "Categories, people, and projects (made automatically)",
    };
    let folder = null; // which folder is open
    let file = null;   // which file is open
    let audioUrl = null;

    el.innerHTML = `
      <h1 class="screen-title">Settings</h1>
      <p class="screen-sub">Manage your vault files, downloads, and account.</p>
      <h2 class="section-title">Account</h2>
      <div class="list">
        <div class="row" style="cursor:default"><span class="row-main"><span class="row-name" id="acct-name"></span><span class="row-sub" id="acct-sub"></span></span></div>
        <button class="row" type="button" id="signout-btn"><span class="row-main"><span class="row-name">Sign out</span></span><span class="row-right">→</span></button>
      </div>
      <h2 class="section-title">Your vault</h2>
      <p class="section-sub" id="vault-sub">Your notes are saved as .md files in folders, like Obsidian.</p>
      <div class="list" id="vault-view"></div>
      <div class="list list-actions">
        <button class="row" type="button" id="dl-btn"><span class="row-main"><span class="row-name">Download as Obsidian vault</span><span class="row-sub">A .zip you can open in Obsidian. Your notes are yours.</span></span><span class="row-right">↓</span></button>
        <button class="row" type="button" id="clear-btn"><span class="row-main"><span class="row-name">Clear example notes</span><span class="row-sub" id="clear-sub">Removes the demo notes. Your own notes stay.</span></span><span class="row-right">×</span></button>
      </div>
      <p class="capture-note" id="settings-note" role="status" aria-live="polite"></p>`;
    const view = el.querySelector("#vault-view");
    const note = el.querySelector("#settings-note");

    // Account
    const u = Auth.user || {};
    el.querySelector("#acct-name").textContent = u.guest ? "Guest" : (u.name || u.email || "Signed in");
    el.querySelector("#acct-sub").textContent = u.demo ? "Test mode on this device"
      : u.guest ? "Guest account: sign-in isn't linked to an email" : (u.email || "");
    el.querySelector("#vault-sub").textContent = Vault.cloud
      ? "Your notes are saved as .md files in folders, like Obsidian, in your account. Log in on any device to see them."
      : "Your notes are saved as .md files in folders, like Obsidian. Test mode: they're kept on this computer's server and reset when it restarts.";
    el.querySelector("#signout-btn").addEventListener("click", () => Auth.signOut());

    function row(label, right, onClick, sub) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "row";
      const left = document.createElement("span");
      left.className = "row-main";
      const name = document.createElement("span");
      name.className = "row-name";
      name.textContent = label;
      left.appendChild(name);
      if (sub) { const s = document.createElement("span"); s.className = "row-sub"; s.textContent = sub; left.appendChild(s); }
      const r = document.createElement("span");
      r.className = "row-right";
      r.textContent = right;
      b.append(left, r);
      b.addEventListener("click", onClick);
      return b;
    }
    function back(label, onClick) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "row row-back";
      b.textContent = "‹ " + label;
      b.addEventListener("click", onClick);
      return b;
    }

    async function draw() {
      if (audioUrl) { URL.revokeObjectURL(audioUrl); audioUrl = null; }
      view.innerHTML = "";
      if (!folder) {
        const all = await Vault.list();
        Vault.FOLDERS.forEach((f) => {
          const n = all.filter((x) => Vault.folderOf(x.path) === f).length;
          view.appendChild(row(f + "/", `${n} ›`, () => { folder = f; draw(); }, ABOUT[f]));
        });
        return;
      }
      if (!file) {
        view.appendChild(back("All folders", () => { folder = null; draw(); }));
        const files = await Vault.list(folder);
        if (!files.length) {
          const p = document.createElement("p");
          p.className = "row-empty";
          p.textContent = {
            audio: "No recordings yet. Record one on the Capture tab.",
            hubs: "Hub notes appear once 3 notes share a category, or a person or project comes up twice.",
          }[folder] || "Nothing here yet.";
          view.appendChild(p);
        }
        files.forEach((f) => view.appendChild(row(f.path.split("/").pop(), "›", () => { file = f.path; draw(); })));
        return;
      }
      view.appendChild(back(folder + "/", () => { file = null; draw(); }));
      const cap = document.createElement("p");
      cap.className = "row-sub md-cap";
      cap.textContent = file;
      view.appendChild(cap);
      if (folder === "audio") {
        const path = file;
        const p = AudioPlayer.create({ load: () => Vault.readAudio(path), label: "recording" });
        p.el.classList.add("md-audio");
        view.appendChild(p.el);
        return;
      }
      const pre = document.createElement("pre");
      pre.className = "md-view";
      pre.textContent = (await Vault.read(file)) || "";
      view.appendChild(pre);
    }
    draw();

    // Download everything as a .zip that Obsidian can open
    el.querySelector("#dl-btn").addEventListener("click", async () => {
      note.textContent = "Packing your vault…";
      try {
        const blob = await Vault.exportZip();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "Thought Dump vault.zip";
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 5000);
        note.textContent = "Downloaded. Unzip it, then in Obsidian choose 'Open folder as vault'.";
      } catch (e) {
        console.error(e);
        note.textContent = "Couldn't make the download. Try again.";
      }
    });

    // Clear example notes (tap twice, so it can't happen by accident)
    let armed = false;
    el.querySelector("#clear-btn").addEventListener("click", async () => {
      const sub = el.querySelector("#clear-sub");
      if (!armed) { armed = true; sub.textContent = "Tap again to remove the example notes."; return; }
      armed = false;
      const n = await Vault.clearExamples();
      sub.textContent = "Removes the demo notes. Your own notes stay.";
      note.textContent = n ? `Removed ${n} example files.` : "No example notes left.";
      folder = null; file = null;
      draw();
    });
  },
};
