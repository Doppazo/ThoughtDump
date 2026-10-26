// To-Do tab (Phase 5): checklist of tasks and reminders.
// Tap the checkbox to mark done/undone (saves to Vault).
// Tap the item to open it in Brain editor.
window.Screens = window.Screens || {};
window.Screens.todo = {
  render(el) {
    const FILTERS = [
      { id: "all", label: "All" },
      { id: "task", label: "Tasks" },
      { id: "reminder", label: "Reminders" },
    ];
    let filter = "all";
    let query = "";

    const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
    const list = (v) => (Array.isArray(v) ? v : v ? [v] : []);
    const names = (v) => list(v).map(Vault.unlink).filter(Boolean);
    const DAY = 86400000;
    function ago(created) {
      const t = new Date(String(created || "")).getTime();
      if (!t) return "";
      const d = Date.now() - t;
      if (d < 3600000) return "just now";
      if (d < DAY) return Math.floor(d / 3600000) + "h ago";
      const n = Math.floor(d / DAY);
      return n === 1 ? "yesterday" : n < 7 ? n + " days ago" : new Date(t).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }

    async function show() {
      el.innerHTML = `
        <h1 class="screen-title">To-Do</h1>
        <p class="screen-sub" id="td-stats">Loading…</p>
        <label class="sr-only" for="td-search">Search to-dos</label>
        <input class="field b-search" id="td-search" type="search" placeholder="Search to-dos and reminders" value="${esc(query)}">
        <div class="b-chips" id="td-chips" role="group" aria-label="Filter to-dos"></div>
        <div id="td-list"></div>
        <p class="capture-note" id="td-status" role="status" aria-live="polite" style="text-align:center"></p>`;

      const notes = await Vault.allNotes();
      const todos = notes.filter((n) => Vault.folderOf(n.path) === "todos");
      const openCount = todos.filter((n) => !n.meta.done).length;
      const doneCount = todos.filter((n) => !!n.meta.done).length;

      const statsEl = el.querySelector("#td-stats");
      if (!todos.length) {
        statsEl.textContent = "No to-dos yet";
      } else if (openCount === 0) {
        statsEl.textContent = `All ${doneCount} completed!`;
      } else if (doneCount === 0) {
        statsEl.textContent = `${openCount} to do`;
      } else {
        statsEl.textContent = `${openCount} to do · ${doneCount} completed`;
      }

      const chips = el.querySelector("#td-chips");
      FILTERS.forEach((f) => {
        const count = f.id === "all" ? todos.length : todos.filter((x) => x.meta.type === f.id).length;
        const b = document.createElement("button");
        b.type = "button";
        b.className = "b-chip";
        b.setAttribute("aria-pressed", String(filter === f.id));
        b.innerHTML = `${esc(f.label)} <span>${count}</span>`;
        b.onclick = () => { filter = f.id; show(); };
        chips.appendChild(b);
      });

      const search = el.querySelector("#td-search");
      search.addEventListener("input", () => {
        query = search.value;
        drawItems(todos);
      });

      drawItems(todos);
    }

    function drawItems(todos) {
      const root = el.querySelector("#td-list");
      root.innerHTML = "";
      const qy = query.trim().toLowerCase();

      const filtered = todos.filter((n) => {
        if (filter !== "all" && n.meta.type !== filter) return false;
        if (!qy) return true;
        const hay = [
          n.name,
          n.body,
          ...names(n.meta.categories),
          ...list(n.meta.tags),
          ...names(n.meta.people),
          ...names(n.meta.projects),
        ].join(" ").toLowerCase();
        return hay.includes(qy);
      });

      if (!filtered.length) {
        root.innerHTML = `
          <div class="placeholder">
            <span class="tag">All Clear</span>
            <p>${qy ? "Nothing matches that search." : "No to-dos here yet. Speak or type a task on the Capture tab and it will appear here."}</p>
          </div>`;
        return;
      }

      const openItems = filtered.filter((n) => !n.meta.done)
        .sort((a, b) => String(b.meta.created).localeCompare(String(a.meta.created)));
      const doneItems = filtered.filter((n) => !!n.meta.done)
        .sort((a, b) => String(b.meta.created).localeCompare(String(a.meta.created)));

      // Active items
      if (openItems.length) {
        const openBox = document.createElement("div");
        openBox.className = "todo-group";
        openItems.forEach((n) => openBox.appendChild(todoRow(n, false)));
        root.appendChild(openBox);
      } else if (doneItems.length && !qy) {
        const congrats = document.createElement("div");
        congrats.className = "placeholder";
        congrats.style.marginTop = "20px";
        congrats.style.padding = "24px 20px";
        congrats.innerHTML = `
          <span class="tag" style="color:var(--c-todo);">All Caught Up</span>
          <p>You've completed everything on your list. Nice work!</p>`;
        root.appendChild(congrats);
      }

      // Completed items
      if (doneItems.length) {
        const doneSec = document.createElement("section");
        doneSec.className = "todo-done-sec";
        doneSec.innerHTML = `<h2 class="todo-done-title">Completed <span>${doneItems.length}</span></h2>`;
        const doneBox = document.createElement("div");
        doneBox.className = "todo-group";
        doneItems.forEach((n) => doneBox.appendChild(todoRow(n, true)));
        doneSec.appendChild(doneBox);
        root.appendChild(doneSec);
      }
    }

    function todoRow(n, isDone) {
      const type = n.meta.type || "task";
      const typeColor = type === "reminder" ? "var(--t-reminder)" : "var(--t-task)";
      const typeLabel = type === "reminder" ? "Reminder" : "To-do";
      const cats = names(n.meta.categories);
      const people = names(n.meta.people);
      const projects = names(n.meta.projects);
      const extraPills = [...cats, ...projects, ...people].slice(0, 2);

      const row = document.createElement("div");
      row.className = "todo-card" + (isDone ? " is-done" : "");
      row.style.setProperty("--c", typeColor);
      row.setAttribute("role", "button");
      row.setAttribute("tabindex", "0");

      const checkBtn = document.createElement("button");
      checkBtn.type = "button";
      checkBtn.className = "todo-check";
      checkBtn.setAttribute("role", "checkbox");
      checkBtn.setAttribute("aria-checked", String(isDone));
      checkBtn.setAttribute("aria-label", `Mark "${n.name}" as ${isDone ? "not done" : "done"}`);
      checkBtn.innerHTML = `<span class="todo-check-circle"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 13l4 4L19 7"/></svg></span>`;

      checkBtn.onclick = async (e) => {
        e.stopPropagation();
        const nextDone = !isDone;
        checkBtn.setAttribute("aria-checked", String(nextDone));
        row.classList.toggle("is-done", nextDone);
        const status = el.querySelector("#td-status");
        if (status) status.textContent = nextDone ? "Marked as done." : "Marked as to do.";
        try {
          await Vault.updateNote(n.path, { done: nextDone });
          show();
        } catch (err) {
          console.error(err);
          checkBtn.setAttribute("aria-checked", String(isDone));
          row.classList.toggle("is-done", isDone);
          if (status) status.textContent = "Couldn't update to-do. Try again.";
        }
      };

      const main = document.createElement("div");
      main.className = "todo-main";

      const header = document.createElement("div");
      header.className = "todo-header";
      header.innerHTML = `<span class="type-pill" style="--c:${typeColor}">${esc(typeLabel)}</span>`;
      extraPills.forEach((p) => {
        const pill = document.createElement("span");
        pill.className = "todo-pill";
        pill.textContent = p;
        header.appendChild(pill);
      });
      main.appendChild(header);

      const title = document.createElement("span");
      title.className = "todo-title";
      title.textContent = n.name;
      main.appendChild(title);

      if (n.body && n.body.trim()) {
        const desc = document.createElement("span");
        desc.className = "todo-desc";
        desc.textContent = n.body.replace(/\*Revisits[^*]*\*/g, "").trim();
        if (desc.textContent) main.appendChild(desc);
      }

      const foot = document.createElement("span");
      foot.className = "todo-foot";
      const timeSpan = document.createElement("span");
      timeSpan.textContent = ago(n.meta.created);
      foot.appendChild(timeSpan);
      main.appendChild(foot);

      const arrow = document.createElement("span");
      arrow.className = "row-right";
      arrow.textContent = "›";

      row.append(checkBtn, main, arrow);

      // Tapping row opens note in Brain editor
      const openNote = () => {
        if (window.Screens?.brain?.open) {
          window.Screens.brain.open(n.path, { from: "todo" });
        } else {
          location.hash = "brain";
        }
      };
      row.onclick = openNote;
      row.onkeydown = (e) => {
        if (e.key === "Enter" || e.key === " ") {
          if (e.target === checkBtn) return;
          e.preventDefault();
          openNote();
        }
      };

      return row;
    }

    show();
  },
};
