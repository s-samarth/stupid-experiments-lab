# Stupid Experiments and Public Findings Lab

A personal public lab: curiosity turns into experiments, experiments into writing.
Readers read, share and see live stats. Only the owner writes.

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind v4 · Tiptap editor · Drizzle ORM ·
Supabase (Postgres + Storage) · Auth.js (GitHub, owner-only) · Vercel.

## How it fits together

- **Experiments** (`EXP-012`) hold a question, hypothesis, loop stage (1–9), status and verdict.
- **Posts** are log entries, findings or standalone essays, optionally attached to an experiment.
- **Question box**: readers suggest questions anonymously; they're moderated in `/admin/questions`.
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
npm run db:seed -- --reset   # optional: sample data for local development only
npm run dev
```

Useful scripts: `npm run typecheck`, `npm run lint`, `npm run db:generate` (after schema changes),
`npm run db:studio`.

## Deploying (Vercel)

1. Import the GitHub repo in Vercel (framework: Next.js, defaults are fine).
2. Add every variable from `.env.example` in Project Settings → Environment Variables.
   Set `NEXT_PUBLIC_SITE_URL` to the real domain.
3. Add the domain (`lab.samarthsaraswat.com`) and create the DNS record Vercel shows.
4. The GitHub OAuth app must list `https://<domain>/api/auth/callback/github` as a redirect URI.
5. `vercel.json` schedules a daily keep-alive so the free Supabase project never pauses.

Never seed production: `db:seed --reset` wipes every table.
