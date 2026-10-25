// Sign-in screen (shown before the tabs when nobody is signed in).
window.Screens = window.Screens || {};
window.Screens.signin = {
  render(el) {
    const cloud = Auth.configured;
    el.innerHTML = `
      <div class="signin">
        <h1 class="signin-title">Thought Dump</h1>
        <p class="signin-sub">Say it messy. Your second brain sorts it.</p>
        ${cloud ? `
        <div class="signin-card">
          <button class="btn-primary btn-wide" type="button" id="google-btn">Continue with Google</button>
          <div class="signin-or"><span>or</span></div>
          <label class="sr-only" for="si-email">Email</label>
          <input class="field" id="si-email" type="email" autocomplete="email" placeholder="you@school.edu">
          <label class="sr-only" for="si-pass">Password</label>
          <input class="field" id="si-pass" type="password" autocomplete="current-password" placeholder="Password">
          <div class="signin-row">
            <button class="pill-btn" type="button" id="signup-btn">Create account</button>
            <button class="pill-btn pill-strong" type="button" id="signin-btn">Sign in</button>
          </div>
        </div>
        <button class="link-btn" type="button" id="guest-btn">Try it without an account</button>
        ` : `
        <div class="signin-card">
          <p class="signin-note">Accounts aren't connected yet, so this is a test mode. Notes are kept on this computer's server until it restarts.</p>
          <button class="btn-primary btn-wide" type="button" id="guest-btn">Start</button>
        </div>`}
        <p class="signin-msg" id="si-msg" role="alert" aria-live="polite"></p>
        <p class="signin-privacy">Your notes are sent to Google's Gemini AI only to sort them and answer your questions.</p>
      </div>`;

    const msg = el.querySelector("#si-msg");
    const busy = (on) => el.querySelectorAll("button").forEach((b) => { b.disabled = on; });
    async function run(fn) {
      msg.textContent = "";
      busy(true);
      try { await fn(); }
      catch (e) { console.warn(e); msg.textContent = Auth.errorMessage(e); }
      finally { busy(false); }
    }
    const val = (id) => (el.querySelector(id) || {}).value || "";

    el.querySelector("#guest-btn").onclick = () => run(() => Auth.continueAsGuest());
    if (cloud) {
      el.querySelector("#google-btn").onclick = () => run(() => Auth.signInGoogle());
      el.querySelector("#signin-btn").onclick = () => run(() => Auth.signInEmail(val("#si-email").trim(), val("#si-pass")));
      el.querySelector("#signup-btn").onclick = () => run(() => Auth.signUpEmail(val("#si-email").trim(), val("#si-pass")));
      el.querySelector("#si-pass").addEventListener("keydown", (e) => { if (e.key === "Enter") el.querySelector("#signin-btn").click(); });
    }
  },
};
