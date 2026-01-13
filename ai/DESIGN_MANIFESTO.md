🧠 NeuroDeck — Technical Design Manifesto - IA

## 0. Purpose of This Document

This document exists to **eliminate ambiguity**.

If a design decision is not aligned with this manifesto, it **must not be implemented**.

---

## 1. Core Principle

> The question is the product.

Everything in NeuroDeck exists to serve the **moment of the question**.

If a UI element does not improve the user’s ability to **think and answer**, it does not belong in the product.

---

## 2. Active Learning Over Information

NeuroDeck does not teach.

NeuroDeck **provokes**.

- No passive content consumption
- No exploration-driven UI
- No “study mode”

The system interrupts, asks, and disappears.

---

## 3. Silence Is a Feature

- Fewer screens
- Fewer numbers
- Fewer colors
- Fewer animations
- Fewer visual elements

> If something draws attention to itself, it is wrong.

---

## 4. No Gamification in the MVP

Gamification creates external dependency.

NeuroDeck aims for **cognitive autonomy**.

The following must never exist in the MVP:

- Points
- Streaks
- Badges
- Rankings
- Percentages
- Progress bars
- Achievements

If the user keeps using the app, it is because the **questions are good**.

---

## 5. Metrics Are Not Interface

The system may track metrics internally, but:

> Metrics must not occupy user attention.

No dashboards.

No charts.

No performance comparison.

Feedback must be **qualitative and contextual**, never evaluative.

---

## 6. The App Does Not Compete With the User’s Day

NeuroDeck:

- does not request attention
- does not invite usage
- does not demand time

It appears briefly, asks a question, then leaves.

> The app should feel invisible when no question is active.

---

## 7. User Control Is Absolute

The system may interrupt, but it must never trap the user.

- Pausing must be simple
- Configuration must be simple
- Resuming must be simple

No “smart” automation that the user cannot fully understand.

---

## 8. Content Is External, the App Is a Player

NeuroDeck is **not** a content editor.

- Questions are created externally (JSON, AI, manual curation)
- The app schedules, executes, and reinforces
- Content must remain portable and independent

> The app is disposable.
>
> The knowledge is not.

---

## 9. Design Is Functional, Never Decorative

- No banners
- No illustrative images
- No ornamental elements

Every component must answer:

> “Does this help the user answer better?”

If not, remove it.

---

## 10. Clarity Always Beats Aesthetics

Prefer:

- clear text over beautiful text
- predictable layout over creative layout
- obvious hierarchy over originality

The user must **never interpret the interface**.

---

## 11. Few Screens, Well Defined

In the MVP, screens exist only to:

- prepare interruptions
- execute questions
- control interruption flow

Every new screen must prove that it:

- reduces friction
- increases focus
- does not compete with the question

---

## 12. Final Rule (Unbreakable)

Before adding anything, ask:

> Does this make the question stronger or weaker?

If weaker, it does not enter the product.

---

---

# 🎨 Technical Design System Rules

## 13. Color System (Strict)

### Principle

> Colors are semantic, never decorative.

### Base Palette

**Background**

- `bg-primary`: #0B0F1A
- `bg-secondary`: #111827
- `bg-surface`: #161E2E

**Text**

- `text-primary`: #E5E7EB
- `text-secondary`: #9CA3AF
- `text-muted`: #6B7280

**Accent**

- `accent-primary`: #3B82F6
- `accent-hover`: #2563EB

**States**

- `success`: #22C55E
- `danger`: #EF4444
- `warning`: #F59E0B

### Rules

- No gradients
- One accent color per screen
- Never use color “for style”
- Green/red only for feedback or actions

---

## 14. Typography

### Principle

> Text is interface.

### Font

- Single sans-serif family only
- Examples: Inter, SF Pro, Roboto
- Never mix families
- Never use serif fonts

### Hierarchy

**Question**

- 20–24px
- Weight 500–600
- Line-height 1.4

**Body**

- 14–16px
- Weight 400
- Line-height 1.5

**Secondary**

- 12–13px
- Color: `text-secondary`

**Micro / shortcuts**

- 11–12px
- Color: `text-muted`

### Rules

- No centered text outside the question screen
- No ALL CAPS as style
- No long button labels

---

## 15. Spacing System

### Principle

> Spacing creates cognitive rhythm.

### Scale (multiples of 4 only)

- 4
- 8
- 12
- 16
- 24
- 32
- 48

No values outside this scale.

### Defaults

- Card padding: 24
- Option spacing: 12–16
- Section spacing: 32
- Sidebar padding: 16–24

---

## 16. Components

### Cards

- Background: `bg-surface`
- Subtle border or minimal shadow
- Border radius: 8px (fixed)

### Buttons

- One primary button per screen
- Primary = `accent-primary`
- Secondary = neutral

### Toggles

- ON = accent color
- OFF = neutral
- Never use toggles for destructive actions

---

## 17. Icons

- Always secondary to text
- Monochrome only
- Never used alone to convey meaning

---

## 18. Animations

### Principle

> Animation preserves continuity, not attention.

- Fade or short slide only
- Duration: 150–250ms
- No looping animations
- No playful motion

---

## 19. Language Rules

### Principle

> The app speaks like a tool, not a coach.

Avoid:

- “Congratulations”
- “You are doing great”
- “Keep going”

Prefer:

- “Question completed.”
- “This question may appear again.”
- “System paused.”

---

## 20. Development Gate Rule

Before merging any feature, verify:

1. Respects the conceptual manifesto
2. Uses only approved colors
3. Uses only spacing scale values
4. Introduces no distraction
5. Does not compete with the question

If any check fails, the feature does not ship.

---

## Final Statement

> NeuroDeck is a minimal cognitive system.
> Every design decision must reduce noise and increase focus.
