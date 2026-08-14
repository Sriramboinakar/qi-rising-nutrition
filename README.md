# Qi Rising Nutrition

Private nutrition coaching management platform. Manage clients, nutrition plans, check-ins, progress tracking, habits, notes, and follow-ups.

## Stack

- **Framework**: Next.js 15.3.9 (App Router, webpack)
- **Database**: Prisma 7 + PostgreSQL
- **Auth**: Auth.js v5 (credentials + JWT sessions)
- **Styling**: Tailwind CSS v4
- **Validation**: Zod
- **UI**: lucide-react, date-fns

> **Note**: Next.js 16.x has a known server action bug ("Connection closed" 500 on every action POST). This project is pinned to Next.js **15.3.9** for stable server actions.

## Local Setup

### Prerequisites

- Node.js 20+
- Docker Desktop (for local PostgreSQL)
- npm 11+

### 1. Start the database

```bash
docker compose up -d
```

This starts PostgreSQL on port **5433** (avoiding conflicts with other Postgres installs). Credentials: `qirising` / `qirising`, database `qirising`.

### 2. Configure environment

Create `.env` in the project root:

```env
DATABASE_URL="postgresql://qirising:qirising@localhost:5433/qirising?schema=public"
AUTH_SECRET="<generate a random secret>"
AUTH_TRUST_HOST=true
```

Generate a secret with: `npx auth secret` or `openssl rand -base64 32`.

### 3. Install, migrate, seed

```bash
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
```

Seed creates a super admin user:

- **Email**: `admin@qirising.com`
- **Password**: `Qirising@2026`

Optionally seed demo data (Sarah Demo client with full dataset):

```bash
npx tsx prisma/seed-demo.ts
```

### 4. Run

```bash
npm run dev
```

Open http://localhost:3000 and log in.

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run db:migrate` | Create/apply dev migrations |
| `npm run db:deploy` | Apply migrations in production |
| `npm run db:seed` | Seed admin + programs |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:generate` | Regenerate Prisma client |

## Deployment

### Option A: Vercel (recommended)

1. Push this repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo
3. Set environment variables:
   - `DATABASE_URL` → production PostgreSQL URL (e.g. Neon, Supabase, or Vercel Postgres)
   - `AUTH_SECRET` → a strong random secret
   - `AUTH_TRUST_HOST` → `true`
4. Run migrations against the production DB: `npm run db:deploy`

### Option B: Any Node host

```bash
npm run build
npm run db:deploy  # apply migrations to production DB
npm run start
```

### Production database

This app requires a PostgreSQL database. For production use:

- **Neon** (serverless Postgres) — https://neon.tech
- **Supabase** — https://supabase.com
- **Vercel Postgres** — https://vercel.com/docs/storage/vercel-postgres
- **Railway / Render / Fly.io** — managed Postgres

## Demo Data

`prisma/seed-demo.ts` creates a full demo client ("Sarah Demo") with assessment, active nutrition plan, check-ins, progress entries, habits, notes, and follow-ups — useful for testing all features.
