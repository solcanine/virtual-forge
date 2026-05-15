# Virtual Forge

Virtual Forge is a Product Hunt-style launch board for the Virtuals / Virtual Protocol builder ecosystem.

The app lets builders submit launches, browse a ranked feed, upvote projects, and chat with a lightweight agent called **Forge Butler**.

[![Telegram](https://img.shields.io/badge/Telegram-@solcanine-2CA5E0?style=for-the-badge&logo=telegram)](https://t.me/solcanine)
[![Twitter](https://img.shields.io/badge/Twitter-@solcanine-1DA1F2?style=for-the-badge&logo=x)](https://x.com/intent/follow?screen_name=solcanine)

## Project name

- App: **Virtual Forge**
- Agent: **Forge Butler**
- npm package name: `virtual-forge` (see `package.json`)

## What ships today (product-shaped MVP)

- **SQLite + Prisma** for launches, votes, agent sessions, and rate-limit buckets (no fragile JSON files).
- **Unique `(launchId, voterId)` votes** enforced in the database with atomic increments (race-safe vs hand-edited JSON).
- **Rate limits** (per anonymous browser cookie): votes/minute, submits/hour, agent messages/minute.
- **URL hardening**: only `http:` / `https:` URLs accepted for launches (blocks `javascript:` and similar).
- **`GET /api/health`** — returns JSON and verifies the DB responds (`SELECT 1`).
- **Dockerfile** — builds the app and runs `prisma migrate deploy` before `npm run start`.
- Optional **OpenAI** tool planner via `OPENAI_API_KEY` (still works offline without it).

## Main routes

| Path | Purpose |
|------|---------|
| `/` | Leaderboard |
| `/submit` | Submit a launch |
| `/launch/[id]` | Detail page |
| `/agent` | Forge Butler chat |
| `/api/health` | Liveness / DB check |

## Product logic

### Launch board

- Submit title, tagline, URL, category, builder, description (validated server-side).
- Feed order: **votes descending**, then **newest first**.
- Anonymous **`vf_voter` cookie** identifies a visitor for votes and agent sessions.
- **One vote per visitor per launch** at the DB layer (`Vote` uniqueness).

### Forge Butler

Perceive → plan → act (tools) → synthesize.

- **Offline**: heuristic routing + tools reading the DB.
- **With API key**: OpenAI tool calling over the same tools.

### Rate limits (defaults)

Rough caps per cookie identity:

| Action | Window | Limit |
|--------|--------|-------|
| Upvote | 1 minute | 40 |
| Submit launch | 1 hour | 12 |
| Agent message | 1 minute | 24 |

Tune these in `app/actions.ts` and `app/actions/agentActions.ts`.

## Virtual Protocol note

This repo is **Virtuals-themed** and structured so you can grow toward **ACP**, but **on-chain agent commerce is not wired here**. Keys and sellers belong in a **long-lived Node worker** (`@virtuals-protocol/acp-node`), not inside anonymous browser sessions — see comments in `lib/agent/orchestrator.ts`.

## Tech stack

- Next.js 15, React 19, TypeScript, Tailwind CSS
- Prisma ORM + SQLite (default)

## Prerequisites

- Node.js 20+
- npm

## Getting started

```bash
cp .env.example .env
# Ensure DATABASE_URL points at a writable SQLite path, e.g. file:./data/dev.db

npm install
npx prisma migrate dev    # applies migrations + runs seed on empty DB
npm run dev
```

Open `http://localhost:3000`.

### Useful scripts

| Script | Purpose |
|--------|---------|
| `npm run db:migrate` | Create/apply migrations (dev) |
| `npm run db:deploy` | Apply migrations only (production / CI) |
| `npm run db:seed` | Seed demo launches if you cleared the DB |
| `npm run db:studio` | Prisma Studio |

## Environment variables

See `.env.example`.

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | **Yes** | e.g. `file:./data/dev.db` for SQLite |
| `OPENAI_API_KEY` | No | Enables LLM planner for Forge Butler |
| `OPENAI_MODEL` | No | Defaults to `gpt-4o-mini` |

## Production checklist

1. Set **`DATABASE_URL`** on the host (SQLite on a **persistent volume**, or switch Prisma `provider` to `postgresql` and use Neon / RDS).
2. Run **`npx prisma migrate deploy`** before or on container start (see `Dockerfile` `CMD`).
3. Accept that **cookie identity is not Sybil-resistant** — add **wallet login** or **CAPTCHA** when you need real governance.
4. Add **moderation**, **spam reporting**, and **backups** before a public launch.
5. Wire a **separate ACP worker** when you are ready for real Virtual Protocol commerce.

## Docker

```bash
docker build -t virtual-forge .
docker run --rm -p 3000:3000 \
  -e DATABASE_URL=file:/app/data/prod.db \
  -v forge-data:/app/data \
  virtual-forge
```

## Pitch

> Virtual Forge is a launch board and agent assistant for builders shipping in the Virtuals ecosystem.

## Next upgrades

- Wallet or OAuth identity
- Postgres as default in production
- Media (logos, screenshots)
- Comments / daily windows
- Dedicated ACP seller worker + queue from this UI
