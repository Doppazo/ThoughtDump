// Sign-in. Uses Firebase login (Google, email, or guest) once Firebase is set up.
// Until then: a demo mode with one local guest per device (for testing only).
(function () {
  const DEMO_KEY = "thoughtdump.demoUser";
  const FB = "https://www.gstatic.com/firebasejs/11.3.0/";
  const listeners = [];
  let user = null;
  let fbAuth = null;
  let configured = false;

  const emit = () => listeners.forEach((f) => { try { f(user); } catch (e) { console.error(e); } });
  const store = {
    get() { try { return JSON.parse(localStorage.getItem(DEMO_KEY) || "null"); } catch { return null; } },
    set(v) { try { v ? localStorage.setItem(DEMO_KEY, JSON.stringify(v)) : localStorage.removeItem(DEMO_KEY); } catch {} },
  };
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src;
      s.onload = resolve;
      s.onerror = () => reject(new Error("Couldn't load " + src));
      document.head.appendChild(s);
    });
  }
  const fromFirebase = (u) => u ? { uid: u.uid, email: u.email, name: u.displayName || u.email || "Guest", guest: u.isAnonymous } : null;

  const ready = (async () => {
    let cfg = null;
    try { cfg = (await (await fetch("/api/config")).json()).firebase; } catch {}
    if (cfg) {
      try {
        await loadScript(FB + "firebase-app-compat.js");
        await loadScript(FB + "firebase-auth-compat.js");
        firebase.initializeApp(cfg);
        fbAuth = firebase.auth();
        configured = true;
        try { await fbAuth.getRedirectResult(); } catch (e) { console.warn(e); }
        await new Promise((resolve) => {
          fbAuth.onAuthStateChanged((u) => { user = fromFirebase(u); resolve(); emit(); });
        });
        return;
      } catch (e) {
        console.error("Firebase sign-in couldn't start:", e);
      }
    }
    user = store.get();
  })();

  // Friendly messages for common sign-in problems
  function errorMessage(e) {
    const code = (e && e.code) || "";
    return ({
      "auth/invalid-email": "That email doesn't look right.",
      "auth/missing-password": "Enter a password.",
      "auth/weak-password": "Use at least 6 characters for the password.",
      "auth/email-already-in-use": "There's already an account with that email. Sign in instead.",
      "auth/invalid-credential": "Wrong email or password.",
      "auth/wrong-password": "Wrong email or password.",
      "auth/user-not-found": "No account with that email. Create one instead.",
      "auth/too-many-requests": "Too many tries. Wait a minute and try again.",
      "auth/popup-closed-by-user": "Sign-in window was closed.",
      "auth/operation-not-allowed": "This sign-in method isn't turned on in Firebase yet.",
      "auth/admin-restricted-operation": "Guest sign-in isn't turned on in Firebase yet.",
      "auth/network-request-failed": "No internet connection.",
    })[code] || "Couldn't sign in. Try again.";
  }

  window.Auth = {
    ready,
    get user() { return user; },
    get configured() { return configured; },
    onChange(f) { listeners.push(f); },
    async signInGoogle() {
      const provider = new firebase.auth.GoogleAuthProvider();
      try { await fbAuth.signInWithPopup(provider); }
      catch (e) {
        if (e && (e.code === "auth/popup-blocked" || e.code === "auth/operation-not-supported-in-this-environment")) await fbAuth.signInWithRedirect(provider);
        else throw e;
      }
    },
    signInEmail: (email, pass) => fbAuth.signInWithEmailAndPassword(email, pass),
    signUpEmail: (email, pass) => fbAuth.createUserWithEmailAndPassword(email, pass),
    async continueAsGuest() {
      if (configured) { await fbAuth.signInAnonymously(); return; }
      user = { uid: "local" + Math.random().toString(36).slice(2, 12), name: "Guest", guest: true, demo: true };
      store.set(user);
      emit();
    },
    async signOut() {
      store.set(null);
      if (fbAuth) await fbAuth.signOut();
      user = null;
      emit();
    },
    async token() {
      if (fbAuth && fbAuth.currentUser) return fbAuth.currentUser.getIdToken();
      if (user && user.demo) return "demo-token-" + user.uid;
      const e = new Error("Not signed in");
      e.code = "auth";
      throw e;
    },
    errorMessage,
  };
})();
