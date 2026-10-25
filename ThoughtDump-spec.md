# Thinkbox — Build Spec

## 1. Overview
Thinkbox is an AI "second brain" for students. Users speak or type an idea; the AI rewrites it into a clean title and summary, assigns a category it creates on its own, and saves it instantly. Users can later browse by category, search by keyword, or ask the AI questions about their saved ideas.

**Goal:** capture ideas in seconds, store them securely, and make them easy to find later.

**Context:** Hackathon build (Bentley Antigravity Hackathon, "Campus Venture" challenge). Prioritize a working, polished end-to-end demo over extra features.

---

## 2. Tech Stack
- **Frontend:** Next.js (App Router) + TypeScript + Tailwind CSS
- **Auth:** Firebase Authentication (Google sign-in + email/password)
- **Database:** Cloud Firestore
- **AI:** Gemini API (latest Flash model), called **only from server-side** Next.js API routes
- **Voice:** Browser Web Speech API for live speech-to-text; fallback: record audio with MediaRecorder and send to Gemini for transcription
- **Hosting:** Firebase Hosting or Vercel

### Environment variables
```
GEMINI_API_KEY=            # server-only, never exposed to client
GEMINI_MODEL=              # e.g. latest Gemini Flash model name
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
FIREBASE_ADMIN_CREDENTIALS=  # server-only, for verifying ID tokens
```

---

## 3. Core User Flow
1. User signs in.
2. On the home screen, user taps the **mic button** and talks, or types into the **text box**.
3. User taps **Save** (or stops recording).
4. Server sends the raw text to Gemini, which returns a title, summary, and category.
5. Idea is **auto-saved instantly** — no confirmation step.
6. A toast confirms: "Saved to [Category]" with an **Edit** link.
7. The idea appears at the top of the feed and under its category.

---

## 4. Features

### 4.1 Capture
- Large mic button (press to start, press again to stop) with a live transcript preview while speaking.
- Text input as an alternative; Enter saves, Shift+Enter adds a new line.
- Show a "Processing…" state while the AI works.
- If AI processing fails, save the idea anyway with the raw text, title "Untitled idea," category "Unsorted," and a retry button.

### 4.2 AI Processing
For each idea, Gemini returns:
- **title** — short, 3–8 words
- **summary** — the idea rewritten clearly and concisely, preserving the user's meaning; no added facts
- **category** — chosen from the user's existing categories if one fits; otherwise a new, short category name (1–3 words, Title Case)

Always store the **original transcript** alongside the rewrite.

### 4.3 Categories
- Created automatically by the AI; no presets.
- Send the user's current category list to Gemini with each request so it reuses categories instead of creating near-duplicates (e.g., "Startup Ideas" vs. "Startups").
- User can rename a category, move an idea to another category, or merge two categories.
- Sidebar lists categories with idea counts.

