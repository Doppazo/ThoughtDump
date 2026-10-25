# Thought Dump: handoff for the next AI assistant

Read this first. It covers what the project is, every decision the owner made, how the code works, what's done, and what's left. Last updated 2026-10-25.

## 1. The project in one paragraph
Thought Dump is a mobile-first "AI second brain" built for a hackathon (Bentley, "Campus Venture" challenge). A student taps a big button and talks (or types, or uploads a voice memo). The AI transcribes it, splits the messy dump into separate notes (ideas, thoughts, questions, to-dos, reminders), and saves them as Obsidian-style markdown files with [[links]] between related notes. Other tabs let you browse and edit notes, ask questions answered from your notes, and check off to-dos.

## 2. How to work with the owner (important)
- The owner **doesn't code** and this is their first hackathon. Explain in plain words with no jargon. Leave file names out of summaries unless needed. Give exact clicks and text to type when they need to do something.
- Work **one phase at a time**. When a phase is done, stop, explain simply, and wait for them to say "next".
- **Don't make big decisions alone.** For anything with more than one good option, give 2–3 choices with short pros and cons and your recommendation, and let them pick. They asked to be "grilled", so don't assume.
- Keep the design **simple, clean, sleek, with few buttons**.
- Never put secret keys in chat or in code. Keys live only in `.env.local`.
- Don't create accounts in their Firebase project yourself. They enable sign-in methods themselves.
- The repo is **shared with a teammate** (github.com/Doppazo/ThoughtDump). See section 9 before pushing.

