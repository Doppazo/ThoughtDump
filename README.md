# Thought Dump — AI "Second Brain"

A light-themed, notebook-desk styled Second Brain application powered by Next.js App Router, Cloud Firestore, Google Gemini AI, and Obsidian-style graph visualization.

---

## Features

- **Check-in & Voice Dump**:
  - Time-of-day greeting ("How are you feeling this afternoon?").
  - Large central microphone dial with audio pulse animation.
  - Lined notebook desk capture area with real-time speech transcription.
  - Multi-thought splitting: automatically parses rambling dumps into separate atomic notes, tasks, reminders, and questions.

- **Obsidian 2D Second Brain Graph**:
  - Interactive 2D Force-Directed Graph linking thoughts across Category Hubs.
  - Bidirectional wikilinks (`[[Note Title]]`), backlinks, and manual note connection.
  - Stabilized physics with node position locking (`Nodes Still (Locked)` / `Physics Active`).
  - Search zoom, category hub filtering, and mini local graphs per note.

- **Tools & Category Hubs**:
  - AI Lookup search bar ("Ask your brain") with semantic synthesis across all thoughts.
  - Rich category tiles with thought counts and connection stats.
  - Dedicated Category Hub pages with AI executive summaries and connected category networks.
  - Auto-extracted to-do list with interactive completion checkboxes.

- **Obsidian Vault Export**:
  - Export your entire Second Brain as a `.zip` Obsidian Vault with organized folder structures, wikilink markdown notes, and `_Category.md` hub notes.

- **PWA & Mini Capture**:
  - Installable progressive web app with service worker caching.
  - `/quick` dockable mini-window with keyboard shortcuts (`Esc`, `Cmd+Shift+Space`).

---

## Tech Stack

- **Framework**: Next.js 15 (App Router, TypeScript)
- **Styling**: Tailwind CSS, Bricolage Grotesque, Atkinson Hyperlegible, JetBrains Mono
- **Database & Auth**: Cloud Firestore, Firebase Authentication, Firebase Admin SDK
- **AI Processing**: Google Gemini API (`@google/generative-ai`)
- **Graph Visualization**: `react-force-graph-2d`
- **Exporting**: `jszip`

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Configure:
```env
# Gemini API
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-3.5-flash-lite

# Firebase Client
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin (Server-side)
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxx@your_project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### 3. Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to start dumping thoughts.
