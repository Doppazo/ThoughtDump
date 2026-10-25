# AI-Generated Notes & Automatic Linking in PKM Tools — Best Practices for "Thought Dump"

Research date: 2026-10-25. About 22 searches and fetches. Most sources are vendor docs, plugin listings and changelogs. I found few independent reviews and no strong Reddit threads, so vendor claims about quality are unverified.

## 1. How existing AI note tools auto-organize and auto-link

### Takeaway
Tools fall into three groups. Some surface related notes with embeddings in a side panel and leave the note untouched (Smart Connections, Mem Copilot/Heads Up). Some insert links or tags only on demand, with a preview or approval step (Reflect "Decorate with backlinks", Semantic Auto-Linker, AI Tag Curator). Some type notes into a fixed schema and let AI fill fields only from existing objects (Tana supertags/base tags, Capacities AI auto-fill). None of the sources I found shows a tool that silently writes AI links into note bodies by default.

### Cited Findings
- **Smart Connections (Obsidian):** builds a local embedding index of the vault and shows a "Connections" view of semantically related notes, plus a "Lookup" view for search by meaning. A shared "Smart Environment" keeps the index in sync with vault events. The Pro tier adds inline and footer connections and configurable ranking. — [Smart Connections docs index](https://docsearch.algolia.com/mcp/docs/repo/brianpetro/obsidian-smart-connections); [Obsidian community listing](https://community.obsidian.md/plugins/smart-connections)
- One third-party page says Smart Connections ships a built-in embedding model that needs no API key, can use Ollama, and keeps data local unless a hosted model is configured. This is not verified against official docs. — [mythos.one](https://mythos.one/me/brianswichkow/3e4342)
- Third-party MCP servers reuse Smart Connections' stored embeddings to search by meaning. Embeddings work as a shared index for other tools. — [smart-connections-mcp](https://github.com/msdanyg/smart-connections-mcp)
- **Mem 2.0:** announced in alpha July 2024, transition guide February 2025, launch post October 1, 2025. Collections act like folders, but one note can sit in several. Notes may also stay unsorted, because search and chat still find them. — [Mem 2.0 blog](https://get.mem.ai/blog/mem-2-dot-0); [Transition guide](https://get.mem.ai/blog/mem-2-dot-0-transition-guide); [App Store](https://apps.apple.com/us/app/mem-self-organizing-workspace/id1578757028?uo=4)
- Mem suggests a new collection when you write about a topic that is new to you. Over time it learns which collections you use and suggests those. You click the suggested name to accept, or the pencil to rename first (post of April 5, 2024). — [Mem: New & Improved AI-Suggested Collections](https://get.mem.ai/blog/new-and-improved-collections)
- Mem "Copilot" (formerly "Related Notes") surfaces related notes. "Heads Up" groups related notes by topic and shows related meetings on a timeline. Release 2.5.2 lets chat save notes, update existing notes, or organize a set of notes. — [Mem App Store listing](https://apps.apple.com/py/app/mem-2-0-your-ai-second-brain/id1578757028?l=en-GB)
- **Reflect:** a user-triggered AI palette prompt, "Decorate my writing with backlinks", adds backlinks to selected text (Aug 29, 2023). The result replaces the selection, so the user sees it before keeping it. — [Reflect blog](https://reflect.app/blog/automatically-add-backlinks-using-ai); [Reflect changelog](https://roadmap.reflect.app/changelog/add-backlinks-using-ai)
- **Tana:** a supertag "turns a node into an object" with a field template. All nodes with that supertag form a searchable, table-viewable collection. AI features: custom autofill of title, fields or description (individual fields can be excluded), field suggestions when you create a supertag, voice-memo transcription on audio-enabled supertags, and per-tag "AI instructions" saying which objects should get the tag. — [Tana supertags docs](https://outliner.tana.inc/learn/features/supertags)
- Tana "base tags" are a fixed set of types (Person, Task, Meeting…) that help AI recognize an object's type whatever its name. The meeting agent uses them to auto-detect people, organizations, tasks and locations (marked work-in-progress). — [Tana supertags docs](https://outliner.tana.inc/learn/features/supertags)
- Tana's older "AI for Builders" (Autofill and Autotag with BYOK OpenAI keys) has been folded into core Tana AI. BYOK remains only for a "Generic AI query" command. — [Tana AI for Builders](https://tana.inc/docs/ai-for-builders)
- **Capacities:** every object belongs to one type. Basic types (Page, Tag, Image, Weblink, PDF, AI Chat…) are created automatically. Custom types (People, Meetings, Books, Topics) are user-defined. — [Capacities content types](https://docs.capacities.io/reference/content-types)
- Capacities AI auto-fill on an object-select property "can suggest options from objects you already have". It will not invent a long list of entities you never created. Requires Pro/Believer plan. — [Capacities network of people](https://docs.capacities.io/reference/use-cases/network-of-people)
- **Copilot for Obsidian:** a chat assistant over the vault with agent features (vault search, web, YouTube) on the Plus tier, any OpenAI-compatible or local model, and one-click in-note AI edits via a prompt palette. I found no confirmed automatic linking feature. — [Copilot community listing](https://community.obsidian.md/plugins/copilot); [Asian Efficiency guide](https://www.asianefficiency.com/technology/obsidian-ai-plugins-setup/)
- **Khoj:** chat and semantic search over notes (Obsidian, Notion files) plus the web, in a side panel. It can insert answers at the cursor and can be self-hosted local-only. It is search/answer oriented, not link-writing. — [Khoj Obsidian plugin](https://community.obsidian.md/plugins/khoj); [Khoj blog](https://blog.khoj.dev/posts/obsidian-ux-revamp/)
- **Saner.ai** markets itself as an AI that actively organizes and surfaces notes, with automatic task extraction and smart tagging from notes and emails (vendor-written). — [Saner.ai blog](https://www.saner.ai/blogs/best-reflect-alternatives)
- **Obsidian link plugins:** Smart Linker writes a managed `## Related` block of top-K wikilinks between `<!-- auto-related:start -->` and `<!-- auto-related:end -->` markers. Semantic Auto-Linker combines exact title/alias matching with semantic matching, behind a review step. Auto Linker shows suggestions while you type; you insert or dismiss each, and semantic matches get a dotted underline. — [Smart Linker](https://community.obsidian.md/plugins/smart-linker); [Semantic Auto-Linker](https://community.obsidian.md/plugins/semantic-auto-linker); [Auto Linker](https://www.obsidianstats.com/plugins/auto-linker)
- **Simple Graph Builder (Obsidian):** an LLM extracts entities (10 fixed types, free-form relation verbs with a `detail` field) under a JSON schema; every reply is validated and malformed entities are dropped. An opt-in multi-stage entity resolution runs fast lookups, then embedding similarity, then LLM verification (inspired by KGGen). An opt-in command writes graph links into a note property, and a matching command removes them. — [Simple Graph Builder](https://community.obsidian.md/plugins/simple-graph-builder)

### Inferences
- The common pattern is that the AI suggests and the user or the tool's own structure decides. Thought Dump writes links automatically, which is bolder than most tools. That makes reversibility and clear AI-generated markers more important.
- Writing AI links into a dedicated managed area (a frontmatter property or a fenced `## Related` block) rather than into body prose matches Smart Linker and Simple Graph Builder. It also makes links easy to regenerate or strip in bulk.

### Gaps
- No usable primary sources were found for Logseq AI, Heptabase AI, Recall, Fabric, or Notion AI's property autofill and linking. Searches returned only aggregator or SEO content. Recall and Fabric were not searched specifically because of the tool-call budget.
- Smart Connections internals (chunking, similarity metric, default thresholds) were not confirmed from its README.
- I found no confirmation of product shutdowns among these tools in 2024–2026. Mem 1.x → 2.0 was a full rebuild. Tana's "AI for Builders" was retired into core AI.

## 2. Embeddings vs LLM-judged links vs explicit entity links: tradeoffs, links per note, thresholds

### Takeaway
Exact title/alias matches are the most reliable link type. Embedding similarity gives good candidates but less reliable links. LLM verification on top of embeddings is the pattern used for precision. The defaults seen are about 5 links per note and a cosine threshold of about 0.7–0.75, but thresholds depend on the embedding model and must be calibrated.

### Cited Findings
- Semantic Auto-Linker states that semantic suggestions "are more conservative and less reliable than title and alias matches," and that quality "depends heavily on the embedding model." AI suggestions start unselected and need explicit acceptance even when their score is high. A local MiniLM cross-encoder re-checks top candidates, and weak or ambiguous inline matches are dropped. — [Semantic Auto-Linker](https://community.obsidian.md/plugins/semantic-auto-linker)
- Semantic Auto-Linker splits long notes into overlapping passages, merges keyword and vector results by rank, and avoids linking the same target twice in one note or linking a note to itself. — [Semantic Auto-Linker](https://community.obsidian.md/plugins/semantic-auto-linker)
- Smart Linker defaults: Top-K = **5** links, minimum cosine similarity **0.75**, similarity scores hidden by default. — [Smart Linker](https://community.obsidian.md/plugins/smart-linker)
- iText2KG (arXiv 2409.03284) used an entity-merge threshold of **0.7** with text-embedding-3-large, "to ensure high precision". GPT-4-generated pairs of *truly similar* entities averaged only **0.6 ± 0.12** cosine (relations 0.56 ± 0.1). So a 0.7 cutoff misses many true matches; it favours precision over recall. — [iText2KG](https://arxiv.org/html/2409.03284v1)
- iText2KG found that giving the LLM *all* global entities as context for relation extraction produced inferred or implied relations at lower precision (0.81–0.83). Giving only the *locally matched* entities produced directly stated relations at higher precision (0.90–0.94). — [iText2KG](https://arxiv.org/html/2409.03284v1)
- Simple Graph Builder chains exact lookup, then embedding similarity, then LLM verification for entity merging. — [Simple Graph Builder](https://community.obsidian.md/plugins/simple-graph-builder)

### Inferences
- Recommended hybrid for Thought Dump: (1) retrieve candidate older notes by embeddings (for example the top 10–20), (2) let Claude pick at most about 3 links with a one-line reason and allow "no link", and (3) always add deterministic entity links (people, projects) from exact or alias matches. The iText2KG precision result suggests the LLM should see a short, relevant candidate list, not the whole vault.
- A cap of about 3 LLM-judged links per note fits the existing app spec and stays under Smart Linker's 5. Entity links can be uncapped because they are deterministic.
- Do not hard-code a cosine threshold from these sources. 0.7–0.75 is only a starting point for one model; calibrate on the user's real notes.

### Gaps
- I found no empirical study of the "optimal" number of links per personal note. The Top-K values are plugin defaults, not research results.

## 3. Entity extraction, entity pages, and aliases ("Mom" vs "my mother")

### Takeaway
Structured tools make people, organizations, meetings and similar things first-class objects, and steer AI to choose from *existing* objects rather than invent new ones. Name variants are handled with aliases plus a resolution pipeline (exact, then embedding, then LLM). Capacities suggests keeping one-off mentions as plain text instead of creating an object.

### Cited Findings
- Capacities: each person is an object "searched, opened, or referenced from everywhere". For people who appear only once, the docs suggest a plain-text attendee field instead of a full Person object. — [Capacities network of people](https://docs.capacities.io/reference/use-cases/network-of-people)
- Capacities: create a dedicated type only "if a group of notes has distinct properties and you can't achieve what you need with queries or property visibility alone". Start with simple Pages and add types later. — [Capacities content types](https://docs.capacities.io/reference/content-types)
- Tana base tags (Person, Task, Meeting…) let AI detect people, organizations, tasks and locations in meeting notes. The "is a" test: tag a node only if it really *is* that kind of thing. — [Tana supertags](https://outliner.tana.inc/learn/features/supertags)
- Obsidian `aliases` frontmatter is a YAML list. The Backlinks panel shows *unlinked mentions* of aliases (for example "AI" for "Artificial intelligence"), and linking one keeps the alias as display text. — [Obsidian Help: Aliases](https://obsidian.md/help/aliases)
- Simple Graph Builder merges variants such as "AI", "artificial intelligence" and "인공지능" into one entity, and normalizes Unicode (NFC) before matching. — [Simple Graph Builder](https://community.obsidian.md/plugins/simple-graph-builder)
- iText2KG prompts ask the LLM to extract entities that each "represent one unique concept" to avoid mixed entities. It also warns about over-merging distinct concepts (for example "bike" and "motorcycle" both becoming "vehicle"). — [iText2KG](https://arxiv.org/html/2409.03284v1)
- PROM (2025) builds personal knowledge graphs from conversations as subject–predicate–object triples, with an LLM-assisted multi-strategy fusion step to resolve conflicts. — [PROM, SciTePress 2025](https://scitepress.org/PublishedPapers/2025/138309)
- KnoBuilder (NeurIPS 2025 workshop) is an LLM-agent for personalized KG construction. It reports 91% entity-resolution accuracy on scientific corpora (self-reported). — [KnoBuilder](https://neurips.cc/virtual/2025/129837)

### Inferences
- For Thought Dump, create an entity page (`people/Mom.md`, `projects/X.md`) when an entity recurs. One option is to create the page on the 2nd mention; on the 1st, store the mention in frontmatter without creating a file, following Capacities' plain-text advice. Each entity page has `aliases: [Mom, my mother, Mum]`.
- Give Claude the list of existing entities and their aliases in the prompt, and require it to return an existing entity ID or `new`. This mirrors Capacities' "choose from existing objects". "My mother" → alias match → Mom. Ambiguous cases (for example "Sam") should be flagged for the user, not auto-merged.
- Keep entity types to a small fixed set (person, place, project, organization, topic), as with Tana base tags and Simple Graph Builder's 10 fixed types. Topics are the most sprawl-prone type and probably overlap with categories and tags.

### Gaps
- I found no source on how Capacities, Tana or Mem handle relative kinship terms ("my mother", "Mom") specifically. Alias handling is inferred from Obsidian and the KG pipelines.

## 4. Deduplication and merging of repeated thoughts

### Takeaway
I found little documented product behaviour on detecting repeated thoughts. The tool pattern is "update existing" (Mem chat can update existing notes) or "link as related". The research pattern for duplicate entities is exact match, then similarity threshold, then reuse the most similar existing item, otherwise create new.

### Cited Findings
- iText2KG incremental algorithm: for each new document, exact-match local entities against the global set. Unmatched entities are compared by cosine similarity, and the most similar global entity is reused if it clears the threshold; otherwise a new entity is added. Earlier documents are not re-resolved. — [iText2KG](https://arxiv.org/html/2409.03284v1)
- Without resolution, baselines left many duplicate entities: false discovery rate of unresolved entities 0.11–0.31 for OpenAI function calling and LangChain, versus 0–0.01 for iText2KG. Websites were the worst case, and more input documents produced more noisy nodes. — [iText2KG](https://arxiv.org/html/2409.03284v1)
- Mem 2.5.2: chat can save new notes *or update existing ones*. — [Mem App Store](https://apps.apple.com/py/app/mem-2-0-your-ai-second-brain/id1578757028?l=en-GB)
- AI Tag Curator flags "near duplicates" among tags in a vault-level health report. — [AI Tag Curator](https://community.obsidian.md/plugins/ai-tag-curator)

### Inferences
- Suggested action set for a new note whose nearest neighbour is very similar: `new` (default), `link` (relation "revisits" or "builds on"), or `merge-suggested` (shown to the user, never automatic). Re-dumping an idea is meaningful signal in a thought-capture app. Keep the new note and link it with a reason like "same idea, revisited on DATE" rather than silently merging.
- Tasks and reminders are the exception. An exact repeat ("call dentist") should prompt "already have this task — mark as duplicate?" to avoid duplicate to-dos.

### Gaps
- I found no public documentation of how Mem, Reflect, Saner or others detect a *duplicate note* (as opposed to related notes), and no thresholds for it.

## 5. Keeping AI output consistent: controlled vocabularies, schemas, existing-note index, tag sprawl

### Takeaway
Consistency comes from constraining the model: a strict JSON schema with validation, a passed-in list of existing categories, tags and entities to choose from, a small cap on tags, and periodic health checks for near-duplicate, low-frequency or over-broad tags.

### Cited Findings
- Simple Graph Builder sends a JSON schema with every request and validates every reply. Malformed entities are reported and dropped. — [Simple Graph Builder](https://community.obsidian.md/plugins/simple-graph-builder)
- AI Tag Curator's vault-level report flags low-frequency tags, near duplicates, hierarchy inconsistencies, over-broad tags, over-narrow tags and naming drift. Users apply only the recommended tags they choose. — [AI Tag Curator](https://community.obsidian.md/plugins/ai-tag-curator)
- AI Tagger lets users cap tags per note and edit the prompt. Smart Tagger generates 2–5 tags. LLM Tagger supports custom tag lists, folder exclusions, and skipping unchanged files. — [AI Note Tagger](https://www.obsidianstats.com/plugins/ai-note-tagger); [Smart Tagger](https://community.obsidian.md/plugins/smart-tagger); [LLM Tagger](https://community.obsidian.md/plugins/llm-tagger)
- Mem learns which collections a user actually uses and suggests those, proposing a new collection only for topics new to the user. — [Mem collections](https://get.mem.ai/blog/new-and-improved-collections)
- Capacities AI auto-fill picks from existing objects instead of inventing new ones. — [Capacities](https://docs.capacities.io/reference/use-cases/network-of-people)
- Tana: extend an existing tag for variants (for example "Design task" extends "Task") rather than adding unrelated tags, and check usage counts before merging or deleting tags. — [Tana supertags](https://outliner.tana.inc/learn/features/supertags)
- Obsidian forum users are sceptical; one argues tagging must be manual to make sense. — [Obsidian forum: Automatic Tag Generation](https://forum.obsidian.md/t/automatic-tag-generation/14574)

### Inferences (prompt and data rules for Thought Dump)
- Pass Claude: the existing categories with counts, the top-N existing tags with counts, the entity list with aliases, and the top 10–20 embedding-retrieved candidate notes (id, title, summary). Instruct it to reuse an existing value when meaning matches, and to set `"is_new": true` and justify any new category or tag.
- Use tool-use or structured output with enums where possible: `type` ∈ {idea, note, question, task, reminder}; `category` as an existing value or a flagged new one; `tags` as maxItems 3, lowercase, kebab-case, singular nouns, no tag that repeats the category or type.
- Normalize before saving: lowercase, trim, singular, NFC. Map near-duplicates through a synonym table the user can edit.
- Run a periodic "tag health" job like AI Tag Curator: merge tags used once, flag over-broad tags such as `idea` or `thoughts`, and suggest merges for the user to approve.

### Gaps
- I found no study measuring how much passing an existing-vocabulary list reduces tag sprawl. The benefit is supported by tool design choices, not measured data.

## 6. Human-in-the-loop: review, accept/reject, AI markers, raw source

### Takeaway
The strongest pattern is review before write. AI link suggestions start *unselected*. Each suggestion shows confidence, source type and context. Users can retarget or exclude it. AI links are kept in a managed, removable block so a bulk "remove AI links" is possible.

### Cited Findings
- Semantic Auto-Linker writes nothing until approval. The sidebar shows confidence, source type and context for each suggestion, and the user can exclude or retarget a target per row and choose inline or footer insertion. AI suggestions start unselected even with high scores. — [Semantic Auto-Linker](https://community.obsidian.md/plugins/semantic-auto-linker)
- Auto Linker: hover to preview, then insert or dismiss; semantic matches are visually marked with a dotted underline. — [Auto Linker](https://www.obsidianstats.com/plugins/auto-linker)
- Smart Linker and Simple Graph Builder keep AI links in a marked block or property, and Simple Graph Builder has a "Remove graph links from notes" command. — [Smart Linker](https://community.obsidian.md/plugins/smart-linker); [Simple Graph Builder](https://community.obsidian.md/plugins/simple-graph-builder)
- Mem: one-click accept of a suggested collection, or rename via pencil before accepting. — [Mem collections](https://get.mem.ai/blog/new-and-improved-collections)
- Reflect: AI backlink output replaces a user-selected passage on demand, so the user sees it immediately. — [Reflect blog](https://reflect.app/blog/automatically-add-backlinks-using-ai)
- Tana lets users exclude specific fields from AI autofill. — [Tana supertags](https://outliner.tana.inc/learn/features/supertags)

### Inferences
- Thought Dump writes links automatically, so mark every AI-produced field in frontmatter, for example `ai: {generated: true, model, created}` and a per-link `source: ai|user|alias` plus `reason`. Once the user edits a field, flip it to `user`, and never overwrite user-set fields on re-processing (like Tana's field exclusion).
- Store the raw dump verbatim, either as a `source` file linked from each derived note or as a `raw` block, so users can check the summary in "their voice" against what they actually said.
- Provide a one-tap "remove link" and "wrong person/merge" control, and log rejections. Rejected link pairs should not be re-suggested.

### Gaps
- I found no published data on acceptance or rejection rates for AI link suggestions.

## 7. Known failure modes

### Takeaway
The documented failure modes are: duplicate or unresolved entities that fragment the graph, over-merging distinct concepts, inferred or "hallucinated" relations when the model sees too much context, tag sprawl (low-frequency, near-duplicate, over-broad or over-narrow tags), semantic links weaker than exact matches, and graphs that get noisier as more documents arrive.

### Cited Findings
- Unresolved duplicates: entity false discovery rate up to 0.31 and relation false discovery rate up to 0.15 for standard LLM extraction on web text. Baselines produced isolated nodes with no relations, which the authors attribute to extracting entities and relations in one step ("forgetting"). — [iText2KG](https://arxiv.org/html/2409.03284v1)
- Over-merging of distinct concepts ("bike"/"motorcycle" → "vehicle") and redundant relations from unresolved entities. — [iText2KG](https://arxiv.org/html/2409.03284v1)
- Wide context leads to implied, lower-precision relations (0.81–0.83 vs 0.90–0.94 precision). — [iText2KG](https://arxiv.org/html/2409.03284v1)
- More documents (website scenario) led to more noisy nodes. — [iText2KG](https://arxiv.org/html/2409.03284v1)
- Tag pathologies named explicitly: low-frequency, near-duplicate, hierarchy-inconsistent, over-broad, over-narrow tags, and naming drift. — [AI Tag Curator](https://community.obsidian.md/plugins/ai-tag-curator)
- Semantic links are less reliable than title/alias links, and quality depends heavily on the embedding model. — [Semantic Auto-Linker](https://community.obsidian.md/plugins/semantic-auto-linker)
- Malformed LLM output (entities that fail the schema) does occur and is dropped by validation. — [Simple Graph Builder](https://community.obsidian.md/plugins/simple-graph-builder)

### Inferences
- Over-linking is likely if every note gets 3 links regardless of fit. Allow 0 links, require a specific reason, and reject generic reasons ("both about life").
- Hallucinated links are prevented structurally: Claude may only cite IDs from the supplied candidate list, and the server drops any link to an unknown ID.
- Granularity: aim for one atomic thought per note, but don't split a single thought into fragments. Run entity and relation extraction as a separate step after splitting, following iText2KG's separation result.
- Graph hygiene: hide or deprioritize low-degree tag nodes and AI links below confidence in the graph view, and show entity hubs (people, projects) prominently.

### Gaps
- I found no source quantifying "too granular vs too coarse" for AI-split notes, and no user research on over-linking in PKM graphs specifically. These are inferred from KG and tagging failure modes.
