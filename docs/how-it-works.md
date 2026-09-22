# How the lab works

What the site does, every flow through it, and why it's built the way it is.
Written for the owner (me) first, and for anyone reading the repo second.

## The idea

A personal blog run like a lab notebook. Every post is one trip around the same loop,
written top to bottom, so a reader can follow it straight through:

1. **Question**: something caught my attention.
2. **Clarify**: what exactly am I trying to understand?
3. **Research**: what's already known, and who disagrees.
4. **Hypothesis**: a guess I could be wrong about.
5. **Experiment**: design it, then actually run it.
6. **Log**: decisions, failures, surprises along the way.
7. **Findings**: what happened, stated plainly.
8. **Reflect**: what this changes in how I think.
9. **Next question**: which starts the loop again.

The list lives in one place, `src/lib/loop.ts`. The home page explainer, the about page,
the new-post template and the editor's section prompts all read from it.

**Why one linear template instead of "experiments" holding many posts:** the first version
had experiments as containers with several log entries each. It made the writing
fragmented and the reading non-linear. One post = one loop is simpler to write and to read.

## Reader flows (public, no account)

| Page | What's there |
|---|---|
| `/` | The loop explained as plain blocks (deliberately not clickable), latest posts, question box note |
| `/p/<slug>` | The post. Left rail lists its sections and highlights the one you're reading. Share buttons, read count, link to the next post |
| `/writing` | Every post, searchable, filterable by tag and by how it ended (verdict) |
| `/questions` | Ask a question; see the public board and questions that became posts |
| `/stats` | Open stats: reads, read depth, shares, referrers, countries. Explains how it counts |
| `/about` | Bio, the loop, house rules |
| `/rss.xml`, `/sitemap.xml` | Feed with full text; sitemap for search engines |

## Admin flows (only me, at `/admin`)

Sign in at `/admin` with GitHub. Only the account in `OWNER_GITHUB_LOGIN` gets in.
There's no admin link on the public site on purpose.

### Posts: the lifecycle

```
New post ──(type anything)──▶ Draft ──Publish now──▶ Published ──Unpublish──▶ Draft
   │                            │  └──Pick a future date──▶ Scheduled ──(date passes)──▶ live
   └─(leave without typing)─▶ nothing is saved          Delete (any state) ──▶ gone
```

- **New post** is a plain link to `/admin/posts/new`. Nothing touches the database yet.
  The first autosave that contains real words or media creates the draft, and the address
  bar quietly changes to `/admin/posts/<id>`. Leave without typing and nothing is left behind.
  *Why:* the old button created a row on every click, so double clicks and abandoned
  attempts piled up as "Untitled draft" rows you couldn't remove.
- **Empty drafts are cleaned up.** Opening the posts list deletes drafts that have no title,
  subtitle or content and haven't been touched for 10 minutes. The 10 minutes stops a draft
  you're emptying in another tab from vanishing mid-edit.
- **Autosave** runs 1.2 seconds after you stop typing. Saves queue one after another so they
  never overlap (overlap used to be able to create a post twice). The top bar says
  Saved / Saving… / Unsaved changes / Not saved (with the reason).
- **Publish ▾** saves what's on screen first, then publishes, so what goes live is always
  the latest text. Pick a date in the future to schedule, or in the past to backdate.
  A title and some content are required.
- **Edits to a live post** go out as you type (autosave also refreshes the public page).
- **Unpublish** moves a post back to drafts and keeps its content.
- **Delete** asks first, then removes the post and its read stats for good.
- **The Posts list** has tabs (All / Drafts / Scheduled / Published). Each row shows the
  title, a line of its text, status, when it was edited or published, the public address,
  read count, and buttons: Edit, Preview/View, Unpublish, Delete.

### Writing a post (the editor)

A new post opens with the nine loop headings in place. Under each empty heading, faint text
prompts you for that step. Prompts never get published, and **any section you leave empty is
dropped** from the published post, so you don't have to delete unused headings.

