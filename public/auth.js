// Sign-in. Uses Supabase login (Google, email, or guest) once Supabase is set up.
// Until then: a demo mode with one local guest per device (for offline testing).
(function () {
  const DEMO_KEY = "thoughtdump.demoUser";
  const SUPABASE_CDN = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
  const listeners = [];
  let user = null;
  let sbClient = null;
  let configured = false;

  const emit = () => listeners.forEach((f) => { try { f(user); } catch (e) { console.error(e); } });
  const store = {
    get() { try { return JSON.parse(localStorage.getItem(DEMO_KEY) || "null"); } catch { return null; } },
    set(v) { try { v ? localStorage.setItem(DEMO_KEY, JSON.stringify(v)) : localStorage.removeItem(DEMO_KEY); } catch {} },
  };

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) return resolve();
      const s = document.createElement("script");
      s.src = src;
      s.onload = resolve;
      s.onerror = () => reject(new Error("Couldn't load " + src));
      document.head.appendChild(s);
    });
  }

  const fromSupabase = (u) => {
    if (!u) return null;
    const name = u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split("@")[0] || "User";
    return {
      uid: u.id,
      email: u.email || "",
      name: u.is_anonymous ? "Guest" : name,
      guest: Boolean(u.is_anonymous),
    };
  };

  const ready = (async () => {
    let cfg = null;
    try {
      const res = await (await fetch("/api/config")).json();
      cfg = res.supabase;
    } catch {}

    if (cfg && cfg.url && cfg.anonKey) {
      try {
        await loadScript(SUPABASE_CDN);
        const { createClient } = window.supabase;
        sbClient = createClient(cfg.url, cfg.anonKey);
        configured = true;

        // Check active session
        const { data: { session } } = await sbClient.auth.getSession();
        user = fromSupabase(session?.user);

        // Listen for auth changes
        sbClient.auth.onAuthStateChange((_event, session) => {
          user = fromSupabase(session?.user);
          emit();
        });

        emit();
        return;
      } catch (e) {
        console.error("Supabase sign-in couldn't start:", e);
      }
    }

    user = store.get();
  })();

  // Friendly messages for common sign-in problems
  function errorMessage(e) {
    const msg = (e && (e.message || e.error_description)) || "";
    if (/invalid login credentials|invalid email or password/i.test(msg)) {
      return "Wrong email or password.";
    }
    if (/email not confirmed/i.test(msg)) {
      return "Please confirm your email address or check your inbox.";
    }
    if (/user already registered/i.test(msg)) {
      return "An account with that email already exists. Sign in instead.";
    }
    if (/password should be at least/i.test(msg)) {
      return "Password must be at least 6 characters.";
    }
    return msg || "Couldn't sign in. Try again.";
  }

  window.Auth = {
    ready,
    get user() { return user; },
    get configured() { return configured; },
    onChange(f) { listeners.push(f); },
    async signInGoogle() {
      if (!sbClient) throw new Error("Supabase is not configured.");
      const { error } = await sbClient.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    },
    async signInEmail(email, pass) {
      if (!sbClient) throw new Error("Supabase is not configured.");
      const { data, error } = await sbClient.auth.signInWithPassword({
        email,
        password: pass,
      });
      if (error) throw error;
      return data;
    },
    async signUpEmail(email, pass) {
      if (!sbClient) throw new Error("Supabase is not configured.");
      const { data, error } = await sbClient.auth.signUp({
        email,
        password: pass,
      });
      if (error) throw error;
      return data;
    },
    async continueAsGuest() {
      if (configured && sbClient) {
        const { error } = await sbClient.auth.signInAnonymously();
        if (error) throw error;
        return;
      }
      user = { uid: "local" + Math.random().toString(36).slice(2, 12), name: "Guest", guest: true, demo: true };
      store.set(user);
      emit();
    },
    async signOut() {
      store.set(null);
      if (sbClient) {
        await sbClient.auth.signOut();
      }
      user = null;
      emit();
    },
    async token() {
      if (sbClient) {
        const { data: { session } } = await sbClient.auth.getSession();
        if (session && session.access_token) return session.access_token;
      }
      if (user && user.demo) return "demo-token-" + user.uid;
      const e = new Error("Not signed in");
      e.code = "auth";
      throw e;
    },
    errorMessage,
  };
})();
