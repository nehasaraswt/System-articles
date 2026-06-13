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

**Build phase:** Phase 2 starting  
**Last phase completed:** Phase 1 — 2026-06-13  
**Next step:** Step 6 — Define TypeScript types  

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16, App Router, TypeScript |
| Styling | Tailwind CSS + Lucide React |
| AI | Claude API via Anthropic SDK (server-side only) |
| Storage | Upstash Redis (@upstash/redis) |
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
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
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
| 2 — Types + Core Lib (steps 6–9) | — | |
| 3 — Prompts + API Routes (steps 10–14) | — | |
| 4 — UI + Settings (steps 15–20) | — | |
| 5 — History + Dashboard + Deploy (steps 21–24) | — | |
