# Stupid Experiments and Public Findings Lab

A personal blog run like a lab notebook. Every post walks one loop, top to bottom:
question → clarify → research → hypothesis → experiment → log → findings → reflect → next question.
Readers read, share and see live stats. Only the owner writes.

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind v4 · Tiptap editor · Drizzle ORM ·
Supabase (Postgres + Storage) · Auth.js (GitHub, owner-only) · Vercel.

**Every flow, and the reasoning behind it:** [docs/how-it-works.md](docs/how-it-works.md).

## How it fits together

- **Posts** start from a fixed template: one heading per loop step (`src/lib/editor/template.ts`).
  Sections left empty are dropped when the post is rendered. The first verdict stamp in a post
  becomes its list stamp (confirmed / busted / weird / inconclusive).
- **Question box**: reader questions land in a private inbox at `/admin/questions`. The owner puts
  them on the public board, rejects them, or starts a post from one ("Write about it").
- **Analytics** are cookieless: one row per reader per post per day, keyed by a salted daily hash.
  Everything aggregate is public at `/stats`.
- The editor saves Tiptap JSON and pre-renders HTML at save time (`src/lib/editor/render.ts`),
  using the same schema as the editor (`src/lib/editor/extensions.ts`).

## Local setup

```bash
cp .env.example .env.local   # fill in the values (comments explain each)
npm install
npm run db:migrate           # create tables
npm run storage:setup        # create the public image bucket
npm run dev
```

Useful scripts: `npm run check` (typecheck, lint and tests; run it before every commit), `npm test`, `npm run db:generate` (after schema changes),
`npm run db:studio`.

## Deploying (Vercel)

1. Import the GitHub repo in Vercel (framework: Next.js, defaults are fine).
2. Add every variable from `.env.example` in Project Settings → Environment Variables.
   Set `NEXT_PUBLIC_SITE_URL` to the real domain.
3. Add the domain (`lab.samarthsaraswat.com`) and create the DNS record Vercel shows.
4. The GitHub OAuth app must list `https://<domain>/api/auth/callback/github` as a redirect URI.
5. `vercel.json` schedules a daily keep-alive so the free Supabase project never pauses.

`.env.local` points at the live database, so anything you do locally is real.
