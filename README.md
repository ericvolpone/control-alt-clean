# 🧼 Control Alt Clean

A bubbly pastel chore tracker built with **Next.js** (App Router + TypeScript),
deployable to **GitHub Pages** as a fully static site. Mobile-first and
responsive — it's built to live on your phone and scale up to desktop.

## Features

- **Edit chores screen** — add chores with a title and a frequency (in days or weeks).
- **Sub-chores** — each chore can list up to 6 sub-chores (reminders of what the
  job includes); they inherit the parent's frequency.
- **Save individually** — every chore has its own Save button; the edit list is
  always sorted alphabetically.
- **Home tiles** — sort by **Name** or **Target Date**.
  - **Target Date** = most recent completion (or creation) + frequency.
  - Each tile shows name, frequency, target date, a signed +/- indicator (in the
    chore's own unit), and a **Chore Done** button.
  - **Chore Done** stamps today's date and the tile animates into its new sorted
    position (spring animation via framer-motion).
- **Color indicators**
  - 🟢 **Green** — ≥ 25% of the frequency remaining
  - 🟡 **Yellow** — 0–25% remaining (due soon)
  - 🔴 **Red** — overdue

## Storage

Chores are stored in the browser's `localStorage`, but behind a swappable
`ChoreRepository` interface ([lib/storage/repository.ts](lib/storage/repository.ts)).
Every method is async, so moving to a real SQL database later means writing one
new implementation and changing a single line in
[lib/storage/index.ts](lib/storage/index.ts) — no UI changes required.

## Getting started

```bash
npm install     # install dependencies
npm run dev     # start the dev server
```

> **Local URL:** because this is a GitHub **project site**, the app is served
> under a basePath (`/control-alt-clean`). Opening the bare root
> (**http://localhost:3000/**) now **redirects** to
> **http://localhost:3000/control-alt-clean/**, so either URL works.

### Scripts

| Script          | What it does                                             |
| --------------- | ------------------------------------------------------- |
| `npm run dev`   | Start the local dev server with hot reload              |
| `npm run build` | Build the static site into `out/`                       |
| `npm run serve` | Serve the built `out/` folder locally, mounted under the basePath (production-like) |
| `npm run lint`  | Run ESLint                                              |

To preview the production build locally:

```bash
npm run build
npm run serve
```

## Deploying to GitHub Pages

1. Push this repo to GitHub (branch `main`).
2. In the repo: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. The included workflow ([.github/workflows/deploy.yml](.github/workflows/deploy.yml))
   builds and deploys on every push to `main`.

Your site will be available at:

```
https://<your-username>.github.io/control-alt-clean/
```

### Different repo name or custom domain?

The basePath defaults to `/control-alt-clean` (matching this repo name). Override
it without editing config by setting an env var at build time:

```bash
# user site (https://<username>.github.io/) or a custom domain:
NEXT_PUBLIC_BASE_PATH="" npm run build

# a differently-named repo:
NEXT_PUBLIC_BASE_PATH="/my-repo-name" npm run build
```

## Project structure

```
app/                 App Router pages
  page.tsx           Home (chore tiles + sorting + done animation)
  edit/page.tsx      Edit chores (add / update / delete)
  icon.svg           Pink mop & bucket favicon
components/           ChoreTile, ChoreForm, BrandHeader
lib/
  types.ts           Domain types (SQL-friendly shapes)
  chore-logic.ts     Target date, remaining, color status
  date.ts            Local date helpers
  useChores.ts       React hook + sorting
  storage/           ChoreRepository interface + localStorage impl
```
