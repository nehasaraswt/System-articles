# Content Engine — Build Plan

**Project:** Content Engine — AI-powered article and diagram generator  
**Owner:** Vyomkesh Pandey  
**Ventures:** Systems Foresight Course · Ano · Nit  
**Started:** 2026-06-13  

---

## Decisions Locked

| Decision | Choice | Reason |
|---|---|---|
| Framework | Next.js 16 (App Router) | Vercel-native, server-side API routes protect API key, extendable |
| Styling | Tailwind CSS + Lucide React | Fast, consistent, Lucide ships raw SVGs for diagram use |
| AI | Claude API via Anthropic SDK | Server-side only, key never exposed to browser |
| Storage | Upstash Redis (@upstash/redis) | Vercel KV deprecated; Upstash is the current replacement |
| Auth | None for now | Keep URL private, add NextAuth when circle expands |
| Article variants | 3 parallel Claude calls | One per angle (TL / How-To / Story), best quality + speed |
| Diagram | Inline SVG + Lucide icon set | No external dependency, exportable as PNG |
| Schema | rawContent stored separately from output | rawContent is the asset; output is one version of it |
| Hosting | Vercel | Zero config for Next.js, free tier sufficient |

---

## Article Generation Matrix

Every generation run produces **3 article variants** (one per angle).  
**Length** and **Audience** are global settings per run.

| Dimension | Options |
|---|---|
| Angle | Thought Leadership · Practical How-To · Personal Story |
| Length | Short (~300w) · Medium (~800w) · Long (~1500w) |
| Audience | Executives · Practitioners · General Public |

**Remix** = same rawContent, different settings → new generation entry.

---

## Data Model

```
Generation {
  id            string          UUID
  createdAt     string          ISO timestamp
  module {
    name        string
    tags        string[]
    venture     'systems' | 'ano' | 'nit'
    platform    ('linkedin' | 'x' | 'youtube')[]
  }
  settings {
    length      'short' | 'medium' | 'long'
    audience    'executives' | 'practitioners' | 'general'
    diagramStyle 'loop' | 'flow' | 'matrix' | 'stack' | 'ripple'
    iconStyle   'lucide' | 'none'
    toneOverride string (optional)
  }
  rawContent    string          The source content (the asset)
  articles {
    thoughtLeadership   string
    howTo               string
    story               string
  }
  diagram {
    svg         string          Full SVG string
    style       string
  }
}
```

## AppSettings Type

```
AppSettings {
  anthropicApiKey   string    Stored in KV, takes precedence over env var
  defaultVenture    'systems' | 'ano' | 'nit'
  defaultLength     'short' | 'medium' | 'long'
  defaultAudience   'executives' | 'practitioners' | 'general'
}
```

API key lookup order in `/api/generate`:  
1. `AppSettings.anthropicApiKey` from KV (set via Settings UI)  
2. `process.env.ANTHROPIC_API_KEY` (fallback for local dev / Vercel env)

## Vercel KV Key Patterns

| Key | Value |
|---|---|
| `gen:{id}` | Full Generation object as JSON |
| `gen:meta:{id}` | Lightweight metadata only (no article body) |
| `gen:index` | Sorted set — score = Unix timestamp, member = id |
| `app:settings` | AppSettings object as JSON |

---

## File Structure

```
content-engine/
├── app/
│   ├── layout.tsx                  Root layout + sidebar nav
│   ├── page.tsx                    Dashboard
│   ├── upload/
│   │   └── page.tsx                Upload screen
│   ├── generate/
│   │   └── page.tsx                Configure screen
│   ├── output/[id]/
│   │   └── page.tsx                Output screen
│   ├── history/
│   │   └── page.tsx                History screen
│   ├── settings/
│   │   └── page.tsx                Settings screen (API keys + defaults)
│   └── api/
│       ├── parse/route.ts          Parse PDF / DOCX / TXT
│       ├── generate/route.ts       4 parallel Claude calls
│       ├── history/
│       │   ├── route.ts            GET list / POST new
│       │   └── [id]/route.ts       GET one / DELETE
│       └── settings/
│           └── route.ts            GET + POST app settings
├── components/
│   ├── ui/                         Button, Card, Pill, Input, etc.
│   ├── upload/
│   │   ├── UploadZone.tsx
│   │   └── PasteArea.tsx
│   ├── generate/
│   │   ├── AnglePicker.tsx
│   │   ├── SettingsPicker.tsx
│   │   └── DiagramPicker.tsx
│   ├── output/
│   │   ├── ArticleCard.tsx
│   │   ├── ArticleGrid.tsx
│   │   └── DiagramPreview.tsx
│   ├── history/
│   │   └── HistoryItem.tsx
│   └── settings/
│       └── ApiKeyField.tsx         Masked input with reveal toggle
├── lib/
│   ├── claude.ts                   Anthropic SDK wrapper (reads key from KV → env fallback)
│   ├── kv.ts                       Vercel KV wrapper
│   ├── parsers/
│   │   ├── pdf.ts
│   │   ├── docx.ts
│   │   └── text.ts
│   ├── prompts/
│   │   ├── articles.ts             3 article prompt builders
│   │   └── diagram.ts              Diagram prompt builder
│   └── icons/
│       └── lucide-set.ts           ~30 bundled SVG paths
├── types/
│   └── index.ts                    All TypeScript interfaces
├── docs/                           This folder
│   ├── PLAN.md
│   └── PROGRESS.md
├── CLAUDE.md
├── .env.local
├── next.config.ts
└── package.json
```

