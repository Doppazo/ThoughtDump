// Knowledge Graph Screen.
// Full interactive 2D knowledge graph built on force-graph with Rodrigo's orbital galaxy layout.
// Category hubs orbit in a wide circle; individual notes cluster radially around their hubs.
// Note-to-note connections (wikilinks and AI links) illuminate connections across clusters.
(function () {
  window.Screens = window.Screens || {};

  const TYPE_COLORS = {
    idea: "#F6C343",
    note: "#B89CFF",
    question: "#7FA0FF",
    task: "#45D98E",
    reminder: "#FF9F5A",
    raw: "#A1A1A6",
    hub: "#FFFFFF",
  };

  window.Screens.graph = {
    async render(el) {
      el.innerHTML = `
        <div class="graph-screen">
          <div class="graph-bar">
            <div class="graph-search-wrap">
              <svg class="graph-search-icon" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>
              </svg>
              <input type="search" class="graph-search" id="g-search" placeholder="Search notes or categories…" autocomplete="off" aria-label="Search knowledge graph">
              <div class="graph-search-results" id="g-results" hidden></div>
            </div>
            <div class="graph-toggles">
              <button class="pill-btn g-toggle" id="g-toggle-cats" type="button" aria-pressed="true">Category lines</button>
              <button class="pill-btn g-toggle" id="g-toggle-physics" type="button" aria-pressed="false">Physics locked</button>
              <button class="pill-btn g-btn-icon" id="g-fit" type="button" aria-label="Reset zoom and center view">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8V4h4M20 8V4h-4M4 16v4h4M20 16v4h-4"/></svg>
              </button>
            </div>
          </div>
          <div id="graph-container" class="graph-container"></div>
          <div class="graph-info-pill" id="g-info">Loading graph…</div>
        </div>`;

      const container = el.querySelector("#graph-container");
      const infoPill = el.querySelector("#g-info");
      const searchInput = el.querySelector("#g-search");
      const searchResults = el.querySelector("#g-results");
      const toggleCatsBtn = el.querySelector("#g-toggle-cats");
      const togglePhysicsBtn = el.querySelector("#g-toggle-physics");
      const fitBtn = el.querySelector("#g-fit");

      if (typeof ForceGraph === "undefined") {
        container.innerHTML = `<div class="placeholder"><p>Graph library could not be loaded.</p></div>`;
        return;
      }

      const allNotes = await Vault.allNotes();
      if (!allNotes.length) {
        container.innerHTML = `
          <div class="placeholder" style="margin:40px auto; max-width:360px">
            <span class="tag">Knowledge Graph</span>
            <p>No notes in your vault yet.<br>Record or type your thoughts to watch your knowledge graph grow.</p>
          </div>`;
        infoPill.textContent = "0 notes";
        return;
      }

      const asList = (v) => (Array.isArray(v) ? v : v ? [v] : []);

      // Group notes by primary category
      const categoryMap = new Map();
      const byName = new Map();
      const byPath = new Map();

      allNotes.forEach((n) => {
        const cat = asList(n.meta && n.meta.categories).map(Vault.unlink)[0] || "General";
        if (!categoryMap.has(cat)) categoryMap.set(cat, []);
        categoryMap.get(cat).push(n);

        const name = n.name || Vault.baseName(n.path);
        byName.set(name.toLowerCase(), n);
        byPath.set(n.path, n);
      });

      const catList = Array.from(categoryMap.keys());
      const numCats = catList.length;
      const catOrbitRadius = Math.max(580, numCats * 200);

      const rawNodes = [];
      const nodeMap = new Map();

      // 1. Build Category Hub Nodes in an orbit circle
      catList.forEach((cat, i) => {
        const hubAngle = -Math.PI / 2 + (2 * Math.PI * i) / (numCats || 1);
        const hubX = Math.round(Math.cos(hubAngle) * catOrbitRadius);
        const hubY = Math.round(Math.sin(hubAngle) * catOrbitRadius);
        const hubNode = {
          id: "hub_" + cat,
          title: cat,
          name: cat,
          isHub: true,
          val: 26,
          category: cat,
          type: "hub",
          x: hubX,
          y: hubY,
          fx: hubX,
          fy: hubY,
          hubAngle,
          neighbors: new Set(),
          links: new Set(),
        };
        rawNodes.push(hubNode);
        nodeMap.set(hubNode.id, hubNode);
      });

      // 2. Build Note Nodes clustered radially around their Category Hub
      catList.forEach((cat) => {
        const hubNode = nodeMap.get("hub_" + cat);
        const hubX = hubNode.x;
        const hubY = hubNode.y;
        const hubAngle = hubNode.hubAngle;
        const catNotes = categoryMap.get(cat);
        const count = catNotes.length;

        catNotes.forEach((n, j) => {
          const ideaDist = 180 + (j % 4) * 55;
          const spread = Math.min(Math.PI * 0.85, 0.28 * Math.max(1, count));
          const ang = hubAngle - spread / 2 + (spread / Math.max(count - 1, 1)) * j;
          const noteX = Math.round(hubX + Math.cos(ang) * ideaDist);
          const noteY = Math.round(hubY + Math.sin(ang) * ideaDist);

          const title = n.title || n.name || Vault.baseName(n.path);
          const noteNode = {
            id: n.path,
            path: n.path,
            title,
            name: title,
            type: n.meta.type || "note",
            category: cat,
            isHub: false,
            val: 9,
            x: noteX,
            y: noteY,
            fx: noteX,
            fy: noteY,
            origFx: noteX,
            origFy: noteY,
            neighbors: new Set(),
            links: new Set(),
          };
          rawNodes.push(noteNode);
          nodeMap.set(n.path, noteNode);
        });
      });

      // 3. Build Edges (Category Hub links + Direct Wikilinks)
      const rawLinks = [];
      const linkKeySet = new Set();

      function addLink(sourceId, targetId, isCategoryLink) {
        if (!sourceId || !targetId || sourceId === targetId) return;
        const key = [sourceId, targetId].sort().join("::") + (isCategoryLink ? "::cat" : "::dir");
        if (linkKeySet.has(key)) return;
        linkKeySet.add(key);

        const link = { source: sourceId, target: targetId, isCategoryLink };
        rawLinks.push(link);

        const srcNode = nodeMap.get(sourceId);
        const tgtNode = nodeMap.get(targetId);
        if (srcNode && tgtNode) {
          srcNode.neighbors.add(tgtNode);
          tgtNode.neighbors.add(srcNode);
          srcNode.links.add(link);
          tgtNode.links.add(link);
        }
      }

      // 3a. Connect each note to its category hub
      allNotes.forEach((n) => {
        const cat = asList(n.meta && n.meta.categories).map(Vault.unlink)[0] || "General";
        addLink(n.path, "hub_" + cat, true);
      });

      // 3b. Connect note-to-note direct links
      allNotes.forEach((n) => {
        const linksFromAi = (n.relatedAi || []).map((r) => r.title);
        const linksFromUser = (n.relatedUser || []).map((r) => r.title);
        const linksFromBody = Vault.links(n.body || "");
        const targets = [...linksFromAi, ...linksFromUser, ...linksFromBody];

        targets.forEach((rawTarget) => {
          const tClean = Vault.unlink(rawTarget).trim().toLowerCase();
          const targetNote = byName.get(tClean);
          if (targetNote && targetNote.path !== n.path) {
            addLink(n.path, targetNote.path, false);
          }
        });
      });

      infoPill.textContent = `${allNotes.length} notes · ${numCats} hubs`;

      // Interactivity state
      let showCategoryLinks = true;
      let physicsLocked = true;
      let hoverNode = null;
      const highlightNodes = new Set();
      const highlightLinks = new Set();

      function getVisibleLinks() {
        return showCategoryLinks ? rawLinks : rawLinks.filter((l) => !l.isCategoryLink);
      }

      function updateHighlight(node) {
        highlightNodes.clear();
        highlightLinks.clear();
        if (node) {
          highlightNodes.add(node);
          node.neighbors.forEach((neighbor) => highlightNodes.add(neighbor));
          node.links.forEach((link) => {
            if (showCategoryLinks || !link.isCategoryLink) highlightLinks.add(link);
          });
        }
      }

      // Initialize ForceGraph
      const rect = container.getBoundingClientRect();
      const width = rect.width || container.clientWidth || 360;
      const height = rect.height || container.clientHeight || 560;

      const graph = ForceGraph()(container)
        .width(width)
        .height(height)
        .backgroundColor("#000000")
        .graphData({ nodes: rawNodes, links: getVisibleLinks() })
        .nodeRelSize(4)
        .nodeVal((node) => node.val)
        .nodeCanvasObject((node, ctx, globalScale) => {
          const isHovered = hoverNode === node;
          const isConnected = highlightNodes.has(node);
          const isDimmed = hoverNode && !isConnected;

          ctx.save();
          if (isDimmed) ctx.globalAlpha = 0.12;

          const radius = node.isHub ? 15 : 7;
          const color = node.isHub ? "#FFFFFF" : TYPE_COLORS[node.type] || "#F6C343";

          // Glowing outer ring for hovered / connected nodes
          if (isHovered || (hoverNode && isConnected)) {
            ctx.beginPath();
            ctx.arc(node.x, node.y, radius + 5, 0, 2 * Math.PI, false);
            ctx.fillStyle = node.isHub ? "rgba(255, 255, 255, 0.22)" : color + "44";
            ctx.fill();
          }

          // Main node circle
          ctx.beginPath();
          ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
          ctx.fillStyle = color;
          ctx.fill();

          // Hub styling: dark inner core ring
          if (node.isHub) {
            ctx.lineWidth = 2.4;
            ctx.strokeStyle = "#000000";
            ctx.stroke();
          }

          // Label
          const showLabel = node.isHub || isHovered || isConnected || globalScale > 0.82;
          if (showLabel) {
            const label = node.isHub ? node.name.toUpperCase() : node.name;
            const fontSize = Math.max(10, Math.min(22, (node.isHub ? 12 : 10) / Math.max(0.65, globalScale)));
            ctx.font = node.isHub ? `600 ${fontSize}px Inter, sans-serif` : `500 ${fontSize}px Inter, sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "top";

            const textY = node.y + radius + 4;
            const metrics = ctx.measureText(label);
            const padX = 5;
            const padY = 2;

            // Semi-transparent pill backdrop for crisp legibility over crossing lines
            ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
            ctx.fillRect(node.x - metrics.width / 2 - padX, textY - padY, metrics.width + padX * 2, fontSize + padY * 2);

            ctx.fillStyle = node.isHub ? "#FFFFFF" : isHovered ? "#FFFFFF" : "#E5E5EA";
            ctx.fillText(label, node.x, textY);
          }

          ctx.restore();
        })
        .linkColor((link) => {
          if (hoverNode) {
            if (highlightLinks.has(link)) {
              return link.isCategoryLink ? "rgba(255, 255, 255, 0.65)" : "#F6C343";
            }
            return "rgba(255, 255, 255, 0.03)";
          }
          return link.isCategoryLink ? "rgba(255, 255, 255, 0.12)" : "rgba(246, 195, 67, 0.82)";
        })
        .linkWidth((link) => {
          if (hoverNode && highlightLinks.has(link)) return link.isCategoryLink ? 1.8 : 3.0;
          return link.isCategoryLink ? 1 : 2.2;
        })
        .linkCurvature((link) => (link.isCategoryLink ? 0 : 0.16))
        .onNodeHover((node) => {
          container.style.cursor = node ? "pointer" : "default";
          if (node === hoverNode) return;
          hoverNode = node || null;
          updateHighlight(hoverNode);
        })
        .onNodeClick((node) => {
          if (!node) return;
          if (node.isHub) {
            graph.centerAt(node.x, node.y, 700);
            graph.zoom(1.8, 700);
          } else {
            window.Screens.brain.open(node.path, { from: "graph" });
          }
        });

      // Fit initially
      setTimeout(() => {
        try {
          graph.zoomToFit(400, 30);
        } catch (_) {}
      }, 300);

      // Category lines toggle
      toggleCatsBtn.addEventListener("click", () => {
        showCategoryLinks = !showCategoryLinks;
        toggleCatsBtn.setAttribute("aria-pressed", String(showCategoryLinks));
        toggleCatsBtn.textContent = showCategoryLinks ? "Category lines" : "Direct links only";
        graph.graphData({ nodes: rawNodes, links: getVisibleLinks() });
        updateHighlight(hoverNode);
      });

      // Physics locked / active toggle
      togglePhysicsBtn.addEventListener("click", () => {
        physicsLocked = !physicsLocked;
        togglePhysicsBtn.setAttribute("aria-pressed", String(physicsLocked));
        togglePhysicsBtn.textContent = physicsLocked ? "Physics locked" : "Physics active";

        rawNodes.forEach((node) => {
          if (!node.isHub) {
            node.fx = physicsLocked ? node.origFx : null;
            node.fy = physicsLocked ? node.origFy : null;
          }
        });

        if (!physicsLocked) {
          graph.d3ReheatSimulation();
        }
      });

      // Fit zoom button
      fitBtn.addEventListener("click", () => {
        graph.zoomToFit(500, 35);
      });

      // Search functionality with auto-zoom
      function renderSearchResults(query) {
        const q = query.trim().toLowerCase();
        if (!q) {
          searchResults.hidden = true;
          searchResults.innerHTML = "";
          return;
        }

        const matches = rawNodes.filter((n) => n.name.toLowerCase().includes(q)).slice(0, 8);
        if (!matches.length) {
          searchResults.hidden = false;
          searchResults.innerHTML = `<div style="padding:10px 14px; color:var(--muted); font-size:13px">No matching notes or hubs</div>`;
          return;
        }

        searchResults.hidden = false;
        searchResults.innerHTML = "";
        matches.forEach((node) => {
          const item = document.createElement("button");
          item.type = "button";
          item.className = "graph-result-item";
          item.innerHTML = `
            <span style="font-weight:500; overflow:hidden; text-overflow:ellipsis; white-space:nowrap">${escapeHtml(node.name)}</span>
            <span class="graph-result-type" style="color:${node.isHub ? "#FFFFFF" : TYPE_COLORS[node.type] || "#F6C343"}">${node.isHub ? "Hub" : node.type}</span>`;
          item.addEventListener("click", () => {
            selectSearchResult(node);
          });
          searchResults.appendChild(item);
        });
      }

      function selectSearchResult(node) {
        searchResults.hidden = true;
        searchInput.value = node.name;
        hoverNode = node;
        updateHighlight(node);
        graph.centerAt(node.x, node.y, 800);
        graph.zoom(2.5, 800);
      }

      searchInput.addEventListener("input", (e) => {
        renderSearchResults(e.target.value);
      });

      searchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          const first = searchResults.querySelector(".graph-result-item");
          if (first) first.click();
        } else if (e.key === "Escape") {
          searchResults.hidden = true;
        }
      });

      document.addEventListener("click", (e) => {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
          searchResults.hidden = true;
        }
      });

      // Window resize handling
      const resizeHandler = () => {
        const r = container.getBoundingClientRect();
        if (r.width > 0 && r.height > 0) {
          graph.width(r.width).height(r.height);
        }
      };
      window.addEventListener("resize", resizeHandler);

      function escapeHtml(s) {
        return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
      }
    },
  };
})();
