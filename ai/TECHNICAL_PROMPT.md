NeuroDeck MVP — Technical Coding Prompt

## Context

You are a senior full-stack engineer building **NeuroDeck**, a desktop application focused on **active learning through interruptions**.

The product periodically interrupts the user with **one multiple-choice question (4 options, 1 correct)**.

The question itself is the product — everything else exists only to support this moment.

This is **not** a study app, dashboard, or gamified system.

---

## Mandatory Stack

- **Electron** (desktop app)
- **React + TypeScript** (renderer process)
- **Material UI (MUI)** for UI components
- **Local JSON files as persistence** (no database, no backend)

The final build must be **standalone**.

End users must **not** need Node.js or npm installed.

---

## Core Product Rules (Do Not Break)

- **The question is the product**
- No gamification:
  - no points
  - no streaks
  - no badges
  - no rankings
  - no percentages
  - no progress bars
- No dashboards or charts
- No decorative banners or images
- UI must be minimal, dark, silent, technical
- Text language: **pt-BR in the UI**
- Content is external (JSON / AI-generated), the app is a player

---

## MVP Functional Scope

### 1. Deck Management

- List decks (card grid layout)
- Activate / deactivate decks (toggle)
- Create deck (minimal)
- Edit deck (name, description, tags)
- Delete deck (with confirmation)
- Import deck from JSON file
- Export deck to JSON file

No favorites, no archived state, no analytics.

---

### 2. Question Interruption (Core)

- Scheduler triggers questions while the app is running
- When triggered:
  - bring app window to front
  - show a **Question window** with a single centered card
  - optionally use `alwaysOnTop` temporarily
- User answers via:
  - mouse click
  - keyboard (1–4 + Enter)
- After answering:
  - show a short technical explanation
  - show a **Continue** button

---

### 3. Interruption Settings

- Questions per day (integer)
- Minimum interval between questions (minutes)
- Sound notification toggle
- Strict mode toggle (MVP: window stays on top, harder to dismiss)
- Pause system:
  - pause 1 hour
  - pause until tomorrow
  - pause indefinitely

---

### 4. History (Minimal)

- Simple list of recently answered questions
- No statistics, no scoring

---

## Persistence Model (Local Files)

All data is stored under Electron `userData` directory.

---

### `deck.json` — Content Only (v1 Contract)

```json
{
  "deck": {
    "id": "string",
    "name": "string",
    "description": "string",
    "tags": ["string"],
    "version": 1,
    "createdAt": "ISO-8601",
    "updatedAt": "ISO-8601"
  },
  "questions": [
    {
      "id": "string",
      "topic": "string",
      "question": "string",
      "choices": ["A", "B", "C", "D"],
      "answerIndex": 0,
      "explanation": "string",
      "tags": ["string"],
      "needsReview": false
    }
  ]
}
```

Rules:

- Exactly **4 choices**
- `answerIndex` must be 0–3
- One correct answer only
- Content must be deterministic and technical
- No user progress in this file

---

### `progress.json` — User State

```json
{
  "schemaVersion": 1,
  "decks": {
    "distributed-systems-core": {
      "isActive": true
    }
  },
  "questions": {
    "distributed-systems-core::saga-pattern-01": {
      "seen": 3,
      "correct": 1,
      "wrong": 2,
      "lastAnsweredAt": "2026-01-12T10:20:00Z",
      "nextEligibleAt": "2026-01-12T11:00:00Z"
    }
  },
  "scheduler": {
    "isPaused": false,
    "pausedUntil": null,
    "questionsPerDay": 20,
    "minIntervalMinutes": 15,
    "nextFireAt": "2026-01-12T11:05:00Z",
    "todayCount": 4,
    "todayDate": "2026-01-12"
  }
}
```

Rules:

- Progress **never** lives inside deck JSON
- Importing decks must not overwrite progress
- IDs are stable contracts

---

## Question Selection Algorithm (MVP)

1. Consider only **active decks**
2. Filter questions where `now >= nextEligibleAt`
3. Assign weight:
   - base weight = 1
   - `+2 * wrong`
   - `1 * correct` (minimum 0)
   - optional: `+1` if `needsReview === true`
4. Pick randomly using weighted selection

After answering:

- Correct → schedule later
- Wrong → reschedule sooner
- Errors must appear more frequently than correct answers

Simple logic is acceptable as long as this principle holds.

---

## Scheduler Implementation (Recommended)

No cron, no background services.

- Persist `nextFireAt`
- Run a lightweight loop every **30–60 seconds**
- On each tick:
  - if paused → skip
  - if daily limit reached → skip
  - if `now >= nextFireAt` → trigger question
- Reset daily counters when date changes

This must survive:

- app reload
- system sleep
- renderer refresh

---

## Electron Architecture

### Main Process

- File system access (JSON read/write)
- Scheduler logic
- Window management

### Renderer (React)

- UI only
- No direct filesystem access

### IPC (via `preload.ts`)

Use `contextBridge`.

No `nodeIntegration` in renderer.

Expose APIs like:

- `deck.list()`
- `deck.import(filePath)`
- `deck.export(deckId, filePath)`
- `deck.create/update/delete()`
- `settings.get/update()`
- `question.getActive()`
- `question.answer(questionKey, answerIndex)`
- `scheduler.pause(duration?)`
- `scheduler.resume()`

---

## UI Screens (MUI)

1. **Decks**
   - Card grid
   - Name, description, status toggle
   - Buttons: Import JSON, New Deck
2. **Active Question**
   - Single centered card
   - Keyboard shortcuts visible
   - Explanation after answer
3. **Create / Edit Deck**
   - Tabs: General / Questions
   - MVP: import JSON is primary
4. **Settings**
   - Questions/day
   - Interval
   - Toggles
   - System status
5. **History**
   - Simple list only

Dark theme, minimal, silent.

---

## Non-Goals (Explicitly Excluded)

- Authentication
- Cloud sync
- Analytics
- Gamification
- Advanced editors
- Mobile app

---

## Deliverables Expected

- Complete project structure
- Working Electron app
- Sample `deck.json`
- Initial `progress.json`
- Build scripts:
  - dev
  - build
  - package
- JSON validation with user-friendly errors

---

## Final Constraint

> If a feature does not make the question moment stronger, it must not be implemented.
