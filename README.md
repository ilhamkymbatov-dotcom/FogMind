# FogMind

A learning platform that turns study materials into an interactive knowledge graph with
gamified fog clearing progression.

This repository is a monorepo containing one application and two shared packages.

## Structure

```
/
  frontend/    The whole site: marketing landing, auth and the product app (Vite + React + TypeScript)
  backend/     Shared Supabase logic layer (plain TypeScript, no framework)
  design/      Shared design tokens and global CSS
```

The landing site and the product app are one Vite application with a single router, so there is
one dev server, one port and one deploy. Routes fall into three groups:

| Path | Area | Chrome |
| --- | --- | --- |
| `/`, `/how-it-works`, `/product` | Public marketing landing | Landing nav, footer and the global fog |
| `/login`, `/signup` | Auth | Bare centered cards |
| `/app`, `/app/documents/:id` | Signed in product app | The app shell, no landing fog |

Signed in visitors to `/login` or `/signup` are redirected to `/app`; unauthenticated visitors to
`/app` are redirected to `/login`. The landing pages are public to everyone.

Each package manages its own dependencies and is installed independently. There is no workspace
runner configured yet.

The two shared packages are consumed as source through aliases rather than as installed
dependencies. Each alias is declared twice, once in `frontend/vite.config.ts` and once in
`frontend/tsconfig.app.json`, and the two must be kept in step:

| Alias | Resolves to | Used by |
| --- | --- | --- |
| `@fogmind/backend` | `backend/src` | frontend |
| `@fogmind/design` | `design/src` | frontend |

`design/src/globals.css` is the only definition of the design tokens. The app imports it from
`main.tsx`. Do not copy it into the app.

## Requirements

- Node.js 20 or newer
- npm 10 or newer

## Running the app

One command serves the entire site, landing and product alike:

```bash
cd frontend
npm install
npm run dev
```

The dev server starts on port 5173. `npm run build` type checks and builds the production bundle.

## Backend package

The backend is a plain TypeScript library rather than a running service. It holds the Supabase
client, database types, and query functions used by the app.

```bash
cd backend
npm install
npm run typecheck
```

## Environment variables

Every package ships a `.env.example` listing the variables it expects. Copy it to `.env.local`
(the app) or `.env` (backend) and fill in the values.

The app reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. The backend package reads
`SUPABASE_URL` and `SUPABASE_ANON_KEY`. Never commit a filled in env file.

## Internationalization

The whole site shares one dictionary set (`frontend/src/i18n`) in three languages, English,
Russian and Kazakh, with strict key parity enforced by the type system. One provider, one
`useTranslation` hook and one language switcher serve both the landing nav and the app top bar.
The choice is persisted under `fogmind.lang`, so it carries across every route.

## Tech stack

- React 19 with TypeScript in strict mode
- Vite 8
- React Router 7, with routes lazy loaded through `React.lazy` and `Suspense`
- framer-motion for the landing motion, Supabase for database and authentication
- lucide-react for icons, the only icon source permitted in this project
- Vercel as the deploy target

## Conventions

- Icons come from lucide-react only. Never paste raw SVG markup from elsewhere.
- Monochrome palette: black and white, plus at most one accent color. No gradients.
- Light theme only. There is no dark mode.
- Sharp corners. Border radius stays at or near zero.
- No emoji anywhere, and no hyphens in user facing copy.
