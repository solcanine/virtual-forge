# Virtual Forge

Virtual Forge is a Product Hunt-style launch board for the Virtuals / Virtual Protocol builder ecosystem.

The app lets builders submit launches, browse a ranked feed, upvote projects, and chat with a lightweight agent called **Forge Butler**.

[![Telegram](https://img.shields.io/badge/Telegram-@solcanine-2CA5E0?style=for-the-badge&logo=telegram)](https://t.me/solcanine)
[![Twitter](https://img.shields.io/badge/Twitter-@solcanine-1DA1F2?style=for-the-badge&logo=x)](https://x.com/intent/follow?screen_name=solcanine)

## Project Name

- App name: `Virtual Forge`
- Built-in agent name: `Forge Butler`

If you want a short one-line description:

> A launch board and agent assistant for projects built around the Virtuals ecosystem.

## What This MVP Does

- Shows a ranked home feed of launches
- Supports project submission with validation
- Allows one upvote per visitor per launch
- Stores launch and vote data locally in JSON files
- Includes an agent chat page that can:
  - answer questions about the board
  - search launches
  - explain a simple Virtuals-style builder playbook
- Supports an optional OpenAI-powered planner when `OPENAI_API_KEY` is set

## Main Pages

- `/` - launch leaderboard
- `/submit` - submit a new launch
- `/launch/[id]` - launch detail page
- `/agent` - Forge Butler chat agent

## Product Logic

### Launch board

- Builders submit a project with title, tagline, URL, category, builder name, and description.
- The feed is sorted by:
  1. vote count descending
  2. newest first as the tiebreaker
- Each visitor gets an anonymous cookie-based ID.
- A visitor can upvote the same launch only once.

### Agent

Forge Butler follows a simple loop:

1. Perceive the latest user message
2. Plan how to answer
3. Act by calling internal tools
4. Synthesize a final reply

In offline mode, the agent uses deterministic routing.

If `OPENAI_API_KEY` is set, the agent can use an LLM planner with tool calling.

## Virtual Protocol Positioning

This repo is **inspired by** the Virtuals ecosystem and is useful as a builder-facing MVP, but it does **not** yet run real ACP job execution on-chain.

Right now, the app provides:

- a launch board for Virtuals-related projects
- an agent UI and tool loop
- a clean place to add a real ACP worker later

The intended next step for production-grade Virtual Protocol usage is:

- keep the Next.js app as the UI
- move ACP signing and wallet-based execution into a dedicated Node worker
- connect the web app to that worker through a queue or job table

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS

## Local Data

Local runtime data is written to `data/`:

- `data/launches.json`
- `data/votes.json`
- `data/agent-chats/`

These files are gitignored so the repo stays clean.

## Getting Started

```bash
npm install
npm run dev
```

Open:

- `http://localhost:3000`

## Environment Variables

Copy from `.env.example` if needed.

```bash
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
```

- Without `OPENAI_API_KEY`, the agent still works in offline heuristic mode.
- With `OPENAI_API_KEY`, the agent can use model-based planning and tool calling.

## Suggested Pitch

You can describe this project like this:

> Virtual Forge is a launch board and agent assistant for builders shipping in the Virtuals ecosystem.

Or more casually:

> It is a Product Hunt-style frontend for Virtuals-related projects, plus a small builder agent.

## Next Steps

Good next upgrades:

- real authentication or wallet-based identity
- project logos and screenshots
- comments and discussions
- daily or weekly leaderboards
- real ACP worker integration using the Virtuals Node SDK
