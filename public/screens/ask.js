// Ask Tab (Phase 6).
// Chat interface that answers questions using only the user's saved vault notes.
// Direct citations in brackets [Note Title] turn into tappable links, and
// sources used are listed as interactive chips that open the note in the Brain screen.
(function () {
  window.Screens = window.Screens || {};

  const SUGGESTIONS = [
    "What should I focus on first this week?",
    "Summarize my business ideas",
    "What tasks or reminders are pending?",
    "What questions haven't I answered yet?",
  ];

  const TYPE_COLORS = {
    idea: "var(--t-idea)",
    note: "var(--t-note)",
    question: "var(--t-question)",
    task: "var(--t-task)",
    reminder: "var(--t-reminder)",
    raw: "var(--t-raw)",
  };

  // In-memory conversation history during the session
  const history = [];

  window.Screens.ask = {
    render(el) {
      el.innerHTML = `
        <div class="ask-screen">
          <div>
            <h1 class="screen-title">Ask</h1>
            <p class="screen-sub">Ask anything about what you've saved in your second brain.</p>
          </div>

          <!-- Suggested prompt pills -->
          <div class="ask-prompts" id="ask-prompts-sec">
            <span class="ask-prompts-label">Suggested questions</span>
            <div class="ask-prompt-chips">
              ${SUGGESTIONS.map((s) => `<button type="button" class="ask-chip">${escapeHtml(s)}</button>`).join("")}
            </div>
          </div>

          <!-- Conversation stream -->
          <div class="ask-messages" id="ask-messages" role="log" aria-live="polite"></div>

          <!-- Input bar -->
          <form class="ask-form" id="ask-form">
            <label class="sr-only" for="ask-input">Ask a question</label>
            <input type="text" class="ask-input" id="ask-input" placeholder="Ask about your notes…" autocomplete="off" required>
            <button class="ask-send" type="submit" id="ask-send" aria-label="Send question">
              <svg viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </form>
        </div>`;

      const messagesEl = el.querySelector("#ask-messages");
      const formEl = el.querySelector("#ask-form");
      const inputEl = el.querySelector("#ask-input");
      const sendBtn = el.querySelector("#ask-send");
      const promptsSec = el.querySelector("#ask-prompts-sec");

      // Render any previous exchanges in this session
      function renderHistory() {
        messagesEl.innerHTML = "";
        if (history.length > 0) {
          promptsSec.style.display = "none";
          history.forEach((item) => renderMessage(item));
        } else {
          promptsSec.style.display = "flex";
        }
      }

      function renderMessage(item) {
        if (item.role === "user") {
          const u = document.createElement("div");
          u.className = "ask-user-msg";
          u.textContent = item.text;
          messagesEl.appendChild(u);
        } else if (item.role === "bot") {
          const b = document.createElement("article");
          b.className = "ask-bot-card";

          // Format answer body: replace [Note Title] with clickable inline links
          const formattedHtml = formatAnswerBody(item.text, item.notesMap);

          let sourcesHtml = "";
          if (item.sources && item.sources.length) {
            sourcesHtml = `
              <div class="ask-sources-sec">
                <span class="ask-sources-title">Sources consulted</span>
                <div class="ask-sources-list">
                  ${item.sources
                    .map((s) => {
                      const color = TYPE_COLORS[s.type] || "var(--c-brain)";
                      return `
                        <button type="button" class="ask-source-pill" data-path="${escapeHtml(s.path)}">
                          <span class="ask-source-dot" style="--c:${color}"></span>
                          <span>${escapeHtml(s.title)}</span>
                        </button>`;
                    })
                    .join("")}
                </div>
              </div>`;
          }

          b.innerHTML = `
            <div class="ask-bot-header">
              <span class="ask-bot-label">
                <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2"/></svg>
                Second Brain
              </span>
            </div>
            <div class="ask-answer-text">${formattedHtml}</div>
            ${sourcesHtml}`;

          // Attach click listeners to open notes in Brain screen
          b.querySelectorAll(".ask-inline-ref, .ask-source-pill").forEach((btn) => {
            btn.addEventListener("click", () => {
              const path = btn.dataset.path;
              if (path && window.Screens.brain?.open) {
                window.Screens.brain.open(path, { from: "ask" });
              }
            });
          });

          messagesEl.appendChild(b);
        }
        window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
      }

      function formatAnswerBody(text, notesMap) {
        // Escapes regular text while converting [Note Title] to interactive chips
        const parts = String(text || "").split(/(\[[^\]]+\])/g);
        return parts
          .map((part) => {
            if (part.startsWith("[") && part.endsWith("]")) {
              const rawTitle = part.slice(1, -1).trim();
              const note = notesMap ? notesMap.get(rawTitle.toLowerCase()) : null;
              if (note) {
                return `<button type="button" class="ask-inline-ref" data-path="${escapeHtml(note.path)}">${escapeHtml(part)}</button>`;
              }
              return `<strong>${escapeHtml(part)}</strong>`;
            }
            return escapeHtml(part);
          })
          .join("");
      }

      async function askQuestion(questionText) {
        const q = questionText.trim();
        if (!q) return;

        inputEl.value = "";
        inputEl.disabled = true;
        sendBtn.disabled = true;

        // Add user question to stream
        history.push({ role: "user", text: q });
        renderHistory();

        // Show loading state
        const loadingEl = document.createElement("div");
        loadingEl.className = "ask-loading";
        loadingEl.innerHTML = `<span class="spinner" aria-hidden="true"></span><span>Consulting your notes…</span>`;
        messagesEl.appendChild(loadingEl);
        window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });

        try {
          const allNotes = await Vault.allNotes();
          const notesMap = new Map();
          const pathMap = new Map();

          allNotes.forEach((n) => {
            const title = n.title || n.name || Vault.baseName(n.path);
            notesMap.set(title.toLowerCase(), n);
            pathMap.set(n.path, n);
          });

          const asList = (v) => (Array.isArray(v) ? v : v ? [v] : []);

          // Prepare compact notes payload for /api/ask
          const compactNotes = allNotes.map((n) => ({
            id: n.path,
            title: n.title || n.name || Vault.baseName(n.path),
            summary: (n.body || "").slice(0, 450),
            category: asList(n.meta && n.meta.categories).map(Vault.unlink)[0] || "General",
            type: (n.meta && n.meta.type) || "note",
            done: Boolean(n.meta && n.meta.done),
            createdAt: new Date((n.meta && n.meta.created) || Date.now()).getTime(),
          }));

          const res = await Api.json("POST", "/api/ask", {
            json: { question: q, notes: compactNotes },
          });

          loadingEl.remove();

          const answerText = res && res.answer ? res.answer : "I couldn't find an answer in your notes.";
          const ideaIds = Array.isArray(res && res.ideaIds) ? res.ideaIds : [];

          // Resolve source notes from returned ideaIds + any mentioned [Titles] in the answer text
          const sourcePaths = new Set();
          ideaIds.forEach((id) => {
            if (pathMap.has(id)) sourcePaths.add(id);
            else if (notesMap.has(id.toLowerCase())) sourcePaths.add(notesMap.get(id.toLowerCase()).path);
          });

          // Also scan bracketed [Title] mentions in the answer text
          const bracketMatches = answerText.match(/\[([^\]]+)\]/g) || [];
          bracketMatches.forEach((m) => {
            const clean = m.slice(1, -1).trim().toLowerCase();
            if (notesMap.has(clean)) {
              sourcePaths.add(notesMap.get(clean).path);
            }
          });

          const sources = Array.from(sourcePaths).map((p) => {
            const note = pathMap.get(p);
            return {
              path: p,
              title: note.title || note.name || Vault.baseName(p),
              type: note.meta.type || "note",
            };
          });

          const botItem = {
            role: "bot",
            text: answerText,
            sources,
            notesMap,
          };

          history.push(botItem);
          renderHistory();
        } catch (err) {
          console.error("Error asking question:", err);
          loadingEl.remove();
          const errItem = {
            role: "bot",
            text: "Sorry, I couldn't reach your notes right now. Please check your connection and try again.",
            sources: [],
            notesMap: new Map(),
          };
          history.push(errItem);
          renderHistory();
        } finally {
          inputEl.disabled = false;
          sendBtn.disabled = false;
          inputEl.focus();
        }
      }

      formEl.addEventListener("submit", (e) => {
        e.preventDefault();
        askQuestion(inputEl.value);
      });

      // Clicking suggestion chips fills and sends
      el.querySelectorAll(".ask-chip").forEach((btn) => {
        btn.addEventListener("click", () => {
          askQuestion(btn.textContent.trim());
        });
      });

      renderHistory();

      function escapeHtml(s) {
        return String(s || "")
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;");
      }
    },
  };
})();
