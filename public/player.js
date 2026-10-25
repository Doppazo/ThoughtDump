// Podcast-style audio player: play/pause, skip back/forward 15 seconds,
// drag to any moment, and change speed. Only one recording plays at a time.
window.AudioPlayer = (function () {
  let current = null;
  const fmt = (s) => {
    if (!isFinite(s) || s < 0) s = 0;
    s = Math.floor(s);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  };
  const ICON = {
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z" fill="currentColor" stroke="none"/></svg>',
    pause: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6.5" y="5" width="4" height="14" rx="1.2" fill="currentColor" stroke="none"/><rect x="13.5" y="5" width="4" height="14" rx="1.2" fill="currentColor" stroke="none"/></svg>',
    back: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4h4"/><text x="12" y="15.5" text-anchor="middle" font-size="7" font-weight="700" fill="currentColor" stroke="none" font-family="Inter, sans-serif">15</text></svg>',
    fwd: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12a8 8 0 1 1-2.4-5.7M20 4v4h-4"/><text x="12" y="15.5" text-anchor="middle" font-size="7" font-weight="700" fill="currentColor" stroke="none" font-family="Inter, sans-serif">15</text></svg>',
  };
  const SPEEDS = [1, 1.5, 2];

  // load: async () => Blob. Called the first time you press play or drag.
  function create({ load, label = "recording" }) {
    const el = document.createElement("div");
    el.className = "player";
    el.innerHTML = `
      <div class="pl-row">
        <button class="pl-skip" type="button" data-act="back" aria-label="Back 15 seconds">${ICON.back}</button>
        <button class="pl-play" type="button" data-act="play" aria-label="Play ${label}">${ICON.play}</button>
        <button class="pl-skip" type="button" data-act="fwd" aria-label="Forward 15 seconds">${ICON.fwd}</button>
        <button class="pl-speed" type="button" data-act="speed" aria-label="Playback speed">1×</button>
      </div>
      <input class="pl-scrub" type="range" min="0" max="1000" step="1" value="0" aria-label="Move through the ${label}">
      <div class="pl-times"><span class="pl-cur">0:00</span><span class="pl-dur">--:--</span></div>`;
    const $ = (s) => el.querySelector(s);
    const playBtn = $(".pl-play"), scrub = $(".pl-scrub"), cur = $(".pl-cur"), durEl = $(".pl-dur"), speedBtn = $(".pl-speed");
    const audio = new Audio();
    audio.preload = "metadata";
    let ready = null, dur = 0, dragging = false, speed = 0;

    // Recordings made in the browser often don't report their length until
    // you jump to the end once, so do that quietly.
    function realDuration() {
      if (isFinite(audio.duration) && audio.duration > 0) return Promise.resolve(audio.duration);
      return new Promise((resolve) => {
        let done = false;
        const finish = () => {
          if (done) return;
          done = true;
          audio.removeEventListener("durationchange", check);
          audio.currentTime = 0;
          resolve(isFinite(audio.duration) ? audio.duration : 0);
        };
        const check = () => { if (isFinite(audio.duration) && audio.duration > 0) finish(); };
        audio.addEventListener("durationchange", check);
        audio.currentTime = 1e7;
        setTimeout(finish, 2000);
      });
    }
    function ensure() {
      if (!ready) {
        ready = (async () => {
          const blob = await load();
          if (!blob) throw new Error("missing");
          audio.src = URL.createObjectURL(blob);
          await new Promise((res, rej) => { audio.onloadedmetadata = res; audio.onerror = () => rej(new Error("bad audio")); });
          dur = await realDuration();
          durEl.textContent = fmt(dur);
        })().catch((e) => { ready = null; durEl.textContent = "Couldn't load"; throw e; });
      }
      return ready;
    }
    function paint() {
      playBtn.innerHTML = audio.paused ? ICON.play : ICON.pause;
      playBtn.setAttribute("aria-label", (audio.paused ? "Play " : "Pause ") + label);
      el.classList.toggle("is-playing", !audio.paused);
    }
    function tick() {
      if (dragging) return;
      cur.textContent = fmt(audio.currentTime);
      if (dur) scrub.value = String(Math.round((audio.currentTime / dur) * 1000));
    }
    const api = {
      el,
      async play() {
        await ensure();
        if (current && current !== api) current.pause();
        current = api;
        await audio.play();
      },
      pause() { audio.pause(); },
      stop() { audio.pause(); },
    };
    const jump = async (sec) => {
      try { await ensure(); } catch { return; }
      audio.currentTime = Math.max(0, Math.min(dur || audio.duration || 0, audio.currentTime + sec));
      tick();
    };

    el.addEventListener("click", async (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      const act = b.dataset.act;
      try {
        if (act === "play") audio.paused ? await api.play() : api.pause();
        else if (act === "back") await jump(-15);
        else if (act === "fwd") await jump(15);
        else if (act === "speed") {
          speed = (speed + 1) % SPEEDS.length;
          audio.playbackRate = SPEEDS[speed];
          speedBtn.textContent = `${SPEEDS[speed]}×`;
        }
      } catch (err) { console.warn(err); }
    });
    scrub.addEventListener("input", () => {
      dragging = true;
      if (dur) cur.textContent = fmt((Number(scrub.value) / 1000) * dur);
    });
    scrub.addEventListener("change", async () => {
      try { await ensure(); } catch { dragging = false; return; }
      audio.currentTime = (Number(scrub.value) / 1000) * dur;
      dragging = false;
      tick();
    });
    audio.addEventListener("timeupdate", tick);
    audio.addEventListener("play", paint);
    audio.addEventListener("pause", paint);
    audio.addEventListener("ended", () => { paint(); audio.currentTime = 0; tick(); });
    return api;
  }

  return {
    create,
    stopAll() { if (current) current.stop(); },
  };
})();