| You want to… | How |
|---|---|
| Format text | Toolbar (B, I, S, code, link, super/subscript), or select text for the dark bubble |
| Headings, lists, quotes | Style dropdown, the list/quote buttons, or Markdown: `## `, `- `, `1. `, `> ` |
| Add an image | **Image** button, or drag a file in, or paste it. Click the image for size (normal / wide / full), alt text and remove; type the caption under it |
| Several images side by side | More ▾ → Image gallery (or drop several files at once) |
| Embed YouTube, X, Spotify, Vimeo, a Gist or any link | **Embed** button |
| Everything else | **More ▾**: callout, pull quote, code block, table, footnote, LaTeX, button, divider |
| Lab flavour | **Lab blocks ▾**: hypothesis card, verdict stamp, margin note, data chart (paste CSV) |
| Keyboard | Type `/` at the start of a line for the block menu; ⌘K link; ⌘Z / ⇧⌘Z undo/redo |
| Tags, URL, search/share text, share image | **Settings** (share image has an upload button; a card is auto-generated otherwise) |
| See it as readers will | **Preview ↗** (drafts) or **View live ↗** (published) |

The first **verdict stamp** in a post (confirmed / busted / weird / inconclusive) becomes the
post's stamp in lists, the Writing filter, the stats "lab record" and the share card.

Images upload straight from the browser to Supabase Storage (bucket `lab-images`) using a
one-time signed URL, so large files never pass through the server.

### Question box

```
Reader asks on /questions ──▶ Inbox (private) ──Put on the board──▶ Public board ──Write about it──▶ Draft post
                                   │  └──Reject──▶ Rejected (hidden, restorable)        │
                                   └──Write about it───────────────────────────────────┘
```

- Reader questions always land in the **inbox**, visible only to me. The admin nav shows a
  badge with how many are waiting.
- **Put on the board** makes it public at `/questions`. **Take down** sends it back.
- **Add to board** (in the board section) posts my own question directly.
- **Write about it** creates a draft with the question written into step 1 and credits
  whoever asked. Once that post is live, the public page shows the question as written up
  with a link to the post.
- Spam defences on the public form: a hidden honeypot field, 3 questions per hour per
  (hashed) connection, length limits.

## How reads are counted

Explained for readers at the bottom of `/stats`. In short: one read per person per post per
day; people are told apart by a salted daily hash of IP + browser (the IP is never stored,
and the hash changes daily); scroll depth at 25/50/75/100%; referrer and country; bots, link
previews and my own signed-in visits are excluded. Code: `src/lib/analytics/`, `src/app/api/track`.

## Architecture, briefly

- **Next.js 16 App Router** on Vercel (region `bom1`, Mumbai, next to the database).
  Public pages render on the server per request so counts are live.
- **Postgres on Supabase** through the transaction pooler, via Drizzle ORM and postgres.js.
  Schema: `src/lib/db/schema.ts`. Migrations: `drizzle/`.
- **Editor:** Tiptap (ProseMirror). The document is saved as JSON and also rendered to HTML
  at save time (`src/lib/editor/render.ts`), so readers never wait for rendering.
  The same schema (`src/lib/editor/extensions.ts`) drives editor and renderer, which is why
  the preview matches the live page.
- **Auth:** Auth.js with GitHub, owner-only, stateless JWT cookie. Every admin page and
  server action checks `requireOwner()` itself, because server actions are public endpoints.

### Two lessons learned the hard way

- **The /stats hang (fixed).** Without prepared statements, postgres.js sends a query with
  parameters in two steps. When it pipelined another query on the same connection, the
  Supabase pooler could hand the connection to a different backend between the steps, and
  both sides waited forever. The stats page runs seven queries at once, so it froze. Fix:
  `max_pipeline: 0` in `src/lib/db/index.ts` (one query per connection at a time).
- **Local dev uses the production database.** `.env.local` points at the live Supabase
  project, so anything you do on `localhost` is real. Never run `npm run db:seed` there.

## Testing the admin locally

`DEV_OWNER=1 npm run dev` treats you as signed in (development only; ignored in any
production build). Remember the database note above: test posts you create are real, so
delete them afterwards.

## What the editor still doesn't do (compared with Substack)

Honest gaps, roughly in order of usefulness:

- **No email newsletter.** Substack's core feature. Readers can follow via RSS only.
- **No image cropping, and no drag handle to reorder blocks.** Images and embeds can be
  dragged, but paragraphs can't be picked up and moved.
- **No version history.** Autosave overwrites; there's no "restore yesterday's draft".
- **No audio / video upload or polls.** Video works through YouTube/Vimeo embeds.
- **Questions can't be edited** before going on the board (reject and re-add instead).
- **No preview on mobile width** inside the editor (open Preview on your phone instead).
