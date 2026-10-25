# Antigravity Prompt: Thinkbox Second Brain (Obsidian-style)

Add an Obsidian-style "second brain" to Thinkbox, the existing Next.js + Firebase + Gemini app described in `thinkbox-spec.md`. Ideas should become connected notes organized around their categories, with links, backlinks, and an interactive graph. Do not copy Obsidian's code or branding; Obsidian is closed source. Recreate the concepts only.

---

## 1. Concepts to Implement
- **Notes:** every idea is a Markdown note (title + summary as the body, original transcript kept separately).
- **Category hubs:** every category is a hub note that lists and links to all ideas in it.
- **Links:** ideas link to related ideas using `[[Idea Title]]` wikilink syntax.
- **Backlinks:** each idea shows which other ideas link to it.
- **Graph view:** an interactive map of all ideas, clustered by category.
- **Vault export:** download everything as a folder of Markdown files that opens directly in Obsidian.

---

## 2. AI Linking (on save)
Extend `/api/ideas/process`. After Gemini returns title, summary, and category, make a second Gemini call (or extend the same structured output) to find related ideas.

- Send the new idea plus the user's existing ideas (id, title, one-line summary, category). For the demo, limit to the 100 most recent ideas.
- Gemini returns up to 5 related idea IDs with a short reason for each:
```json
{ "related": [ { "ideaId": "string", "reason": "string (under 12 words)" } ] }
```
- Prompt rules:
  - Link only when ideas share a real topic, goal, project, or problem. Do not link ideas just because they are in the same category.
  - Return an empty list if nothing is genuinely related.
  - Use only IDs from the provided list.
- Store links in **both directions** so backlinks work without extra queries.
- If the linking call fails, still save the idea with no links.

---

## 3. Data Model Changes (Firestore)
Add to `users/{uid}/ideas/{ideaId}`:
```
links: [ { ideaId: string, reason: string, source: "ai" | "user" } ]
backlinks: [ { ideaId: string, reason: string } ]
```
Add to `users/{uid}/categories/{categoryId}`:
```
color: string    // assigned once, used in the graph and category pills
```
When an idea is deleted, remove it from other ideas' `links` and `backlinks` in a batched write.

---

## 4. Graph View (`/graph`)
- Use `react-force-graph-2d` (load with `next/dynamic`, `ssr: false`).
- **Nodes:**
  - Category hub nodes: larger circles, labeled with the category name, in the category color.
  - Idea nodes: smaller circles in their category's color, labeled with the title (label shown on hover, or always when zoomed in).
- **Edges:**
  - Idea → its category hub (thin, faint line). This clusters ideas around their categories.
  - Idea ↔ related idea (thicker line). Hovering shows the AI's reason.
- **Interactions:**
  - Click an idea node to open it in a side panel.
  - Click a category hub to filter the feed to that category.
  - Hovering a node highlights it and its direct connections and dims the rest.
  - Search box that zooms to and highlights a matching node.
  - Toggle: "Show category links" on/off, to see only idea-to-idea connections.
- Works in light and dark mode; readable on mobile with pinch zoom.
- Add "Graph" to the sidebar navigation and as a tab on mobile.

---

## 5. Idea Detail Changes
- **Linked ideas** section: cards for each related idea, showing the reason, with a remove (×) button.
- **Backlinks** section: "Linked from" cards for ideas that point to this one.
- **Add link manually:** search box to link any idea (saved with `source: "user"`).
- **Local graph:** small graph showing just this idea, its category hub, and directly connected ideas.
- Render the summary as Markdown. Any `[[Title]]` in the text becomes a clickable link to that idea; if no idea has that title, show it greyed out.

---

## 6. Category Hub Page (`/category/[name]`)
- Header with category name, color, and idea count.
- List of all ideas in the category, newest first.
- "Connected categories": other categories whose ideas link to ideas in this one, with link counts.
- Optional AI button: "Summarize this category" (Gemini summary of all ideas in it, not saved).

---

## 7. Obsidian Vault Export
Add **Export as Obsidian vault (.zip)** in Settings, using `jszip`.

Structure:
```
Thinkbox Vault/
  Startup Ideas/
    _Startup Ideas.md        ← category hub note
    Textbook Rental App.md
  Finance Class/
    _Finance Class.md
    DCF Study Plan.md
```
Each idea file:
```markdown
---
category: "Startup Ideas"
created: 2026-10-25
tags: [thinkbox]
---
# Textbook Rental App

{summary}

## Related
- [[Campus Marketplace]] — both about student-to-student exchange

## Category
[[_Startup Ideas]]

## Original
> {originalText}
```
Each hub file lists `[[links]]` to every idea in the category.

Rules:
- Sanitize file names (remove `/ \ : * ? " < > |`); if two ideas share a title, append ` (2)`, ` (3)`, etc., and use the final file name in all wikilinks.
- Opening the unzipped folder in Obsidian ("Open folder as vault") must show a working graph with category clusters.

---

## 8. Build Order
1. Data model fields + AI linking on save
2. Idea detail: linked ideas, backlinks, manual linking
3. Graph view page
4. Category hub pages
5. Obsidian vault export
6. Local graph in idea detail and the "Summarize this category" button (stretch)

---

## 9. Acceptance Criteria
- Saving a new idea that is clearly related to an existing one creates a link in both directions within a few seconds.
- Unrelated ideas are not linked just because they share a category.
- The graph shows ideas clustered around category hubs, with idea-to-idea links visible and hover reasons working.
- Clicking any node opens the right idea or category.
- Deleting an idea removes all of its links and backlinks.
- The exported .zip opens in Obsidian as a vault, and Obsidian's graph shows the same structure.
- All new reads and writes stay under `users/{uid}/**` and pass the existing security rules.
