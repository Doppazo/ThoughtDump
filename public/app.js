// Draws the floating tab bar and the gear, and shows one screen at a time.
(function () {
  // The 5 tabs, in order: Ask, Brain, Capture (accentuated center), To-Do, Graph.
  // "id" must match a file in screens/.
  // "color" is the tab's highlight color (set in styles.css).
  const TABS = [
    { id: "ask",     label: "Ask",     color: "var(--c-ask)",     icon: '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>' },
    { id: "brain",   label: "Brain",   color: "var(--c-brain)",   icon: '<rect x="3.5" y="3.5" width="7" height="7" rx="2"/><rect x="13.5" y="3.5" width="7" height="7" rx="2"/><rect x="3.5" y="13.5" width="7" height="7" rx="2"/><rect x="13.5" y="13.5" width="7" height="7" rx="2"/>' },
    { id: "capture", label: "Capture", color: "var(--c-capture)", icon: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>' },
    { id: "todo",    label: "To-Do",   color: "var(--c-todo)",    icon: '<rect x="3.5" y="3.5" width="17" height="17" rx="4"/><path d="M8 12l3 3 5-6"/>' },
    { id: "graph",   label: "Graph",   color: "var(--c-graph)",   icon: '<circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="12" cy="18" r="2.5"/><path d="M8 7.5l8 9M16 7.5l-8 9M8.5 6h7"/>' },
  ];
  const GEAR = '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>';
  const CLOSE = '<path d="M6 6l12 12M18 6L6 18"/>';
  const DEFAULT = "capture";
  const screenEl = document.getElementById("screen");
  const barEl = document.getElementById("tabbar");
  const gearEl = document.getElementById("gear");
  let lastTab = DEFAULT; // where the gear's X takes you back to

  // Build the tab buttons once
  TABS.forEach((t) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "tab";
    b.dataset.tab = t.id;
    b.style.setProperty("--tab-color", t.color);
    if (t.id === "capture") {
      b.classList.add("tab-accent");
      b.innerHTML = `<div class="tab-accent-circle"><svg viewBox="0 0 24 24" aria-hidden="true">${t.icon}</svg></div><span>${t.label}</span>`;
    } else {
      b.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${t.icon}</svg><span>${t.label}</span>`;
    }
    b.addEventListener("click", () => { location.hash = t.id; });
    barEl.appendChild(b);
  });

  // Gear opens Settings; on Settings it turns into an X that closes it
  gearEl.addEventListener("click", () => {
    location.hash = location.hash === "#settings" ? lastTab : "settings";
  });

  // Show the screen named in the address bar (#capture, #brain, #settings ...)
  function show() {
    const raw = location.hash.slice(1);
    const [id, queryStr] = raw.split("?");
    const valid = TABS.some((t) => t.id === id) || id === "settings";
    const current = valid ? id : DEFAULT;
    if (current !== "settings") lastTab = current;

    barEl.querySelectorAll(".tab").forEach((b) => {
      if (b.dataset.tab === current) b.setAttribute("aria-current", "page");
      else b.removeAttribute("aria-current");
    });
    const onSettings = current === "settings";
    gearEl.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${onSettings ? CLOSE : GEAR}</svg>`;
    gearEl.setAttribute("aria-label", onSettings ? "Close settings" : "Settings");
    gearEl.setAttribute("aria-pressed", String(onSettings));

    AudioPlayer.stopAll(); // don't keep playing on a screen you left
    screenEl.innerHTML = "";
    const screen = window.Screens && window.Screens[current];
    if (screen) {
      if (current === "brain" && queryStr) {
        const params = new URLSearchParams(queryStr);
        const note = params.get("note");
        if (note && window.Screens.brain?.open) {
          window.Screens.brain.open(note, { from: params.get("from") || "brain" });
          return;
        }
      }
      screen.render(screenEl);
    }
    window.scrollTo(0, 0);
  }

  // ---------- Signed in or not ----------
  let openFor = null; // whose vault is open
  async function route() {
    const user = Auth.user;
    document.body.classList.toggle("signed-out", !user);
    if (!user) {
      openFor = null;
      Vault.reset();
      screenEl.innerHTML = "";
      Screens.signin.render(screenEl);
      return;
    }
    if (openFor === user.uid) return;
    openFor = user.uid;
    Vault.reset();
    screenEl.innerHTML = `<div class="saving"><span class="spinner" aria-hidden="true"></span></div><p class="capture-note" style="text-align:center">Opening your vault…</p>`;
    try {
      await Vault.seedIfEmpty(); // a brand-new account starts with example notes
      show();
    } catch (e) {
      console.error("Couldn't open the vault", e);
      openFor = null;
      if (e.code === "auth") {
        await Auth.signOut();
        return;
      }
      screenEl.innerHTML = `<div class="signin"><p class="signin-msg"></p><button class="btn-primary" type="button" id="retry-btn">Try again</button></div>`;
      screenEl.querySelector(".signin-msg").textContent = e.message || "Couldn't open your vault.";
      screenEl.querySelector("#retry-btn").onclick = () => route();
    }
  }

  window.App = {
    openNote(path, opts) {
      if (window.Screens?.brain?.open) {
        window.Screens.brain.open(path, opts);
      } else {
        location.hash = "brain";
      }
    },
  };

  window.addEventListener("hashchange", () => { if (Auth.user && openFor) show(); });
  Auth.onChange(route);
  Auth.ready.then(route);
})();