## 3. Tech stack and how to run it
- **Next.js 15.1.9** (the teammate's repo, written in TypeScript) is used as the **server only**: API routes in `src/app/api/`.
- **Front end:** plain HTML/CSS/JS in `public/`, with no React and no build step. `next.config.ts` rewrites `/` to `/index.html`.
- **AI:** Google **Gemini** via `@google/generative-ai` (the teammate's choice). Model comes from the `GEMINI_MODEL` env var (currently `gemini-3.5-flash-lite`).
- **Login and database:** **Firebase**. The browser loads the Firebase Auth compat SDK from gstatic in `public/auth.js`. The server uses `firebase-admin` (`src/lib/firebase-admin.ts`) to verify tokens and read and write Firestore.
- Node.js 24 is installed. Git is **not** installed yet.
- To run: `npm install`, then `npm run dev`, then open http://localhost:3000. A Claude preview config is in `.claude/launch.json`.
- Keys are in `.env.local` (git-ignored): `GEMINI_API_KEY`, `GEMINI_MODEL`, `NEXT_PUBLIC_FIREBASE_API_KEY/AUTH_DOMAIN/PROJECT_ID/APP_ID`, `FIREBASE_ADMIN_PROJECT_ID/CLIENT_EMAIL/PRIVATE_KEY`. Template: `.env.example`. All keys were verified working on 2026-10-25.
- **Test mode:** if the Firebase variables are empty, the app runs without accounts. There's a "Start" button that creates a local demo guest, the server keeps notes in memory (lost on restart), and demo tokens `demo-token-<id>` are accepted. Once Firebase is configured, demo tokens are refused, which was a security fix to the teammate's code. To test signed-in screens without a real account, start Next with the Firebase variables set to empty strings in the process environment (empty values win over `.env.local`).

## 4. Owner's decisions (keep these)
**Design**
- Inspired by the "How We Feel" app: **dark only**, pure black background.
- **Newsreader** serif headings and **Inter** body text, both from Google Fonts.
- Rounded dark cards with `border-radius: 32px`.
- A **floating, see-through tab bar** with a fade behind it.
- Each tab has its own color: Capture red-orange, Brain yellow, Ask blue, To-Do green.
- Note-type colors: idea yellow, thought/note purple, question blue, task green, reminder orange, raw gray.

**Navigation**
- **4 tabs:** Capture, Brain, Ask, To-Do, with small labels under the icons.
- **Settings** opens from a gear icon at the top right; the gear turns into an X to close.
- **Raw files** belong inside Brain as a "Raw" filter (Phase 5), not as a separate tab.

**Capture screen**
- A time-of-day heading ("What's on your mind this afternoon?").
- A big white round record button inside a slowly spinning ring.
- "Type instead" and "Upload a recording" options.

**Voice**
- Record with MediaRecorder, then send the audio to Gemini for an **accurate transcript**, which is the final text.
- While recording, the browser's built-in speech recognition shows **live words** on screen, as a preview only.
- If the AI transcription fails, the live words are used instead.
- Recordings are capped at 5 minutes and uploads at 4 MB, because of the hosting body-size limit.

**Playback**
- A **podcast-style player** (`public/player.js`): play/pause, skip back and forward 15 seconds, a drag bar, and 1×/1.5×/2× speed.
- Only one recording plays at a time.

**Storage**
- An **Obsidian-style vault** of .md files, saved in the user's **Firebase account** (Firestore), so data is the same on every device.

**Knowledge graph**
- Per the research, never a separate tab.
- Phase 4 put a small graph on each note.
- Later, a "Map" mode inside Brain will show theme clusters.

**Accounts**
- Firebase login: Google, email/password, and anonymous guest ("Try it without an account").

## 5. Vault and note format (the core data model)
The format is based on the research report in `reports/AI second brain knowledge graph.md`. The rules the AI follows are in `docs/ai-note-rules.md`.

**Folders**
- `raw/`: the original words, saved word for word.
- `audio/`: recordings.
- `ideas/`, `thoughts/` (notes and questions), `todos/` (tasks and reminders).
- `hubs/`: category, person, project and place notes, created automatically.
- `.thoughtdump/`: app data, such as the seeded flag and rejected links.

**Files and links**
- File name = note title, unique across the vault.
- Raw files are named by time, like `2026-10-25 1402 voice.md`.

Note example:
```markdown
---
type: idea
categories:
  - "[[Business Ideas]]"
tags:
  - campus
people:
  - "[[Prof. Lee]]"
projects:
  - "[[Campus Laundry App]]"
created: 2026-10-25T14:02:00
source: "[[2026-10-25 1402 voice]]"
ai_generated: true
user_edited:
  - title
---
# Campus laundry pickup could run on student couriers
*Sun, Oct 25, 2026*

Body in the user's voice.

## Related
<!-- ai-related:start -->
- [[Other note]]: specific reason (AI)
<!-- ai-related:end -->
- [[Link the user added]]: reason
```

**Rules the app enforces** (in `public/vault.js`)
- Categories, people, projects and places are stored as quoted links, because only links draw graph lines.
- Tags: at most 3, lowercase, words joined with hyphens.
- AI links: at most 3, and only to notes that already exist.
- A removed AI link is never suggested again (stored in `.thoughtdump/rejected-links.json`).
- Fields listed in `user_edited` are never overwritten by the AI (`updateNote(..., {byUser:false})`).
- Hub notes are created once 3 notes share a category, or once a person, project or place comes up twice.
- Aliases on hubs, e.g. "Prof. Lee" also known as "Professor Lee".
- Renaming a note rewrites every [[link]] to it.
- Changing a note's type moves it to the right folder.
- Duplicates are never merged automatically:
  - A repeated idea gets a "Revisits [[X]]" line.
  - A repeated to-do asks the user "Keep both / Remove this one".
- Raw notes embed their audio with `![[file.webm]]` and list "## Notes made from this".
- A brand-new account gets example notes once. "Clear example notes" in Settings removes them.
- "Download as Obsidian vault" builds a .zip in the browser.

## 6. Code map
**Front end (`public/`)**
- `index.html`: loads the scripts in order: auth, api, vault, player, signin, the screens, then app.
- `styles.css`: all styles. Colors are CSS variables at the top.
- `app.js`: tab bar, gear, hash routing (`#capture`, `#brain`, `#ask`, `#todo`, `#settings`), the sign-in gate, and opening the vault.
- `auth.js`: Firebase sign-in (Google with redirect fallback, email, anonymous), plus the test-mode demo guest. `Auth.token()` gives the ID token.
- `api.js`: `Api.request` / `Api.json` add `Authorization: Bearer <token>`.
- `vault.js`: everything about notes. It caches files in memory and saves to the server through `/api/vault` and `/api/audio`. Key functions: `saveNote`, `saveRaw`, `setMadeFrom`, `updateNote`, `rename`, `addUserLink`/`removeUserLink`/`removeAiLink`, `backlinks`, `deleteNote`, `syncHubs`, `setAliases`, `findDuplicateTodo`, `findRevisit`, `aiContext`, `seedIfEmpty`, `clearExamples`, `exportZip`.
- `player.js`: `AudioPlayer.create({load, label})` and `AudioPlayer.stopAll()`.
- `screens/signin.js`, `screens/capture.js`, `screens/brain.js`, `screens/ask.js`, `screens/todo.js`, `screens/graph.js`, `screens/settings.js`: all built and active.
- `force-graph.min.js`: 2D force-directed canvas library for the standalone Knowledge Graph.

**Server**
- `src/app/api/vault/route.ts`: GET lists files, PUT saves `{path, data}`, DELETE takes `?path=`.
- `src/app/api/audio/route.ts`: POST and GET audio by `?path=audio/...`.
- `src/app/api/organize/route.ts`: POST `{text, context}` returns `{thoughts, usedAI}`, using `organizeDumpWithGemini` in `src/lib/gemini/client.ts`, which follows the note rules. When Gemini is unavailable, it falls back to simple sentence splitting.
- `src/app/api/transcribe/route.ts`: the teammate's route. Multipart field `audio` returns `{transcript}` via Gemini.
- `src/app/api/ask/route.ts`: AI lookup. It accepts `{question, notes:[{id,title,summary,category,type,done}]}` and returns `{answer, ideaIds}`, where ids are vault paths and the answer cites note titles in [brackets].
- `src/app/api/config/route.ts`: public Firebase config for the browser, or `null` in test mode.
- `src/lib/vault-store.ts`: Firestore storage.
  - Text notes go in `users/{uid}/files/{encodeURIComponent(path)}`.
  - Audio is split into base64 chunks in `users/{uid}/audio`, because Firebase Storage needs a paid plan.
  - When Firebase isn't set up, files are kept in memory instead.
- Older routes from the teammate are still there but unused by this front end: `ideas/*`, `categories/*`, `dumps`, `export/*`, and `src/lib/storage.ts`. They use their old "Idea" model.
- `firestore.rules`: users can only access `users/{their uid}/**`. The server's admin SDK bypasses these rules anyway.

**Docs**
- `docs/ai-note-rules.md`
- `reports/AI second brain knowledge graph.md` (the full research report) and `research_notes/`
- `ThoughtDump-spec.md` and `thinkbox-second-brain-prompt.md`: the teammate's original specs, for reference.

## 7. Status
**Done**
- Phase 1: 4-tab shell and design.
- Phase 2: vault format.
- Phase 3: Capture (record, type with "Try a sample ramble", upload, live words, AI transcript, AI sorting, result cards with Source chips and duplicate prompts).
- Backend merge with the teammate's Firebase and Gemini code.
- Podcast player.
- Phase 4: Brain tab.
  - Cards grouped by category, type filter chips (one swipeable row), search.
  - Tap a card to open an edit screen for every field, with delete (two taps).
  - Source section with the original words and player.
  - Connections: a still radial graph (SVG, tap a dot to open it), plus lists of AI links (with remove), your links, linked from, and hubs ("Part of"). You can also add a link yourself.
  - Hub pages with "Also called" aliases, and a raw/original page.
- Phase 5: To-Do tab and Raw filter.
  - To-Do checklist for all tasks and reminders with filter chips (All, Tasks, Reminders) and search.
  - Interactive check-off that saves `done: true/false` directly to the note via `Vault.updateNote`.
  - Done items grouped at the bottom with strikethrough styling; unchecking restores them.
  - Tapping any to-do opens it directly in the Brain editor, with a `‹ To-Do` back button to return straight to the checklist.
  - Added "Raw" filter chip in the Brain tab showing unedited voice notes, typed rambles, and uploads, with audio indicators, snippets, and note count.
  - Tapping any raw card opens the original audio player and lists all notes created from it.
- Phase 6: Ask tab, Settings, and Dedicated Knowledge Graph tab.
  - 5-tab bar with the exact requested layout:
    1. `Ask`
    2. `Brain`
    3. `Capture` (bolded and accentuated in the center with a prominent circular dial matching the "How We Feel" reference design)
    4. `To-Do`
    5. `Graph`
  - Knowledge Graph tab (`public/screens/graph.js`):
    - Uses teammate Rodrigo's orbital galaxy layout: category hubs in a wide circle with individual notes radiating around their hubs.
    - Preserves the local graph inside individual notes in the Brain tab (untouched).
    - Preserves pure black `#000000` background and dark note type colors.
    - Category links (faint) vs note-to-note direct wikilinks (gold).
    - Top floating controls: search with auto-zoom and smooth center, "Category lines" toggle, "Physics locked" / "Physics active" toggle, and "Reset view" button.
    - Hover highlight dims unrelated nodes to 12% and highlights neighbors.
    - Clicking any note opens it directly in the Brain screen.
  - Ask tab (`public/screens/ask.js`):
    - AI assistant chatting with notes from `Vault.allNotes()`.
    - Suggested questions: "What should I focus on first this week?", "Summarize my business ideas", "What tasks or reminders are pending?", "What questions haven't I answered yet?".
    - Direct citations `[Note Title]` rendered as clickable inline links.
    - "Sources consulted" section with note type dots that open notes in the Brain editor.
    - Deep-linking back navigation: `‹ Ask`, `‹ Graph`, `‹ To-Do`, or `‹ Second Brain` dynamically returns to the referring screen.
  - Settings screen updated with clean vault file viewer, downloads, and account management.
- Tested at phone size (375×812) in test mode, with the real Gemini key.

**Waiting on the owner**
- Enable sign-in providers in the Firebase console: Authentication → Sign-in method → Email/Password, Google, Anonymous. Until then, real sign-in shows "isn't turned on".

**Not yet verified**
- Real microphone recording on a real phone. Phones need https, so this works best after deployment.
- Real sign-in with Google or email.

## 8. What's left (the owner's phase plan)
- **Phase 7 (later)**
  - Deploy publicly, either Vercel (spec option) or Firebase Hosting. Ask the owner.
  - Add the env vars in the host's settings.
  - Add the deployed domain to Firebase Auth → Settings → Authorized domains.
  - Then test the mic on real phones.
  - Brain "Map" mode for theme clusters.
  - Optional: wrap as a phone app with Capacitor (the owner picked "web app now, phone app later").
  - Optional: PWA install (manifest is at `src/app/manifest.ts`, icons in `public/`).
- **Research recommendations still open (do them in their phase)**
  - "Source" chips that play from the exact second (needs word timestamps).
  - Weekly digest and resurfacing.
  - A tag health check.

## 9. Before pushing to GitHub
- Git isn't installed. The owner has a GitHub account and said "GitHub later".
- The shared repo still has the teammate's original React screens. This local version **replaced those screens** at the owner's request, while keeping the teammate's backend.
- **Tell the owner to coordinate with the teammate before pushing.** Suggest pushing to a new branch first.
- Never commit `.env.local`. It's already in `.gitignore`.

## 10. Known caveats
- The AI is Gemini, not Claude, because the teammate built it on Gemini. The owner accepted this.
- Test mode stores notes in server memory, so they reset whenever the server restarts.
- `npm install` warned that some packages' install scripts didn't run (sharp, protobufjs, @firebase/util). The app works without them.
- After changing front-end files, browsers may show old copies. `next.config.ts` sends `no-cache` headers for the app files. A hard refresh (Ctrl+Shift+R) also fixes it.
