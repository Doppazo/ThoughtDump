# How the AI writes notes

These are the rules the AI follows when it turns a dump into notes, based on the research report in `reports/AI second brain knowledge graph.md`. The app's vault code (`public/vault.js`) enforces the parts marked **(enforced)**. The rest are in the AI's instructions: `organizeDumpWithGemini` in `src/lib/gemini/client.ts` (Gemini, from the shared backend).

## What the AI receives every time
- The new dump, word for word.
- The existing categories, with how many notes each has.
- The most-used tags.
- People, projects, and places, with their alternate names (aliases).
- The 10–20 older notes most similar to this dump (title, type, category).

## What the AI sends back, for each note
| Field | Rule |
|---|---|
| `type` | One of: idea, note, question, task, reminder. |
| `title` | A specific phrase or claim, 100 characters or fewer ("Campus laundry pickup could run on student couriers", not "Laundry idea"). Unique, with unsafe characters removed **(enforced)**. |
| `summary` | 1–2 sentences in the person's own voice. Never add facts they didn't say. |
| `categories` | Reuse an existing one when it fits. New ones: 1–3 words, Title Case, plural ("Business Ideas"). Stored as links **(enforced)**. |
| `tags` | 0–3, lowercase, words joined with hyphens, plural, reused first **(enforced: lowercase, hyphens, max 3)**. Never repeat the type or category as a tag. |
| `people`, `projects`, `places` | Names mentioned, matched to existing aliases first **(enforced)**. Leave one-off mentions as plain text in the summary if unsure. |
| `related` | Up to 3 links to notes from the list it was given, each with a specific reason (not "similar"). Zero is fine. Links to notes that don't exist are dropped **(enforced)**. |
| `revisits` | If the dump repeats an older idea, the title of that note. The new note links back instead of merging. |

## Safety rules
- One idea, question, or task per note. Don't split single sentences, and don't keep a whole dump as one note.
- AI links are marked "(AI)" and kept in a block that can be removed in one tap **(enforced)**.
- A removed AI link is never suggested again **(enforced)**.
- Fields the user edited are never overwritten **(enforced)**.
- A to-do that looks like one you already have: ask before keeping both. Never merge automatically.
- Hub notes appear automatically once 3 notes share a category, or a person, project, or place comes up twice **(enforced)**.
- The original dump and audio are always kept in `raw/` and `audio/` **(enforced)**.
