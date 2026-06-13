# Content Engine — Claude Context

This file is loaded automatically by Claude Code at the start of every session.
Update it after each phase completes so future sessions have full context.

---

## Project

**Name:** Content Engine  
**Owner:** Vyomkesh Pandey  
**Purpose:** AI-powered article and diagram generator for course content  
**Ventures:** Systems Foresight Course · Ano · Nit  
**Hosted on:** Vercel — https://content-engine-beta-wine.vercel.app  
**GitHub:** https://github.com/nehasaraswt/System-articles  

---

## Current Status

**Build phase:** Active development — post-deploy feature iteration  
**Live URL:** https://content-engine-beta-wine.vercel.app  
**Last deploy:** 2026-06-13 (commit b39df55)  
**Next feature in progress:** Voice Library (see below)  

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16, App Router, TypeScript |
| Styling | Tailwind CSS + Lucide React |
| AI | Claude API via Anthropic SDK (server-side only) |
| Storage | Supabase (@supabase/supabase-js) — project: iujnuadllkhlwmkxeavp |
| Auth | None |
| Hosting | Vercel |

---

## Key Conventions

- API key is NEVER exposed to the browser — all Claude calls go through `/api/generate`
- `rawContent` and generated output are stored separately — rawContent is the asset
- 4 parallel Claude calls per generation (3 articles + 1 diagram)
- Remix = same rawContent + different settings → new Generation entry
- All TypeScript types live in `types/index.ts`
- All KV operations go through `lib/kv.ts`
- Supabase credentials stored as HttpOnly cookies (`ce_supabase_url`, `ce_supabase_key`) set via Settings UI — no env vars required
- `app_settings` table holds a single JSONB row with all AppSettings including voice guide, diagram prefs, and voice library examples

---

## Voice & Style System

The app has a two-layer style system to keep output close to the author's voice:

**Layer 1 — Voice Description** (`AppSettings.writingVoice`)  
A freeform text description of the author's style. Injected as the highest-priority instruction in every article prompt. The author's style guide lives at: https://docs.google.com/document/d/1mYmCXZw9vhfYUdXEPmXMnWyTRUJsbfDCAR_OOMHDWz8

**Layer 2 — Voice Library** (`AppSettings.voiceExamples`)  
A curated collection of the author's actual written pieces, each tagged by register (essay / provocation / practical). When generating, the system finds the matching example and injects it as a few-shot demonstration:
- Thought Leadership → provocation example
- How-To → practical example  
- Personal Story → essay example

Register mapping (article type → prompt register):
- `thoughtLeadershipPrompt` → provocation
- `howToPrompt` → practical
- `storyPrompt` → essay

The article prompts (in `lib/prompts/articles.ts`) have been rewritten to:
- Place the voice guide as the highest-priority block
- Describe register intent without prescribing sentence-level format
- Explicitly ban cliché hooks, CTAs, bullet points in narrative, self-help register

---

## Environment Variables

`.env.local` (all optional if using Settings UI):
```
ANTHROPIC_API_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

---

## Supabase Schema

Run once in Supabase SQL Editor (`supabase/schema.sql`):
- `generations` table — stores all Generation objects as JSONB columns
- `app_settings` table — single-row JSONB, holds AppSettings including voice examples
- RLS disabled on both tables (personal use, service_role key)

---

## Key Files

| File | Purpose |
|---|---|
| `types/index.ts` | All TypeScript contracts incl. VoiceExample, AppSettings |
| `lib/kv.ts` | All Supabase operations — reads credentials from cookies first |
| `lib/claude.ts` | Claude API wrapper — reads key from settings first |
| `lib/prompts/articles.ts` | 3 article prompt builders with voice guide + example injection |
| `lib/prompts/diagram.ts` | Diagram prompt with diagram preferences injection |
| `app/api/generate/route.ts` | POST — 4 parallel Claude calls, saves to Supabase |
| `app/api/settings/route.ts` | GET/POST AppSettings (incl. voice library) |
| `app/api/settings/supabase/route.ts` | GET/POST Supabase credentials as HttpOnly cookies |
| `app/settings/page.tsx` | Settings UI — Supabase, API key, voice guide, voice library, defaults |

---

## Phase Completion Log

| Phase | Completed | Notes |
|---|---|---|
| 1 — Project Setup (steps 1–5) | 2026-06-13 | Next.js 16, GitHub, Vercel deploy |
| 2 — Types + Core Lib (steps 6–9) | 2026-06-13 | types, kv.ts, claude.ts, lucide-set.ts |
| 3 — Prompts + API Routes (steps 10–14) | 2026-06-13 | prompts, parsers, 5 API routes |
| 4 — UI + Settings (steps 15–20) | 2026-06-13 | 6 screens incl. Settings with Supabase bootstrap |
| 5 — Deploy + Polish | 2026-06-13 | Live on Vercel, hydration fix, voice guide added |
| 6 — Voice System | in progress | Layer 1 done; Voice Library (layer 2) in progress |
