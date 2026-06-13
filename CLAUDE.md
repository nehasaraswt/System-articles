# Content Engine — Claude Context

This file is loaded automatically by Claude Code at the start of every session.
Update it after each phase completes so future sessions have full context.

---

## Project

**Name:** Content Engine  
**Owner:** Vyomkesh Pandey  
**Purpose:** AI-powered article and diagram generator for course content  
**Ventures:** Systems Foresight Course · Ano · Nit  
**Hosted on:** Vercel  

---

## Current Status

**Build phase:** Phase 5 — deploy pending  
**Last phase completed:** Phase 4 — 2026-06-13  
**Next step:** Step 24 — Vercel deploy + Supabase integration  

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16, App Router, TypeScript |
| Styling | Tailwind CSS + Lucide React |
| AI | Claude API via Anthropic SDK (server-side only) |
| Storage | Supabase (@supabase/supabase-js) |
| Auth | None for now |
| Hosting | Vercel |

---

## Key Conventions

- API key is NEVER exposed to the browser — all Claude calls go through `/api/generate`
- `rawContent` and generated output are stored separately in KV — rawContent is the asset
- 4 parallel Claude calls per generation run (3 articles + 1 diagram)
- Remix = same rawContent + different settings → new Generation entry
- All TypeScript types live in `types/index.ts`
- All KV operations go through `lib/kv.ts`

---

## Environment Variables

`.env.local` requires:
```
ANTHROPIC_API_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

---

## Docs

- Full build plan: `docs/PLAN.md` — 23 steps across 5 phases
- Progress tracker: `docs/PROGRESS.md` — updated after each phase completes

---

## Phase Completion Log

*(Updated after each phase — add a row when a phase is done)*

| Phase | Completed | Notes |
|---|---|---|
| 1 — Project Setup (steps 1–5) | 2026-06-13 | Step 5 (Upstash) pending Vercel deploy |
| 2 — Types + Core Lib (steps 6–9) | 2026-06-13 | types/index.ts, lib/kv.ts, lib/claude.ts, lib/icons/lucide-set.ts |
| 3 — Prompts + API Routes (steps 10–14) | 2026-06-13 | prompts, parsers, 5 API routes |
| 4 — UI + Settings (steps 15–20) | 2026-06-13 | 6 screens: layout, upload, configure, output, settings, dashboard |
| 5 — History + Dashboard + Deploy (steps 21–24) | — | |
