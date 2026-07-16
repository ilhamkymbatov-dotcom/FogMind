# FogMind

An AI learning platform that turns study materials into an interactive knowledge graph with
gamified fog clearing progression.

This repository is a monorepo containing two applications and one shared logic package.

## Structure

```
/
  landing/     Marketing and presentation site (Vite + React + TypeScript)
  frontend/    Main product application (Vite + React + TypeScript)
  backend/     Shared Supabase logic layer (plain TypeScript, no framework)
```

Each package manages its own dependencies and is installed independently. There is no workspace
runner configured yet.

## Requirements

- Node.js 20 or newer
- npm 10 or newer

## Running the landing site

```bash
cd landing
npm install
npm run dev
```

## Running the frontend application

```bash
cd frontend
npm install
npm run dev
```

Both apps start on port 5173 by default. Run only one at a time, or Vite will move the second to
the next free port.

## Backend package

The backend is a plain TypeScript library rather than a running service. It holds the Supabase
client, database types, and query functions shared by the two apps.

```bash
cd backend
npm install
npm run typecheck
```

## Environment variables

Every package ships a `.env.example` listing the variables it expects. Copy it to `.env.local`
(apps) or `.env` (backend) and fill in the values.

The apps read `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. The backend package reads
`SUPABASE_URL` and `SUPABASE_ANON_KEY`. Never commit a filled in env file.

## Tech stack

- React 19 with TypeScript in strict mode
- Vite 8
- React Router 7, with routes lazy loaded through `React.lazy` and `Suspense`
- Supabase for database and authentication
- lucide-react for icons, the only icon source permitted in this project
- Vercel as the deploy target

## Conventions

- Icons come from lucide-react only. Never paste raw SVG markup from elsewhere.
- Monochrome palette: black and white, plus at most one accent color. No gradients.
- Light theme only. There is no dark mode.
- Sharp corners. Border radius stays at or near zero.
- No emoji anywhere, and no hyphens in user facing copy.