---

## Step-by-Step Build Plan

### PHASE 1 — Project Setup (~1 hour)

**Step 1: Scaffold the Next.js app**  
Create a new Next.js 14 project with App Router, TypeScript, and Tailwind CSS.  
Name: `content-engine`. Confirm directory before executing.

**Step 2: Install all dependencies**  
Single install command covering:
- `@anthropic-ai/sdk` — Claude API
- `@vercel/kv` — Redis storage
- `lucide-react` — UI icons
- `pdf-parse` — PDF text extraction
- `mammoth` — DOCX text extraction
- `uuid` + `@types/uuid` — unique generation IDs

**Step 3: Configure environment variables**  
Create `.env.local` with placeholder keys:
- `ANTHROPIC_API_KEY`
- `KV_URL`
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`

Document where to get each key.

**Step 4: Push to GitHub and deploy empty shell to Vercel**  
Create GitHub repo, push, connect to Vercel.  
Confirm deployment pipeline works before writing real code.

**Step 5: Create Vercel KV database and link to project**  
Create KV store in Vercel dashboard, link to project.  
Vercel auto-injects KV env vars into production.  
Confirm connection works with a test read/write.

---

### PHASE 2 — Types and Core Libraries (~2 hours)

**Step 6: Define all TypeScript types**  
Create `types/index.ts` with:
`Module`, `GenerationSettings`, `Articles`, `Diagram`, `Generation`, `GenerationMeta`  
These are the contracts everything else depends on.

**Step 7: Write the Vercel KV wrapper**  
Create `lib/kv.ts` with four functions:
- `saveGeneration(generation)` — writes full object + meta separately
- `getGeneration(id)` — fetches one full generation
- `listGenerations()` — fetches all meta entries, sorted newest first
- `deleteGeneration(id)` — removes both full and meta entries

**Step 8: Write the Claude API wrapper**  
Create `lib/claude.ts` with:
- `callClaude(prompt, systemPrompt)` — single call, returns string
- `callClaudeParallel(prompts[])` — runs N calls via `Promise.all`, returns string array

**Step 9: Bundle the Lucide icon set for diagrams**  
Create `lib/icons/lucide-set.ts` — curated set of ~30 icon SVG path strings  
(arrow, loop, layers, brain, target, zap, users, compass, etc.)  
Exported as named constants. Claude references these by name in diagram SVGs.

---

### PHASE 3 — Prompts and API Routes (~3 hours)

**Step 10: Write the three article prompts**  
Create `lib/prompts/articles.ts` with three prompt-builder functions,  
each taking `(rawContent, settings)` and returning a complete system + user prompt:
- `thoughtLeadershipPrompt()` — big idea, counterintuitive, opinionated
- `howToPrompt()` — framework-first, numbered steps, practical
- `storyPrompt()` — personal narrative arc, emotional hook, first-person

**Step 11: Write the diagram prompt**  
Create `lib/prompts/diagram.ts`.  
Takes `(rawContent, diagramStyle, iconStyle)`.  
Instructs Claude to return a complete, self-contained SVG string  
using the bundled Lucide icon paths. Defines exact dimensions and colour variables.

**Step 12: Build the `/api/parse` route**  
Accepts `FormData` with a file (PDF, DOCX, or TXT).  
Routes to the correct parser. Returns `{ rawContent: string, wordCount: number }`.  
Test with a real PDF before moving on.

**Step 13: Build the `/api/generate` route**  
Accepts `{ rawContent, module, settings }`.  
Fires all 4 Claude calls in parallel (3 articles + 1 diagram).  
Saves the full generation to Vercel KV.  
Returns the complete `Generation` object including the new `id`.  
Test thoroughly with curl before touching the UI.

**Step 14: Build the `/api/history` routes**  
- `GET /api/history` — returns array of `GenerationMeta` (lightweight, no article body)
- `GET /api/history/[id]` — returns full `Generation`
- `DELETE /api/history/[id]` — removes from KV index and both keys

---

### PHASE 4 — UI Screens (~4 hours)

**Step 15: Build the root layout and navigation**  
`app/layout.tsx` — persistent left sidebar with logo, nav links  
(Upload · History · Dashboard). Dark theme. Responsive.

**Step 16: Build the Upload screen**  
`app/upload/page.tsx`:
- Drag-and-drop zone accepting PDF, DOCX, TXT
- Paste area as fallback
- Module name input
- Tag selector (multi-select pills)
- Venture selector (Systems Course / Ano / Nit)
- Platform target selector (LinkedIn / X / YouTube)
- Next button passes data to Configure via session storage

**Step 17: Build the Configure screen**  
`app/generate/page.tsx`:
- Angle selector — all 3 selected by default, each toggleable
- Length picker — Short / Medium / Long (single select)
- Audience picker — Executives / Practitioners / General (single select)
- Diagram style picker — Loop / Flow / Matrix / Stack / Ripple
- Icon style picker — Lucide / None
- Optional tone override textarea
- Generate button with loading state showing which of the 4 calls is in-flight

**Step 18: Build the Output screen**  
`app/output/[id]/page.tsx`:
- Three article cards side by side, labelled by angle
- Each card: angle tag, length + audience pills, scrollable body, Copy / Edit / Post actions
- Diagram panel: renders SVG inline, Download PNG (canvas), Download SVG, Regenerate
- Save to History button
- Reconfigure button (back to Configure, same rawContent pre-loaded)

**Step 19: Build the Settings screen**  
`app/settings/page.tsx` + `app/api/settings/route.ts`:
- ANTHROPIC_API_KEY field — masked by default, reveal toggle, saved to KV on submit
- Default venture / length / audience selectors (pre-fills Configure screen)
- Save button with success/error feedback
- `/api/generate` reads key from `app:settings` KV first, env var as fallback

**Step 20: Wire all screens together**  
Ensure clean data flow:  
Upload → parse API → store rawContent in state → Configure  
→ generate API → redirect to `/output/[id]` → fetch from KV → render.  
Settings defaults pre-populate Configure screen.  
Test end-to-end with real course content (Day 20 PDF).

---

### PHASE 5 — History, Dashboard, and Deploy (~2 hours)

**Step 21: Build the History screen**  
`app/history/page.tsx`:
- Fetches `GenerationMeta` list from `/api/history`
- Each row: module name, date, venture, settings pills, article count
- View → navigates to `/output/[id]`
- Remix → navigates to Configure with same rawContent pre-loaded, new generation on submit
- Delete with confirmation

**Step 22: Build the Dashboard**  
`app/page.tsx`:
- Recent 5 generations as cards
- Quick stats: total generations, modules covered, ventures
- Start New button → Upload

**Step 23: End-to-end test with real content**  
Use the actual Systems Foresight course PDFs (Day 19 and Day 20).  
Verify:
- Parsing works correctly
- All 3 article variants are distinct and high quality
- Diagram SVG renders and exports as PNG
- History persists after browser refresh
- Remix produces a new generation with different settings

**Step 24: Production deploy and smoke test**  
Final Vercel deploy with production environment variables.  
Test on live URL. Confirm KV reads/writes work in production.  
Document the URL privately.

---

## Phase Summary

| Phase | Steps | Estimated Time |
|---|---|---|
| 1 — Setup | 1–5 | 1 hour |
| 2 — Core Lib | 6–9 | 2 hours |
| 3 — API Routes | 10–14 | 3 hours |
| 4 — UI + Settings | 15–20 | 4.5 hours |
| 5 — Polish + Deploy | 21–24 | 2 hours |
| **Total** | **24 steps** | **~13.5 hours** |

---

## Future Extensions

- Add NextAuth (magic link) when extending to Ano / Nit
- Twitter thread formatter
- YouTube script formatter
- Newsletter digest formatter
- Per-venture branding (tone, style, colour)
- Bulk generation (entire course in one run)
