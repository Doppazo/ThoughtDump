// Raw Files tab. Built in Phase 5.
window.Screens = window.Screens || {};
window.Screens.raw = {
  render(el) {
    el.innerHTML = `
      <h1 class="screen-title">Raw Files</h1>
      <p class="screen-sub">Everything you added, exactly as you added it.</p>
      <div class="placeholder">
        <span class="tag">Phase 5</span>
        <p>Transcripts, typed notes, and recordings you can play back.</p>
      </div>`;
  },
};
