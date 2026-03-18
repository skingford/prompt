# Prompt Optimizer Web V1 - Frontend Design Spec

## Overview

A personal prompt optimization tool for the web. Workbench-style layout supporting iterative prompt optimization with diagnosis, structured rewriting, and multi-version comparison.

**Scope:** Web frontend only (V1). No history management, no mobile, no i18n.

---

## Pages

| Page | Description |
|------|-------------|
| Login | Existing design. Username + password, token-based session, auto-redirect on expiry |
| Workbench | Core functionality page, left-right dual-panel layout |

---

## Workbench Layout

```
┌─────────────────────────────────────────────────────┐
│  Top Bar: Logo / Model Selector / Theme Toggle /    │
│           Avatar + Logout                           │
├────────────────────┬────────────────────────────────┤
│                    │                                │
│   Left Panel       │   Right Panel                  │
│   (~40% width)     │   (~60% width)                 │
│                    │                                │
│  ┌──────────────┐  │  ┌─ [Diagnose] [V1] [V2] ──┐  │
│  │              │  │  │                          │  │
│  │  Prompt      │  │  │  Active tab content      │  │
│  │  Editor      │  │  │                          │  │
│  │              │  │  │                          │  │
│  │              │  │  │                          │  │
│  └──────────────┘  │  │                          │  │
│                    │  │                          │  │
│  [Diagnose] [Opt]  │  └──────────────────────────┘  │
│                    │                                │
├────────────────────┴────────────────────────────────┤
└─────────────────────────────────────────────────────┘
```

- Draggable divider between left and right panels for free resizing.
- Desktop-first, optimized for 1280px+ screens.

---

## Top Bar

| Element | Description |
|---------|-------------|
| Logo | App brand, left-aligned |
| Model Selector | Dropdown, model list driven by backend API. Each item: name, identifier, availability. Unavailable models shown greyed out with "Not Configured" label |
| Theme Toggle | Sun/moon icon button, switches light/dark mode |
| User Avatar + Logout | Right-aligned, click avatar to show logout option |

---

## Left Panel - Input Area

### Prompt Editor

- Large textarea, occupies main area of left panel
- Monospace font for clear structure visibility
- Character count display at top-right corner
- Supports Tab indentation and basic text editing shortcuts

### Action Buttons

Two buttons below the editor, horizontally aligned:

| Button | Action | Behavior |
|--------|--------|----------|
| **Diagnose** | Analyze prompt issues | Sends prompt to backend, results appear in right panel "Diagnose" tab |
| **Optimize** | Generate optimized version | Sends prompt to backend, adds new version tab in right panel |

---

## Right Panel - Results Area

### Tab Bar

Dynamically generated tabs:

```
[ Diagnose ] [ Version 1 ] [ Version 2 ] [ Version 3 ] ...
```

- **Diagnose tab**: Appears after first diagnosis. Fixed at leftmost position. Cannot be closed. Re-diagnosis overwrites content.
- **Version tabs**: New tab added per optimization. Sequentially numbered. Closeable via "x" on tab.

### Diagnose Tab Content

Card list layout, each card contains:

- **Issue type tag** (e.g., Vague, Missing, Contradictory, Redundant)
- **Issue description** - Pinpoints the specific problem
- **Improvement suggestion** - Concrete direction for fix

Bottom action: **"Optimize based on diagnosis"** button - generates an optimized version informed by the diagnosis results.

### Version Tab Content

- **Top area**: Full optimized prompt text (selectable, copyable)
- **Bottom action bar**:

| Button | Action |
|--------|--------|
| **Adopt** | Copy this version back into left panel editor for further iteration |
| **Copy** | Copy to clipboard |
| **Compare** | Show diff view against current left panel input |

### Diff / Compare Mode

Activated by clicking "Compare" on a version tab:

- Red background = deleted content
- Green background = added content
- "Exit Compare" button to return to normal view

---

## Iteration Flow

1. User writes/pastes prompt in left panel editor
2. Clicks "Diagnose" to analyze issues → results in right panel Diagnose tab
3. Clicks "Optimize" (or "Optimize based on diagnosis") → new version tab appears
4. Can click "Optimize" again for additional versions
5. Uses "Compare" to diff any version against current input
6. Clicks "Adopt" on preferred version → fills back into left panel
7. Repeats from step 2 for further refinement

---

## API Contract

Frontend calls a single backend endpoint. Backend implementation is out of scope for V1 frontend spec.

### Request

```json
{
  "prompt": "string - the prompt text",
  "model": "string - model identifier from enum list",
  "action": "diagnose | optimize",
  "diagnosis": "string? - optional, diagnosis result for diagnosis-informed optimization"
}
```

### Response

Streamed response. Frontend handles:

- **Loading state**: Button shows spinner, disables re-click
- **Streaming**: Right panel renders content in real-time as it arrives
- **Cancel**: User can abort in-progress generation
- **Error handling**: Display error message in right panel (API key invalid, model unavailable, network error)

### Model List Endpoint

```json
GET /api/models

Response:
[
  {
    "name": "Claude",
    "identifier": "claude",
    "available": true
  },
  {
    "name": "GPT",
    "identifier": "gpt",
    "available": false
  }
]
```

---

## Visual Design

### Theme System

Two modes: Light and Dark. User preference stored in `localStorage`.

| Token | Light Mode | Dark Mode |
|-------|-----------|-----------|
| Page background | `#FDFDFD` (off-white) | `#090B0B` (near-black) |
| Surface (editor, cards) | `#FFFFFF` (white) | `#171717` (gray-900) |
| Primary text | `#0E0E0E` (deep black) | `#F3F3F3` (gray-50) |
| Accent color | `#D4A27F` (warm orange) | `#D4A27F` (warm orange) |
| Borders / dividers | gray-200 | gray-700 |
| Secondary text | gray-500 | gray-400 |

- Accent color `#D4A27F` consistent across both modes (brand color)
- Gray scale inverted between modes: light uses gray-50~400, dark uses gray-600~950

### Typography

- Editor: monospace font
- UI text: system sans-serif font stack

### Components

- Buttons: accent color fill for primary actions, outlined for secondary
- Tabs: accent color underline for active tab
- Cards (diagnosis): subtle border, surface background color
- Diff view: red/green background highlights with sufficient contrast in both themes

---

## Out of Scope (V1)

- History / saved prompts
- Mobile responsive design
- Internationalization (i18n)
- Dark/light auto-detection based on system preference
- User registration / multi-user
- Backend implementation details
