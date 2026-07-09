# CareerGPS4u

A career-prep platform for ASEAN university students and fresh graduates. Paste a job
description and get interview questions, dual-language interview coaching, resume
tailoring, and a skill-gap → course roadmap — all calibrated to the Singapore, Malaysia,
or Myanmar job market, not a one-size-fits-all Western template.

## Features

1. **Onboarding & Profile** — target market, industry, and practice language recalibrate every other feature.
2. **Job Description Intake** — paste or upload a JD (PDF), auto-tagged by industry and role level.
3. **Market-Calibrated Interview Question Generator** — 5–8 questions per JD, each with a hidden "strong answer in [market]" note.
4. **Dual-Tongue CQ Interview Simulator** (flagship) — practice in English, native language, or mixed; get content/delivery/cultural-fit feedback and idiom-to-English coaching.
5. **Resume Upload & Market-Calibrated Tailoring** — format and content suggestions calibrated to local norms.
6. **RIASEC Fit Assessment with Cultural Interpretation** — a validated 36-item Holland Code quiz, layered with an AI-generated, visually-distinguished market interpretation.
7. **Skill-Gap Detection & Course Matching** — specific missing skills routed to Coursera, edX, LinkedIn Learning, SkillsFuture (SG), or HRD Corp (MY).
8. **Dashboard** — a central hub linking into all of the above.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- SQLite via Prisma 7 (driver adapter: `@prisma/adapter-better-sqlite3`)
- Cookie-based JWT sessions (bcrypt + jsonwebtoken)
- Anthropic API (`@anthropic-ai/sdk`) for all AI-powered features
- `pdf-parse` for PDF text extraction (JD / resume uploads)
- Recharts for progress and assessment charts

## Getting started

```bash
npm install
cp .env.example .env   # then fill in JWT_SECRET and ANTHROPIC_API_KEY
npx prisma migrate dev
npm run dev
```

Open http://localhost:3000.

### Environment variables

See `.env.example`:

- `DATABASE_URL` — SQLite file path (defaults to `file:./prisma/dev.db`).
- `JWT_SECRET` — secret used to sign session cookies. Generate with `openssl rand -base64 32`.
- `ANTHROPIC_API_KEY` — required for every AI-powered feature (question generation, Dual-Tongue
  coaching, resume tailoring, RIASEC interpretation, skill-gap detection). Without it, those
  features degrade gracefully with a clear in-app message instead of crashing.

## Project structure

- `src/app/(app)/*` — authenticated pages (dashboard, JD, interview, resume, RIASEC, skills).
- `src/app/api/*` — route handlers.
- `src/lib/ai.ts` — Anthropic wrapper + all per-feature prompts, JSON-schema-validated with zod.
- `src/lib/riasec.ts` — the 36-item RIASEC item bank and scoring.
- `src/lib/courses.ts` — deterministic course-search-link builder (no catalog API access yet).
- `prisma/schema.prisma` — data model.