### 4.4 Retrieval
- **Browse by category:** sidebar on desktop, dropdown/tab bar on mobile.
- **Keyword search:** searches title, summary, and original transcript (client-side filtering over the user's ideas is fine for the demo).
- **Ask the AI:** a chat panel where users ask questions like "What were my startup ideas from last week?" or "Summarize my ideas about my finance class." The server loads the user's ideas (title, summary, category, date) and sends them to Gemini as context. Answers must reference the specific ideas they draw from, shown as clickable cards that open the idea.

### 4.5 Idea Detail
- Shows title, summary, category, created/updated dates.
- Toggle to view the original transcript.
- Edit title, summary, and category inline.
- Delete with a confirmation dialog.

### 4.6 Export / Backup
- Settings → **Export all ideas** as Markdown (one file, grouped by category) or JSON.

---

## 5. Data Model (Firestore)

```
users/{uid}
  displayName: string
  email: string
  createdAt: timestamp

users/{uid}/ideas/{ideaId}
  title: string
  summary: string
  originalText: string
  category: string
  inputType: "voice" | "text"
  status: "processed" | "unprocessed"
  createdAt: timestamp
  updatedAt: timestamp

users/{uid}/categories/{categoryId}
  name: string
  ideaCount: number
  createdAt: timestamp
```

---

## 6. API Routes (Next.js, server-side)
All routes verify the Firebase ID token from the `Authorization` header and use the token's `uid` — never a uid sent by the client.

| Route | Method | Purpose |
|---|---|---|
| `/api/ideas/process` | POST | Takes raw text, calls Gemini, saves the idea, returns it |
| `/api/ideas/reprocess` | POST | Retries AI processing for an unprocessed idea |
| `/api/ask` | POST | Takes a question, loads user's ideas, returns AI answer + referenced idea IDs |
| `/api/transcribe` | POST | Fallback: takes audio, returns transcript via Gemini |
| `/api/export` | GET | Returns all ideas as Markdown or JSON |

---

## 7. Gemini Prompts

### 7.1 Process idea
Use Gemini's structured JSON output mode with this schema:
```json
{ "title": "string", "summary": "string", "category": "string" }
```

System prompt:
```
You organize a student's ideas. Given a raw idea (often spoken, messy, or rambling),
return:
- title: 3-8 words capturing the core idea.
- summary: a clear, concise rewrite in the user's voice. Keep every key detail.
  Do not add facts, opinions, or suggestions the user did not say.
- category: reuse one of the EXISTING CATEGORIES if it fits. Only create a new
  category if none fit. New categories are 1-3 words, Title Case, broad enough to
  hold future ideas (e.g., "Startup Ideas", "Finance Class", "Personal Goals").

EXISTING CATEGORIES: {categoryList}
RAW IDEA: {originalText}
```

### 7.2 Ask the AI
```
You answer questions about the user's saved ideas. Use ONLY the ideas provided.
If none are relevant, say so plainly. Return JSON:
{ "answer": "string", "ideaIds": ["string"] }
Keep answers short and concrete.

TODAY: {date}
IDEAS: {JSON list of id, title, summary, category, createdAt}
QUESTION: {question}
```

---

## 8. Security
- **Firestore security rules:** a user can read and write only `users/{their uid}/**`. Deny everything else.
- **Encryption:** Firebase encrypts data at rest and in transit (HTTPS/TLS) by default; state this in the app's privacy note.
- **API key safety:** Gemini key lives only on the server. No AI calls from the browser.
- **Input limits:** max 5,000 characters per idea; max 2 minutes per voice recording; basic rate limit on `/api/ideas/process` and `/api/ask` (e.g., 30 requests/minute per user).
- Ideas are sent to Gemini only for processing and answering; mention this in a one-line privacy note on the sign-in page.

Example rules:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## 9. UI / Design
- **Style:** clean and minimal (Notion / Apple Notes feel), with light and dark mode following the system setting plus a manual toggle.
- **Layout (desktop):** left sidebar (search bar, "All ideas," category list, Ask AI button) and main feed of idea cards.
- **Layout (mobile):** feed with a floating mic button; categories in a top dropdown; Ask AI as a bottom sheet.
- **Idea card:** title, 2-line summary preview, category pill, relative date ("2h ago").
- **Capture bar:** pinned at the top of the feed with the mic button and text input.
- Neutral palette, one accent color, generous spacing, system font or Inter.
- Empty state: "Say or type your first idea" with an example prompt.

### Screens
1. Sign-in
2. Home (capture bar + feed + sidebar)
3. Idea detail / edit
4. Ask AI panel
5. Settings (export, theme, sign out)

---

## 10. PWA + Quick Capture

### 10.1 Installable PWA
Make Thinkbox installable on phones and desktops as a Progressive Web App.
- Add `app/manifest.ts` (or `public/manifest.json`):
  - `name`: "Thinkbox", `short_name`: "Thinkbox"
  - `start_url`: "/", `display`: "standalone", `scope`: "/"
  - `theme_color` and `background_color` matching the UI (light mode values)
  - Icons: 192×192 and 512×512 PNG, plus a 512×512 maskable icon
  - `shortcuts`: one entry, "Quick Capture" → `/quick`
- Add `apple-touch-icon` (180×180) and the `apple-mobile-web-app-capable` / `apple-mobile-web-app-status-bar-style` meta tags for iPhone.
- Register a service worker (e.g., `@serwist/next` or a minimal custom `sw.js`) that caches the app shell so the app opens instantly. Ideas still require a connection to save. If offline, show "You're offline. Connect to save ideas."
- Must be served over HTTPS (Firebase Hosting or Vercel handles this).
- Phone install: iPhone Safari → Share → Add to Home Screen; Android Chrome → Install app.
- Desktop install: Chrome address bar install icon → opens in its own window.

### 10.2 `/quick` Page (Mini Capture Window)
A compact page designed to run in a narrow window on the side of the desktop screen, like a sidebar.
- **Route:** `/quick` (requires sign-in; redirects to sign-in and back if needed)
- **Target size:** looks good at 360–420px wide and 500–700px tall; no horizontal scrolling
- **Contents, top to bottom:**
  1. Small header: Thinkbox logo, link "Open full app ↗" to `/`
  2. Large mic button
  3. Text input (Enter saves, Shift+Enter new line); autofocus on load
  4. Status line: "Processing…" → "Saved to [Category]"
  5. List of the **5 most recent ideas** (title + category pill); clicking one opens it in the full app
- No sidebar, search, or Ask AI on this page. Capture only.
- Uses the same `/api/ideas/process` route and auto-save behavior as the main app.
- Keyboard: `Esc` clears the input; `Ctrl/Cmd + Shift + Space` starts and stops recording while the window is focused.
- Follows light/dark theme.
- Main app's settings page includes a short "Use Quick Capture" tip: install the app, open the Quick Capture shortcut (right-click the app icon), and resize the window to sit beside your other work.

### 10.3 Voice on Phones
Browser speech recognition is unreliable on iPhone, especially in installed (standalone) mode. Therefore:
- Detect support for `SpeechRecognition` / `webkitSpeechRecognition`.
- If unsupported or it errors, automatically switch to the **audio fallback**: record with MediaRecorder, send to `/api/transcribe`, then process as normal.
- The audio fallback is **required for v1**, not a stretch goal.
- MediaRecorder format: prefer `audio/webm`; use `audio/mp4` on Safari.

---

## 11. Build Order (Hackathon Priority)
1. Next.js project + Tailwind + Firebase Auth sign-in
2. Firestore data model + security rules
3. Text capture → `/api/ideas/process` → Gemini → auto-save
4. Feed + category sidebar
5. Voice capture with Web Speech API + audio fallback (`/api/transcribe`)
6. PWA manifest, icons, and service worker; deploy over HTTPS
7. `/quick` mini capture page
8. Idea detail: edit, view original, delete
9. Keyword search
10. Ask the AI panel
11. Export (Markdown/JSON)
12. Dark mode and polish
13. Stretch: category merge; Chrome extension side panel

---

## 12. Demo Script (2 minutes)
1. Open Thinkbox from the phone's home screen and sign in with Google.
2. Speak a messy idea: "So I was thinking, like, an app where students can rent textbooks from each other on campus, maybe with Venmo, and the library could…"
3. Show it saved instantly as a clean title and summary under a new "Startup Ideas" category.
4. On the laptop, use the `/quick` window docked beside other work to type a second idea about a class; show the AI creating or reusing a category and the idea appearing on the phone.
5. Search a keyword.
6. Ask the AI: "What startup ideas do I have?" and click a referenced idea.
7. Export all ideas as Markdown.

---

## 13. Acceptance Criteria
- A new user can sign in and save an idea by voice or text in under 10 seconds.
- Each saved idea has a title, summary, category, and the original transcript.
- The AI reuses existing categories when relevant instead of creating duplicates.
- Users can only access their own ideas (verified by security rules).
- Search, category browsing, and Ask AI all return correct results.
- If Gemini fails, the idea is still saved and can be reprocessed.
- Export produces a readable Markdown file grouped by category.
- Works on desktop Chrome and mobile Safari/Chrome.
- Voice input works on desktop Chrome and on iPhone (via the audio fallback when needed).
- App installs to the home screen on iPhone and Android, and as a standalone window on desktop Chrome.
- `/quick` is usable at 360px wide and saves an idea in under 10 seconds.
