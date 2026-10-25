# Knowledge Graph Access & Usefulness in Note-Taking Apps (Mobile Focus)

Research date: 2026-10-25. Budget-limited pass (~17 tool calls). Many app-level details come from secondary comparison blogs. Where only a secondary or conflicting source exists, this is flagged.

## 1. How each app exposes graphs, and where in navigation

### Takeaway
The apps split three ways. Obsidian (and likely Logseq, Roam and Amplenote) offer a global "whole-vault" graph plus a per-note local graph. Capacities is a newer object-centric app with full graph on desktop only and a centered/local graph elsewhere. Heptabase and Kosmik use whiteboard/canvas spatial apps instead of auto-layout graphs. On mobile, most apps either drop the global graph (Capacities, Anytype, Amplenote) or bury it behind a command palette (Obsidian local graph).

### Cited Findings
**Obsidian**
- Graph view is a core plugin. The global graph opens from the Ribbon button "Open graph view". The local graph opens via the "Open local graph" command and can use all the global graph's settings — [Obsidian Help: Graph view](https://obsidian.md/help/plugins/graph)
- Local graph has a depth slider: "Each level of depth will show notes connected to the notes revealed at the previous depth." — [Obsidian Help](https://obsidian.md/help/plugins/graph)
- Filters cover search terms, tags, attachments, orphans and "existing files only". Groups are search queries with a color assigned. An "Animate" option shows a time-lapse of notes appearing "in chronological order based on their creation time". Hover highlights connections, click opens the note, right-click opens a context menu — [Obsidian Help](https://obsidian.md/help/plugins/graph)
- Mobile: pinch-zoom shipped with mobile v1.0.0 (July 2021), and the changelog says graph nodes "can now be easily dragged around, or tapped on" — [Obsidian changelog mobile v1.0.0](https://obsidian.md/changelog/2021-07-07-mobile-v1.0.0/)
- On mobile, the local graph is reached through the command palette. A forum workaround: swipe down below the note title to open the Mobile Command Palette and search "local graph". Users have filed requests for easier access — [Forum: Open local graph on mobile iOS](https://forum.obsidian.md/t/feature-open-local-graph-on-mobile-ios/16638); [Forum: Easier mobile graph mode access](https://forum.obsidian.md/t/easier-mobile-graph-mode-access/51629)

**Capacities**
- Desktop/web: a **Graph** item in the left sidebar shows the whole space. There is also a top-right toggle and a command palette entry "Open graph view". Graphs can also be opened scoped to a collection, tag, query, object-type dashboard or search result — [Capacities docs: Graph view](https://docs.capacities.io/reference/graph-view)
- Graph in the right panel follows whatever is open on the left: "Graph view will update based on what is in the left side of the screen." A single object is centered, with **Show more / Show less** to expand neighbors (instead of a numeric depth) — [Capacities docs](https://docs.capacities.io/reference/graph-view)
- "Phone and tablet do not have a full space graph view." — [Capacities docs](https://docs.capacities.io/reference/graph-view). A search summary of the Capacities mobile/FAQ docs said phone graph view is local to one object only and that tablet support is pending — [Capacities mobile docs](https://docs.capacities.io/reference/mobile); [Capacities FAQ full graph](https://docs.capacities.io/faq/editing/full-graph-view) (not fetched directly; verify)
- Filtering is by object type (include/exclude) — [Capacities docs](https://docs.capacities.io/reference/graph-view)

**Anytype**
- Graph is desktop only. A community feature request "Add graph view to mobile" exists. Staff said they planned "at least some part of the graph" for mobile, but users later noted no visible progress — [Anytype Community](https://community.anytype.io/t/add-graph-view-to-mobile/5735); [Medium: Graph views in Obsidian, Tana, Anytype](https://medium.com/@ann_p/visualizing-connections-graph-views-in-obsidian-tana-and-anytype-3c767e08fe66). No official mobile graph release found.

**Amplenote**
- A "Graph" button opens the Note Graph, loading 1,000 notes by default (configurable). Node size scales with content, color comes from tags (multi-tag notes show a gradient), and arrows show link direction. Isolated notes can be highlighted or hidden. Filters cover search, **date range**, tags and groups — [Amplenote Help: Note Graph](https://www.amplenote.com/help/note_graph)
- The help page lists a native mobile version as a plan: "bringing a version of Graph View to native mobile app". For potential missed connections it points to an "Unlinked References" tab rather than the graph — [Amplenote Help](https://www.amplenote.com/help/note_graph). Whether it is paid-only is contested between secondary blogs — [Tana blog: RemNote alternatives](https://tana.inc/blog/best-remnote-alternatives-2026)

**Heptabase (whiteboards/cards)**
- Notes are cards arranged and connected on infinite whiteboards (a spatial, user-arranged layout, not an auto-laid-out graph) — [Dexi: Heptabase vs Reflect](https://dexi.net/compare/heptabase-vs-reflect)
- The iOS listing promises "full access to all your cards and journals" and lets you "read all your whiteboards". A 2024 update added creating and editing cards and text on whiteboards from phone and tablet (move, resize, recolor, fold, delete). Connections and mind maps were still listed as planned for mobile — [App Store: Heptabase](https://apps.apple.com/app/id6445801508); [Heptabase newsletter 2024-06-01](https://wiki.heptabase.com/newsletters/2024-06-01)
- Mobile card info shows backlinks, whiteboards, tags and properties (2023) — [Heptabase newsletter 2023-10-19](https://wiki.heptabase.com/newsletters/2023-10-19)

**InfraNodus**
- Converts text into a network of concepts, not a network of notes. Uses modularity-based community detection for topical clusters and highlights **structural gaps** (distinct clusters far apart). AI then proposes research questions that bridge a gap — [InfraNodus: How it works](https://infranodus.com/about/how-it-works); [InfraNodus methodology](https://infranodus.com/about/methodology)
- The Obsidian plugin "InfraNodus AI Graph View" maps the vault's main topics and the gaps between them. It argues Obsidian's native graph only shows link structure, not the ideas inside notes — [Obsidian community plugin page](https://community.obsidian.md/plugins/infranodus-graph-view); [Forum post by developer](https://forum.obsidian.md/t/research-any-topic-using-obsidian-and-infranodus-3d-graph-view-plugin/87505)

**Logseq / Roam / Tana / RemNote / Reflect / Mem / Napkin / Notion**
- Logseq ships graph visualization as a core free feature. Its new mobile app was described as alpha; no source confirmed graph view on the new mobile app — [NotePlan: Logseq alternatives](https://noteplan.co/blog/logseq-alternatives); [Atlas: Logseq alternatives](https://www.atlasworkspace.ai/blog/logseq-alternatives)
- Roam and Tana have graph views "as secondary features rather than central to the workflow" — [Medium: You need a graph view](https://medium.com/@danielasgharian/you-need-a-graph-view-here-is-why-3849be1b8747)
- RemNote is described as having a graph/map of concepts (secondary sources only) — [Nodus Labs: Obsidian vs Roam vs Logseq vs RemNote](https://support.noduslabs.com/hc/en-us/articles/6490899641234-Obsidian-vs-Roam-Research-vs-LogSeq-vs-RemNote)
- Reflect centers on backlinks and daily notes. Whether it has a graph view is **contested**: one comparison lists a simple graph, another says none — [Dexi](https://dexi.net/compare/heptabase-vs-reflect); [Toolfinder: second brain apps](https://toolfinder.com/best/second-brain-apps)
- Notion: comparison tables list "Graph View: No", and no native graph was found — [Tana blog](https://tana.inc/blog/best-remnote-alternatives-2026)
- Napkin: current sources describe "Napkin" (napkin.ai) as a text-to-visual/diagram tool. No current source documented an idea-clustering graph — [Rework: AI note apps 2026](https://resources.rework.com/tools/ai-tools/best-ai-note-taking-apps-2026)

### Inferences
- Across the apps, the global graph is a desktop feature and mobile gets either nothing or a per-note view. Capacities and Anytype both explicitly withheld the full graph from phones. This suggests teams judged it not worth the cost on small screens.
- Capacities' "graph follows what's open" and "scoped graph from a collection/tag/search" patterns are the most transferable ideas. The graph becomes a lens on a context rather than a destination.
- InfraNodus shows a different value proposition for an AI app: graph of *concepts/topics + gaps* (computed), not of user-made [[links]]. This fits an AI-first app where users won't link manually.

### Gaps
- Could not fetch Logseq, Roam, Tana, RemNote, Mem, Scrintal or Kosmik official docs within budget. Their mobile graph behavior is unverified.
- Mem: no source found for a "related notes"/similar-notes panel in the current product (Mem 2.0). From memory, Mem has historically offered AI-surfaced related notes ("Mem X / Related"), but this is not verified.
- Napkin (the older "napkin.one" idea-clustering app with random-card resurfacing) was not covered by current sources. It may be confused with napkin.ai.
- Reflect graph status conflicts between sources.

## 2. UX patterns: global vs local, clusters/color, time, related panels, serendipity, tap-to-open

### Takeaway
The patterns that recur are a local graph with depth 1–2, color-by-tag/type groups, saved filters, time filters or animation, hover/tap to highlight neighbors then open, and "unlinked references"/related lists as the lighter alternative. Computed clusters plus gaps (InfraNodus) is the main "insight" pattern beyond link visualization.

### Cited Findings
- Local graph with adjustable depth, and groups colored by search query — [Obsidian Help](https://obsidian.md/help/plugins/graph)
- Time: Obsidian's creation-time "Animate" time-lapse — [Obsidian Help](https://obsidian.md/help/plugins/graph). Amplenote's date-range filter — [Amplenote Help](https://www.amplenote.com/help/note_graph)
- Color by tag (with a gradient for multiple tags) and size by content length — [Amplenote Help](https://www.amplenote.com/help/note_graph). Filter by object type — [Capacities docs](https://docs.capacities.io/reference/graph-view)
- Orphan toggle (Obsidian) and isolated-note highlighting (Amplenote) — [Obsidian Help](https://obsidian.md/help/plugins/graph); [Amplenote Help](https://www.amplenote.com/help/note_graph)
- Scoped graphs (from a collection, tag, query or search result) and a centered graph with Show more/less — [Capacities docs](https://docs.capacities.io/reference/graph-view)
- Search-as-graph: a forum user filters by a word to "find all notes with that word, displayed as a graph" and uses it to spot unlinked notes — [Obsidian forum: What's the point of graph view](https://forum.obsidian.md/t/whats-the-point-of-the-graph-view-how-are-you-using-it/71316)
- Lighter alternatives: Amplenote sends users to "Unlinked References" for missed connections — [Amplenote Help](https://www.amplenote.com/help/note_graph). Heptabase mobile card info shows backlinks, whiteboards and tags — [Heptabase 2023-10-19](https://wiki.heptabase.com/newsletters/2023-10-19)
- Serendipity/gap pattern: cluster detection plus structural gaps plus AI-generated bridging questions — [InfraNodus](https://infranodus.com/about/how-it-works)
- Konik uses the graph for inspiration: she zooms into a node and hovers its neighbors to find unused material — [Eleanor Konik, 2021](https://www.eleanorkonik.com/its-not-just-a-pretty-gimmick-in-defense-of-obsidians-graph-view)

### Inferences
- For an AI app the "related" signal can be semantic (embeddings) as well as explicit [[links]]. A local graph that mixes solid edges (links) with dashed edges (AI-suggested, tap to accept as a [[link]]) would turn the graph from passive viewing into an action. This is a design inference; no source documents an app doing exactly this.
- Time filters ("this week's thoughts") fit a dump-style capture app, where recency matters more than a vault's whole structure.

### Gaps
- No sourced data on daily review/resurfacing features (e.g., Readwise-style, Napkin random cards, Reflect/Mem resurfacing) within budget.
- No usage analytics from any vendor on how often graph views are opened.

## 3. Evidence and community opinion: useful or eye candy?

### Takeaway
Community consensus is that the default global graph is mostly a novelty: positions change on every load and dense vaults become a "hairball". Users who find value use it for specific jobs: maintenance (orphans, unindexed folders, sync duplicates), filtered or local views while writing, and seeing coverage or clusters. Even defenders say the insight is "not actionable beyond self-reflection."

### Cited Findings
- Skeptics (Obsidian forum thread, Nov 2023–Jul 2024): "have never found it helpful so i have it switched off" (CarolineMathieson). "never seen the point of graph view other than 'hey look at this!'" (writtenfool). He also spent more time "tweaking the graph criteria than optimizing my vault". "There is no use, chaotic patterns have no meaning" (charleslu). "Obsidian's default graph is non-functional because there is no consistency in the actual graph" (zhMGjFoyz) — [Obsidian forum](https://forum.obsidian.md/t/whats-the-point-of-the-graph-view-how-are-you-using-it/71316)
- Pragmatists: the Local Graph is "much more intuitive to use" and "Learning to filter my own hairball was the next step to get more insights" (Edmund). The local graph is "really helpful when I need it to be (which isn't often)", mainly for writing (bobdoto). Another user wants pinned nodes and directional layouts because the insight "is not actionable beyond self-reflection" (zhMGjFoyz) — [Obsidian forum](https://forum.obsidian.md/t/whats-the-point-of-the-graph-view-how-are-you-using-it/71316)
- Enthusiast: "graph view is the most important pillar of my vault" (jhidalgochacon) — [Obsidian forum](https://forum.obsidian.md/t/whats-the-point-of-the-graph-view-how-are-you-using-it/71316)
- Eleanor Konik's defense (Sept 2021) lists maintenance (orphans mean indexes need updating, floating dots mean an unindexed folder), sync-error detection (duplicates), seeing how sections connect, and gauging draft readiness (a dense cluster means ready). She does *not* use it for navigation, notes the local graph doesn't work for her, and says screenshots are not "navigable" by others — [Eleanor Konik](https://www.eleanorkonik.com/its-not-just-a-pretty-gimmick-in-defense-of-obsidians-graph-view)
- Summary of the wider discourse: big graphs are eye candy, while the local view is more useful day to day — [search summary of codeforces/blog posts](https://codeforces.com/blog/SubArU_76) (low-quality source; directional only)

### Inferences
- The value is diagnostic (structure health) and contextual (the neighbors of what I'm looking at), not navigational. In an AI app where the AI does the linking and organizing, the "maintenance" use case shrinks. The remaining value is contextual discovery plus "show me my themes and gaps".
- Users who are "non-visual" turn it off entirely, so the graph should be optional and never a primary path.

### Gaps
- No direct, verifiable quote from Steph Ango (Obsidian CEO) or Nick Milo (LYT) on graph usefulness was found. Do not attribute positions to them without a source.
- No Reddit threads came back in search, so r/ObsidianMD/r/PKMS sentiment is represented only through the Obsidian forum and blogs.

## 4. Mobile specifics: gestures, performance, layouts

### Takeaway
Graph-on-phone is poorly served even in Obsidian. Touches on nodes hijack pinch and pan, large vaults crash or redraw, and access is buried. Competitors avoid the full graph on phones. The evidence favors a small local graph (depth 1–2) with big tap targets, scoped to one note, or list/card alternatives.

### Cited Findings
- iOS: pinching is hard because touching highlights a note instead of moving the view, and the graph is "nearly unusable in the mobile app when there are a lot of notes/nodes"; pinch "only works if you can find a dead space" — [Obsidian forum: difficult to pinch and zoom in iOS](https://forum.obsidian.md/t/feature-very-difficult-to-pinch-and-zoom-in-ios-in-graph-view/42074)
- Android: users must "carefully place 2 fingers in empty spaces in order to zoom/pan" — [Obsidian forum: pinch selects a node on Android](https://forum.obsidian.md/t/pinch-to-pan-zoom-selects-a-node-if-a-finger-touches-one-in-the-graph-on-android/20683). Graph freezes after accidentally touching a note while zoomed — [Obsidian forum: graph freezes](https://forum.obsidian.md/t/bug-graph-view-freezes-when-you-zoom-in-and-accidentally-touch-a-note/20558)
- iOS with 3K+ notes: pinch-zoom "crashes and redraws" (thread closed without resolution) — [Obsidian forum: graph keeps crashing iOS](https://forum.obsidian.md/t/graph-view-keeps-crashing-and-re-drawing-in-ios-app/73719)
- Capacities phone/tablet: no full-space graph — [Capacities docs](https://docs.capacities.io/reference/graph-view). Anytype: no mobile graph — [Anytype Community](https://community.anytype.io/t/add-graph-view-to-mobile/5735). Amplenote: mobile graph only "planned" — [Amplenote Help](https://www.amplenote.com/help/note_graph)
- Heptabase took the spatial route on mobile: read whiteboards first, add card editing later, with connections still pending — [Heptabase newsletter 2024-06-01](https://wiki.heptabase.com/newsletters/2024-06-01)

### Inferences (design recommendations derived from the evidence above)
- Gesture rules: a single tap selects or focuses a node and shows a bottom sheet with a preview; a second tap or an "Open" button opens the note. One-finger drag on the background pans and two fingers always zoom, regardless of whether a finger lands on a node. Disable node-dragging on mobile, since it is the main source of pinch hijacking.
- Cap rendered nodes (e.g., depth-2 neighborhood, top ~50–150 by relevance) instead of attempting the whole vault on a phone. Precompute layout or freeze the simulation after settling, so positions are stable. Instability is the #1 complaint.
- A bottom sheet with "Connections" (linked, backlinked, AI-suggested), grouped by type (idea/thought/todo), is the list equivalent of a local graph. It suits non-visual users and one-handed use.
- A mini local graph thumbnail on the note page (static, tap to expand to full-screen) gives the "wow" without burdening the reading view.

### Gaps
- No published UX research or case studies on mobile graph usability found. No vendor numbers on node limits for mobile.
- Did not verify whether Obsidian has improved mobile graph gestures since 2024.

## 5. Rendering libraries and mobile performance (brief)

### Takeaway
Sigma.js (WebGL, with graphology) is the scalable option. Cytoscape.js (canvas by default, rich algorithms and layouts) is the analysis option. vis-network is the easy physics option but the slowest. force-graph/react-force-graph (canvas 2D; WebGL in the 3D variant) is the quickest to a pretty, interactive force layout. No mobile benchmarks were found, so test on target devices.

### Cited Findings
- Sigma.js is WebGL and was "considerably quicker in rendering bigger graphs" than D3/vis alternatives in one benchmark. vis was slowest by roughly an order of magnitude in an older (>4 yrs) benchmark — [Cylynx comparison](https://www.cylynx.io/blog/a-comparison-of-javascript-graph-network-visualisation-libraries/); [Memgraph blog](https://memgraph.com/blog/you-want-a-fast-easy-to-use-and-popular-graph-visualization-tool)
- Cytoscape.js is not WebGL-powered (academic source), contradicting some blogs — [Dash Sylvereye paper, arXiv](https://arxiv.org/pdf/2105.14362). Cytoscape suits analysis with built-in algorithms (centrality, clustering) — [PkgPulse 2026](https://www.pkgpulse.com/guides/cytoscape-vs-vis-network-vs-sigma-graph-visualization-2026)
- Layout cost, edge density, labels and hit-testing usually dominate perceived performance more than raw node count, so benchmark with your own counts — [PkgPulse 2026](https://www.pkgpulse.com/guides/cytoscape-vs-vis-network-vs-sigma-graph-visualization-2026)
- vis-network practical limit ~3,000–5,000 nodes (unsourced estimate) and Sigma 100K+ claims (from the same blog) — [PkgPulse](https://www.pkgpulse.com/blog/cytoscape-vs-vis-network-vs-sigma-graph-visualization-javascript-2026) (low confidence)

### Inferences
- For a phone-scale local graph (<200 nodes) any library performs fine. The deciding factors are touch handling, stable layout and bundle size. react-force-graph (or d3-force driving a canvas or react-native-skia view) is pragmatic for the local view. Sigma plus graphology is the choice if a full "galaxy" view is ever shipped. Run clustering (Louvain/modularity) server-side or in graphology rather than on device during render.
- In React Native specifically, a WebView-hosted canvas/WebGL graph is the common shortcut. Native rendering (e.g., Skia) gives better gestures. This is unverified; no source was fetched.

### Gaps
- No mobile/touch benchmarks or React Native-specific graph library comparisons were found.

## 6. Where a graph could live in Thought Dump's 4-tab app (Capture / Brain / Ask / To-Do + Settings)

### Takeaway
The evidence (global graph is low-value and fragile on phones, local graph and connections lists are what people actually use, competitors withhold full graphs on mobile) points to a contextual graph inside Brain and on each note, not a 5th tab. A full "map" can be a secondary mode for themes and gaps.

### Cited Findings
- Competitors withhold full graphs on phones (Capacities, Anytype, Amplenote) — [Capacities](https://docs.capacities.io/reference/graph-view); [Anytype](https://community.anytype.io/t/add-graph-view-to-mobile/5735); [Amplenote](https://www.amplenote.com/help/note_graph)
- Local and filtered graphs are favored over the global hairball — [Obsidian forum](https://forum.obsidian.md/t/whats-the-point-of-the-graph-view-how-are-you-using-it/71316)
- Capacities' "graph follows the open object" and "scoped graph from tag/query/search" patterns — [Capacities docs](https://docs.capacities.io/reference/graph-view)
- Gap and cluster analysis as an actionable graph — [InfraNodus](https://infranodus.com/about/how-it-works)

### Inferences — concrete options
**Option A: Per-note "Connections" (recommended first build).** On each note or card detail, show a mini local graph (depth 1, static thumbnail) above a Connections list (Links · Backlinks · AI-suggested). Tap the thumbnail to open a full-screen local graph (depth 1–2 toggle) in a modal or bottom sheet; tap a node to preview it in a sheet and tap again to open.
- Pros: matches the most-used pattern (local graph), stays small (fast, stable), and gives users who are not visual a list. AI-suggested edges with "Link it" turn viewing into action. No new navigation.
- Cons: no "whole brain" wow moment, so it is less marketable in screenshots. Discovery depends on users opening notes.

**Option B: A "Map" view mode inside the Brain tab** (segmented control: Cards | Map, alongside the existing Raw filter). Map shows *clusters/themes* (AI-computed communities, colored by type: idea/thought/todo), not all nodes. Brain's existing filters (type, Raw, time such as "this week") scope it. Tapping a cluster drills into its notes as cards; tapping a node opens a bottom sheet. Show "gaps" (two themes that rarely connect) as prompts that can jump to Ask.
- Pros: graph lives where the notes live, and filters reuse Brain's controls (Capacities-style scoped graph). Clusters plus gaps give an actionable insight (InfraNodus-style) instead of a hairball, and it ties into the Ask tab.
- Cons: more engineering (clustering, stable layout, gesture tuning). Risk of becoming the eye-candy users ignore. Must cap nodes and freeze layout.

**Option C: Graph as an Ask-tab answer artifact and/or a Settings/"Insights" entry.** Ask can return a small graph ("how are my notes on X connected?"), and a weekly "Brain review" surfaces clusters, orphans ("unconnected thoughts") and surprising links as cards rather than a graph canvas.
- Pros: the graph appears only when it answers a question, which fits the AI-first app. Orphan and serendipity value is delivered as cards, which suit phones best. Lowest gesture complexity.
- Cons: harder to find for users who want to explore freely. Settings is a poor home for a discovery feature. Weekly review needs a notification/retention loop.

Suggested sequencing (inference): A, then B (clusters only) once there is enough note volume, with C's "unconnected thoughts / surprising connection" cards as a cheap serendipity layer in Brain.

### Gaps
- No user research specific to AI-first capture apps (where users rarely write [[links]] manually). Validate with prototypes.
