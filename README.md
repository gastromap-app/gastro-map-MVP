# GastroMap MVP

> AI-powered restaurant discovery PWA. Find the perfect place through natural conversation.

## Quick Start

```bash
git clone https://github.com/gastromap-app/gastro-map-MVP.git
cd gastro-map-MVP
npm install
cp .env.example .env   # fill in your keys
npm run dev
```

## Setup

### 1. Supabase
Run migrations in order via SQL Editor:
```
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_feature_flags.sql
supabase/migrations/003_community_submissions.sql
supabase/migrations/004_payments.sql
```

### 2. Environment
See `.env.example` for all required variables.  
**Critical:** `OPENROUTER_API_KEY` must be a **server-only** variable (no `VITE_` prefix).

### 3. Vercel Deploy
Connect repo → add env vars → deploy.  
Serverless functions in `/api/` are auto-detected.

## Architecture

```
src/
├── app/              # Router, Providers, ErrorBoundary
├── features/         # Feature-Sliced Design
│   ├── auth/         # Login, Signup, Onboarding
│   ├── explore/      # Map + Location list
│   ├── gastroguide/  # AI chat
│   ├── user/         # Dashboard, Profile, Saved, Visited, Leaderboard
│   ├── community/    # Add Place (controlled by feature flag)
│   ├── payments/     # Donate page (subscriptions stub)
│   └── admin/        # Full admin panel
└── shared/           # API, Stores, Components, Config
    ├── api/ai/       # OpenRouter cascade + tool-use
    └── api/payments/ # Stripe donations + subscription stub
```

See [GASTROMAP_MVP_PLAN.md](./GASTROMAP_MVP_PLAN.md) for complete product specification.

## Feature Flags

Toggle features without deploying via `/admin/feature-flags`:

| Flag | Default | Description |
|---|---|---|
| `community_submissions` | ✅ ON | Users can suggest locations |
| `donations` | ✅ ON | Stripe donation page |
| `subscription_plans` | ❌ OFF | Paywalls — see §16.7 checklist to activate |
| `bio_sync` | ❌ OFF | Apple Health integration (stub) |
| `voice_search` | ❌ OFF | Voice input (stub) |

## Activating Subscriptions

When ready to launch paid plans, follow the checklist in `GASTROMAP_MVP_PLAN.md §16.7`.  
Search for `// SUBSCRIPTION_GATE` in the codebase to find all activation points.

## Tech Stack

React 18 · Vite · Tailwind · Zustand · TanStack Query · Supabase · OpenRouter · Stripe · Leaflet · i18next · Vercel
