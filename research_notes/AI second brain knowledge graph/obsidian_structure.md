# Obsidian Best Practices for Note Structure and a Meaningful Knowledge Graph

Context: Thought Dump saves AI-split notes as Obsidian-style markdown in /raw, /audio, /ideas, /thoughts, /todos with YAML frontmatter (type, category, tags, created, source, done, example) plus a `## Related` section of reasoned links. Research date: 2026-10-25. Official help moved from help.obsidian.md to obsidian.md/help (301 redirects).

## 1. Atomic notes: what makes a good node? (Evergreen, fleeting, literature notes)

### Takeaway
A good node holds exactly one "knowledge building block" (one concept, claim, argument, observation, task). Its size is set by the idea, not by word count. Raw captures are "fleeting" raw material. The processed, titled, linked notes are the real graph nodes.

### Cited Findings
- Matuschak's core evergreen principles: notes should be atomic, concept-oriented, and densely linked. Prefer associative ontologies to hierarchical taxonomies, and write for yourself by default. Evergreen notes are "written and organized to evolve, contribute, and accumulate over time, across projects." — [Andy Matuschak, Evergreen notes](https://notes.andymatuschak.org/Evergreen_notes)
- Titles should work like APIs. A well-factored note's title becomes a handle for the whole note, so other notes can reference the idea by title alone. The techniques are separation of concerns (atomic), sharp titles ("Prefer note titles with complete phrases to sharpen claims"), and positive framings. Example titles are full claims, e.g. "Enacted experiences have incredible potential as a mass medium." — [Matuschak, Evergreen note titles are like APIs](https://notes.andymatuschak.org/Evergreen_note_titles_are_like_APIs)
- Zettelkasten.de: "Purely atomic notes are notes that contain exactly one knowledge building block." Building blocks are concepts, arguments, counter-arguments, models, hypotheses/theories, and empirical observations. Atomicity is "not a rigid law, but a guiding compass," and "idea atoms come in different sizes," so length is not the measure. — [Zettelkasten.de, Principle of Atomicity guide](https://zettelkasten.de/atomicity/guide/)
- Practical atomicity tests: the note is easy to title, can be understood at a glance, has nothing removable without breaking the idea, and has nothing missing. Sometimes a problem and its solution belong on one note because a future reader needs them together. — [Zettelkasten.de atomicity guide](https://zettelkasten.de/atomicity/guide/)
- Following Ahrens, fleeting notes and literature notes are raw material that get processed into "main notes" (the proper notes). Structure notes give "a higher-level view," while atomic notes give "a close-up of an idea." — [Zettelkasten.de atomicity guide](https://zettelkasten.de/atomicity/guide/)
- Steph Ango (Obsidian CEO) captures timestamped fragments (`YYYY-MM-DD HHmm`) through the day with a unique-note hotkey, then compiles the salient thoughts every few days. He deliberately does not automate this with LLMs: "Don't delegate understanding." — [Steph Ango, How I use Obsidian](https://stephango.com/vault)

### Inferences
- In Thought Dump's model, /raw notes are fleeting/literature notes (source captures), and /ideas and /thoughts notes are the atomic main notes. The AI splitter should aim for one idea, question, or task per note, not one sentence and not a whole dump.
- Recommendation: have the AI produce titles that are short claims or specific phrases ("Campus laundry pickup could run on student couriers"), not generic labels ("Laundry idea"). Specific titles make better graph labels, link targets, and unlinked-mention matches.
- Recommendation: a todo is naturally atomic (one action). A "thought" with a question can keep the question and context together, as the problem-plus-solution exception allows.
- Steph Ango's "don't delegate understanding" is a philosophical counterpoint to an AI-generated vault. One mitigation is to let the user edit, merge, or retitle AI notes, and to mark AI-generated links as suggestions.

### Gaps
- None of these sources gives a numeric size guideline (word count). They explicitly reject length as the criterion.

## 2. Links vs tags vs folders, and how each appears in Graph view

### Takeaway
Only links (wikilinks/embeds, including quoted links in properties) create graph edges between notes. Tags can appear as optional nodes via a toggle. Folders never appear as nodes, but they can drive color groups and filters through search (`path:`). Use links for meaning, tags for cross-cutting status/facets, and folders for coarse type/admin separation.

### Cited Findings
- Graph view: "Circles represent notes, or nodes." Lines represent internal links. "The more nodes that reference a given node, the bigger it gets." — [Obsidian Help, Graph view](https://obsidian.md/help/plugins/graph)
- Graph filters include a search-term filter (full Search syntax), a Tags toggle that shows tags as nodes, an Attachments toggle, "Existing files only" (because "a note doesn't need to exist to link to it", so unresolved links otherwise show as nodes), and an Orphans toggle for "notes without any links." Files matching Excluded files patterns "will not appear in Graph view." — [Obsidian Help, Graph view](https://obsidian.md/help/plugins/graph)
- Groups: click "New group," enter a search term, and pick a color. Groups color sets of notes. — [Obsidian Help, Graph view](https://obsidian.md/help/plugins/graph)
- Display options: arrows (link direction), text fade threshold, node size, link thickness, and Animate ("Notes and attachments appear in chronological order based on their creation time"). Forces: center, repel, link force, link distance. — [Obsidian Help, Graph view](https://obsidian.md/help/plugins/graph)
- Local graph: "a local Graph view shows you notes connected to the active note." It supports the same settings plus a Depth slider: "Each level of depth will show notes connected to the notes revealed at the previous depth." — [Obsidian Help, Graph view](https://obsidian.md/help/plugins/graph)
- Steph Ango avoids folders for organization because entries often belong to several areas. He keeps most notes in the vault root, with only References, Clippings, and admin folders (Attachments, Daily, Templates). He organizes mainly via a `categories` property containing links, with Bases as overviews. — [Steph Ango, How I use Obsidian](https://stephango.com/vault)
- Matuschak: "Prefer associative ontologies to hierarchical taxonomies." — [Matuschak, Evergreen notes](https://notes.andymatuschak.org/Evergreen_notes)
- Nested tags use `/` (e.g. `#inbox/to-read`), and searching a parent tag (`tag:inbox`) also matches its children. — [Obsidian Help, Tags](https://obsidian.md/help/tags)

### Inferences
- Graph view has no folder nodes, but because groups and filters use search syntax, Thought Dump can color by folder (`path:ideas`, `path:todos`) or hide raw sources with `-path:raw`. Obsidian Search also supports property queries like `[type:idea]`, but that operator was not verified on the pages fetched here.
- Recommendation: keep the folders. They are useful as type buckets for a mobile app and for color groups. But never rely on folders for meaning, because the graph ignores them. Meaning must come from links.
- Recommendation: use tags sparingly, for facets that don't deserve a note (status, energy, context such as `#campus`). If the app's own graph shows tags as nodes, make that optional (off by default), as Obsidian does, because high-frequency tags become hairball hubs.
- The app's own graph should copy Obsidian's toggles: tags, attachments, orphans, existing-files-only, a depth slider for the local graph, and color groups by type.

### Gaps
- The official graph page doesn't say whether tag nodes connect to every tagged note (they do in practice, but that wasn't confirmed in fetched docs). It also doesn't document incoming/outgoing/neighbor-link toggles for the local graph, which exist in recent versions but weren't documented on the fetched page.

## 3. MOCs, hub notes, PARA, Zettelkasten: which ideas suit an auto-generated vault?

### Takeaway
MOCs and structure notes (hub notes made mostly of links) are the best fit. They give the graph intentional cluster centers and give users entry points. PARA is an actionability-based folder scheme that maps loosely onto todos vs ideas, but it's less useful for a graph. The Zettelkasten pieces to adopt are atomicity, the fleeting-to-main-note pipeline, and link context.

### Cited Findings
- Nick Milo (LYT) describes MOCs as "higher-order notes," intermediate index pages made mostly of links that "map" a cluster of notes. A MOC is created when notes on a topic hit a "Mental Squeeze Point" (disorganization), and MOCs can link to other MOCs to form MOC networks. A MOC is "like a workbench for your ideas." — [Knowledge Accumulation Substack, How to Create a MOC](https://knowledgeaccumulation.substack.com/p/how-to-create-a-map-of-contents-moc); [Taskade blog on LYT](https://www.taskade.com/blog/linking-your-thinking/); [LYT blog, the 3 phases of MOCs](https://blog.linkingyourthinking.com/notes/the-3-phases-of-mocs). These are secondary summaries; the LYT page itself returned only a table of contents.
- A Zettelkasten structure note provides "a higher-level view" and serves as an entry point into an area. Each has one clear purpose. — [Zettelkasten.de atomicity guide](https://zettelkasten.de/atomicity/guide/)
- PARA has four categories. Projects are "short-term efforts… with a certain goal in mind." Areas are "important parts of your work and life that require ongoing attention." Resources are topics of ongoing interest. Archives hold inactive items. PARA organizes by actionability, not subject, and "Your system has to give you time, not take time." — [Tiago Forte, The PARA Method](https://fortelabs.com/blog/para/)
- Steph Ango uses a `categories` property with links to category notes, each showing a Bases overview, as his hub mechanism. — [Steph Ango, How I use Obsidian](https://stephango.com/vault)

### Inferences
- Recommendation: auto-generate a hub/MOC note per `category` (e.g. `Business Ideas.md`) and per recurring entity or project. Only create one after a threshold (e.g. 3 or more notes), following LYT's "squeeze point" idea, so the vault doesn't fill with one-link hubs.
- MOC bodies can be partly auto-maintained (a list of member links with one-line summaries, grouped by subtopic). Keep an editable human section too.
- PARA's Projects/Areas could be an optional `project`/`area` link property on todos and ideas. It's not worth restructuring the folders around PARA, because the current folders are by note type (raw/ideas/thoughts/todos), which is orthogonal.
- Hubs-of-hubs (category MOCs linking to a "Home" MOC) give the global graph a readable skeleton.

### Gaps
- No primary LYT source was fetched in full (paywalled/course content). The MOC definitions come from secondary summaries.

## 4. Obsidian Properties: types, YAML syntax, dates, reserved keys, links in properties, tags

### Takeaway
Supported types are Text, List, Number, Checkbox, Date, Date & time, and Tags, with one type per property name vault-wide. Obsidian writes lists as dash (block) lists, and dates as `YYYY-MM-DD` / `YYYY-MM-DDTHH:mm:ss`. Wikilinks in properties must be quoted. As of 2024–2026 they show in backlinks and in Graph view (with no built-in option to exclude them from the graph).

### Cited Findings
- Property types are Text, List, Number, Checkbox, Date, Date & time, and Tags. "All properties with that name across your vault will use the same type." The Tags type is reserved and "cannot be assigned to other properties." — [Obsidian Help, Properties](https://obsidian.md/help/properties)
- Lists use a dash on each line (`cast:` then `  - Mark Hamill`). The links example is `links:` then `  - "[[Link]]"`. — [Obsidian Help, Properties](https://obsidian.md/help/properties)
- Dates are stored as `date: 2020-08-21`. Date & time is stored as `time: 2020-08-21T10:30:00`. The picker displays the OS format, but this is the stored format. With Daily notes enabled, a date property acts as a link to that day's daily note. — [Obsidian Help, Properties](https://obsidian.md/help/properties)
- Default properties are `tags` (List), `aliases` (List), and `cssclasses` (List), plus Publish keys (`publish`, `permalink`, `description`, `image`, `cover`). `tag`, `alias`, and `cssclass` are deprecated: "Support for them as Default properties is dropped in Obsidian 1.9." — [Obsidian Help, Properties](https://obsidian.md/help/properties); deprecation first announced in [Obsidian 1.4.5 changelog](https://obsidian.md/changelog/2023-08-31-desktop-v1.4.5)
- "Internal links in text properties must be surrounded with quotes." Obsidian adds the quotes when you type in the UI, but templating tools must add them explicitly. Links work in Text and List properties. — [Obsidian Help, Properties](https://obsidian.md/help/properties)
- Unquoted `[[x]]` in YAML is parsed as nested lists/invalid. Dataview docs: "Unquoted links lead to a invalid YAML frontmatter that cannot be parsed anymore." Forum consensus: always quote. — [Obsidian Forum, Internal links in Frontmatter do work without quotes after all? (Nov 2024)](https://forum.obsidian.md/t/internal-links-in-frontmatter-do-work-without-quotes-after-all/91106)
- Backlinks: "Properties with links will now properly show in backlink entries" (v1.4.5, Aug 2023, which introduced Properties). — [Obsidian 1.4.5 changelog](https://obsidian.md/changelog/2023-08-31-desktop-v1.4.5)
- Graph: a June 3, 2026 feature request asks for "an option to disable frontmatter links to show up in Graph View." Taxonomy links in frontmatter "make the Local Graph show up a lot of connections" at depth >1, and "There is no workaround at the moment." This confirms that current Obsidian draws property links as graph edges. — [Obsidian Forum feature request #114940](https://forum.obsidian.md/t/an-option-to-disable-frontmatter-links-to-show-up-in-graph-view/114940). Older threads from before Properties said YAML links did *not* join the graph, so the behavior changed. — [Forum: Frontmatter link in the graph](https://forum.obsidian.md/t/frontmatter-link-in-the-graph/39851); [Forum: Wikilinks in YAML front matter](https://forum.obsidian.md/t/wikilinks-in-yaml-front-matter/10052)
- Inline lists vs dash lists: users report that touching the Properties UI reformats inline arrays (`[a, b]`) into dash lists. Setting Properties display to Source avoids this, or the Linter plugin can normalize to multi-line. — [Obsidian Forum, Issue with new properties display](https://forum.obsidian.md/t/issue-with-new-properties-display/66496/8) (forum reports, not official docs)
- Other rules: "Hashtags do not create tags when used in text properties." Number accepts literals only. Checkbox is `true`/`false`. JSON is accepted but saved as YAML. Nested properties are not supported (viewable in Source mode only). Markdown is not rendered in properties, by design, since properties are for "small, atomic bits of information." — [Obsidian Help, Properties](https://obsidian.md/help/properties)
- Tag rules: letters, numbers, `_`, `-`, `/`, and common Unicode/emoji are allowed. No spaces (use camelCase, PascalCase, snake_case, or kebab-case). Tags must contain at least one non-numeric character (`#1984` is invalid, `#y1984` is OK). "Tags are case-insensitive," and the Tags view shows the first-created casing. In frontmatter, tags are a list under `tags:`. — [Obsidian Help, Tags](https://obsidian.md/help/tags)
- Steph Ango's conventions: use list-type properties whenever a value might later hold more than one link, keep property names short and reused across categories, "always pluralize categories and tags," and use `YYYY-MM-DD` dates everywhere. — [Steph Ango, How I use Obsidian](https://stephango.com/vault)

### Inferences (concrete format recommendations)
- Emit `tags` as a dash list, not `[campus, startup]`. Both are valid YAML, but Obsidian rewrites inline lists on UI edit, which causes noisy diffs and sync churn.
- Lower-case kebab-case tags, never numeric-only, no `#` inside the YAML value (e.g. `- campus`, `- startups`). Pluralize, per Ango. Nested tags only for true hierarchies (`status/waiting`).
- `created: 2026-10-25T14:02` should become `2026-10-25T14:02:00`, matching the documented Date & time storage format so Obsidian types it as Date & time. Whether the seconds-less form is recognized was not verified.
- `source: "[[2026-10-25 1402 voice]]"` is correct as written (quoted). It **will** create a backlink and a graph edge to the raw note. That's good for provenance, but every raw note becomes a mini-hub. Offer a filter preset `-path:raw` to hide sources.
- Change `category: Business Ideas` (plain text, no edge) to `categories:` as a list of quoted links to hub notes, e.g. `- "[[Business Ideas]]"`. Then the graph clusters around categories, and a note can belong to more than one. Because the June 2026 forum post shows taxonomy links cluttering local graphs, the app's own graph should be able to toggle "property links" separately from "body links." Obsidian itself can't do that today.
- Keep `type` as plain text (idea/thought/todo/raw), so it doesn't create a giant supernode per type. Use it for color groups instead.
- `done: false` and `example: true` are fine as Checkbox properties. Keep each property name to one type vault-wide (never `done: "no"` in some files).
- Add `aliases` (dash list) when the AI detects alternate names. Don't use deprecated `alias`/`tag`.
- Keep properties flat (no nested objects), since Obsidian doesn't support nested properties in the UI.

### Gaps
- No official Obsidian help page or changelog entry was found that explicitly states "property links appear in Graph view." That conclusion rests on the June 2026 forum request and third-party guides. It's high-confidence but not officially documented.
- Rename auto-updating for links *inside properties* wasn't confirmed in fetched sources (it is believed to work in current versions).
- I couldn't confirm whether Obsidian types `2026-10-25T14:02` (no seconds) as Date & time.

## 5. Filename conventions: titles vs IDs, forbidden characters, aliases, duplicates, renaming

### Takeaway
Title-as-filename works well with Obsidian (wikilinks resolve by filename, and unlinked mentions match the filename). Avoid `# | ^ : %% [[ ]]` plus OS-forbidden characters. Use `aliases` for alternate names, and let Obsidian's automatic link updating handle renames.

### Cited Findings
- Wikilinks are the default (`[[Three laws of motion]]`). Markdown links require `%20` for spaces. Folder paths use forward slashes from the vault root, even on Windows. — [Obsidian Help, Internal links](https://obsidian.md/help/links)
- "A string which contains the following characters may not work as a link": `# | ^ : %% [[ ]]`. Avoid them and follow safe-filename practices. — [Obsidian Help, Internal links](https://obsidian.md/help/links)
- "Obsidian can automatically update internal links in your vault when you rename a file" (Settings → Files and links → Automatically update internal links). — [Obsidian Help, Internal links](https://obsidian.md/help/links)
- Links to non-markdown files need the extension (`[[Figure 1.png]]`). Links to nonexistent notes are allowed, and the note gets created on click. — [Obsidian Help, Internal links](https://obsidian.md/help/links)
- Aliases "should always be formatted as a list in YAML." Aliases appear in link suggestions, and choosing one inserts `[[Artificial Intelligence|AI]]` for Wikilink interoperability. Backlinks can find unlinked mentions of an alias. — [Obsidian Help, Aliases](https://obsidian.md/help/aliases)
- Steph Ango's daily notes are `YYYY-MM-DD.md`, his fragments are `YYYY-MM-DD HHmm`, and his reference notes are titled by name. — [Steph Ango, How I use Obsidian](https://stephango.com/vault)

### Inferences
- Thought Dump's `2026-10-25 1402 voice` raw naming matches Ango's timestamp convention. Keep dates/IDs for raw captures and audio, and human titles for ideas, thoughts, and todos.
- Sanitize AI titles: strip `# | ^ : %% [ ]`, and also Windows/Android-forbidden `\ / * ? " < >` (OS-level, not from fetched sources). Trim trailing periods and spaces (Windows), and cap the length (~100 characters) for mobile filesystems.
- Duplicate titles: wikilinks resolve by filename, so identical titles in different folders become ambiguous. Recommend making titles vault-unique (append a disambiguator like "(2)" or a short date), and putting the "clean" name in `aliases`.
- When the app renames a note, it must rewrite all `[[links]]`, including those in properties and `## Related` sections, as Obsidian does. Otherwise links break when the vault is opened in Obsidian.
- The colon in "Title: subtitle"-style AI titles is a common pitfall. Replace it with " – " or " - ".

### Gaps
- Obsidian's exact resolution rule for duplicate filenames (shortest path vs relative path setting) wasn't fetched.
- No official Obsidian list of OS-forbidden filename characters was fetched. The Windows list above is general knowledge.

## 6. Link density, link context, backlinks, unlinked mentions

### Takeaway
Link profusely but meaningfully. Every link should carry context (why it exists). Backlinks are automatic, so write each link once, in one direction. Unlinked mentions (by title and alias) are a cheap source of suggested links.

### Cited Findings
- Notes should be "densely linked." — [Matuschak, Evergreen notes](https://notes.andymatuschak.org/Evergreen_notes)
- Ango links the first mention of nearly everything, even if the target note doesn't exist yet: "Unresolved links are important because they are breadcrumbs for future connections between things." He also periodically opens a random note with the local graph to add missing links. — [Steph Ango, How I use Obsidian](https://stephango.com/vault)
- Zettelkasten.de emphasizes "extensive link context," so a future reader understands how notes relate. — [Zettelkasten.de atomicity guide](https://zettelkasten.de/atomicity/guide/)
- Backlinks has two lists. Linked mentions are notes that contain an internal link to the active note. Unlinked mentions are "backlinks to any unlinked occurrence of the name of the active note." Excluded files are omitted. — [Obsidian Help, Backlinks](https://obsidian.md/help/plugins/backlinks). Unlinked mentions of aliases are also found. — [Obsidian Help, Aliases](https://obsidian.md/help/aliases)
- Orphans (notes with no links) can be toggled in the graph. — [Obsidian Help, Graph view](https://obsidian.md/help/plugins/graph)
- Counterpoint: heavy taxonomy linking (in frontmatter) creates graph clutter at depth >1. — [Obsidian Forum #114940 (June 2026)](https://forum.obsidian.md/t/an-option-to-disable-frontmatter-links-to-show-up-in-graph-view/114940)

### Inferences
- Thought Dump's `## Related` with `- [[Other note]]: short reason` already follows the link-context principle. Keep the reason mandatory for AI-generated links.
- Don't write reciprocal links on both notes (A→B and B→A) just for symmetry. Backlinks give the reverse view, and duplicate edges make the graph noisier. Add a reverse link only when the reason differs.
- Prefer inline body links on first mention (Ango style) for entities. Use `## Related` for associative idea-to-idea links. Limit AI-suggested related links (e.g. 1–5 per note, with a similarity threshold) to avoid an over-linked hairball.
- Allow unresolved links to entity names (people, projects) as breadcrumbs. The app can show them as ghost nodes (Obsidian's "Existing files only" off), and auto-create the entity note once it's mentioned in a few notes.
- Orphan handling: a note with zero links should at least link to its category hub and its source raw note, so true orphans signal "needs review."

### Gaps
- No empirical study was found on optimal links per note. Guidance is qualitative.

## 7. Entities and categories: own notes? Property vs tag vs hub link?

### Takeaway
Yes. Recurring entities (people, places, projects, topics) and categories should be their own notes, so the graph clusters around them. Store category membership as a quoted link in a list property (`categories`), following Steph Ango, rather than as plain text or a tag. Accept that hubs become big nodes, and give users a filter for them.

### Cited Findings
- Ango organizes primarily through a `categories` property of links. Each category note shows a Bases overview, templates are composable (one note can be both Person and Author), reference notes (people, books, places) are titled by name, and "always pluralize categories and tags." — [Steph Ango, How I use Obsidian](https://stephango.com/vault)
- Node size grows with inbound links ("The more nodes that reference a given node, the bigger it gets"), so hub/entity notes naturally appear as large cluster centers. — [Obsidian Help, Graph view](https://obsidian.md/help/plugins/graph)
- Plain text properties don't create links, and hashtags inside text properties don't create tags. — [Obsidian Help, Properties](https://obsidian.md/help/properties)
- Matuschak's notes are concept-oriented, favoring notes about concepts over notes about sources or projects. — [Matuschak, Evergreen notes](https://notes.andymatuschak.org/Evergreen_notes)

### Inferences
- Current `category: Business Ideas` (plain text) contributes nothing to the graph. Recommendation:
  ```yaml
  categories:
    - "[[Business Ideas]]"
  people:
    - "[[Prof. Lee]]"
  projects:
    - "[[Campus Laundry App]]"
  ```
  Use plural, short, reusable property names, each always a List type.
- Tags remain for lightweight facets (`campus`, `urgent`) that don't merit a note. Rule of thumb: if you'd ever want to write *about* it or see everything connected to it, make it a note/link. If it's only a filter, use a tag.
- Graph strategy: categories are hubs (big nodes). Entities are medium nodes that bridge clusters, which is where interesting cross-category connections show up. Ideas and thoughts are leaves with associative edges.
- Because a type-wide hub (e.g. "Ideas") would connect everything, don't link `type`. Keep it as text and use colors.

### Gaps
- No source quantified when entity notes start hurting graph readability.

## 8. Embedding attachments (audio): do they create graph nodes/edges?

### Takeaway
Embeds (`![[file.webm]]`) are links with a `!` prefix. Attachment files show as graph nodes only when the graph's "Attachments" toggle is on. `.webm` is a supported audio format.

### Cited Findings
- Audio embeds use the standard embed syntax, e.g. `![[Excerpt from Mother of All Demos (1968).ogg]]`. Embeds display the file inline and stay up to date. — [Obsidian Help, Embeds](https://obsidian.md/help/embeds)
- Accepted audio formats are `.flac, .m4a, .mp3, .ogg, .wav, .webm, .3gp`. Video formats are `.mkv, .mov, .mp4, .ogv, .webm`. Playback depends on device codecs. — [Obsidian Help, Accepted file formats](https://obsidian.md/help/file-formats)
- The graph has an "Attachments" filter toggle, and Animate shows "notes and attachments" chronologically. — [Obsidian Help, Graph view](https://obsidian.md/help/plugins/graph)
- Steph Ango keeps attachments in a dedicated Attachments folder hidden from navigation. — [Steph Ango, How I use Obsidian](https://stephango.com/vault)

### Inferences
- With Attachments on, each raw note gains one edge to its audio file (a leaf node). That's harmless but adds no meaning, so default the app's graph to attachments off.
- `.webm` is ambiguous (Obsidian lists it under both audio and video). If iOS playback inside Obsidian is a concern, `.m4a` is the safer audio format on Apple devices (general knowledge, not verified here).
- Keeping /audio as a separate folder matches the "Attachments folder" convention.

### Gaps
- The Embeds help page doesn't explicitly state that embeds count as backlinks or edges. That's implied by the graph's Attachments toggle and is standard behavior, but it isn't in fetched official text.

## Summary of concrete changes for the Thought Dump format
(Inferences drawn from the findings above.)
1. `tags:` becomes a dash list of lowercase, plural, kebab-case, non-numeric tags.
2. `category:` (text) becomes `categories:` (list of quoted `"[[Hub]]"` links). Auto-create hub/MOC notes after about 3 members.
3. Add optional `people:`, `projects:`, `places:` list properties with quoted links. Create entity notes.
4. `created:` should use full `YYYY-MM-DDTHH:mm:ss`.
5. Keep `source: "[[...]]"` quoted, and offer a `-path:raw` graph filter.
6. Keep `type` as plain text, and use it plus `path:` for color groups.
7. Add `aliases:` (list) for alternate names. Sanitize titles (`# | ^ : %% [ ]` plus OS-forbidden characters), keep them vault-unique, and make them claim-like.
8. Keep `## Related` with a mandatory reason. Cap AI links at about 1–5, and avoid symmetric duplicates.
9. App graph toggles: tags, attachments, orphans, unresolved links, property links vs body links, local-graph depth.
