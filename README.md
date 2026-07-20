# clawdash

**Terminal-UI mission control for a 24/7 AI agent.**

clawdash is the dashboard for [OpenClaw](https://github.com/dahan8473) — an always-on
agent running on a Mac Mini. It connects to the local gateway over WebSocket and renders
live agent state in a retro-terminal skin: active sessions, scheduled jobs, memory, skills,
docs, and token spend. Boots with a full POST sequence and never breaks character.

> Status: personal tool, lightly maintained. Built to watch my own agent.

## What's inside

- **Overview** — boot sequence, live gateway status, countdown to the next cron run
- **Agents** — active sessions and identities
- **Cron** — scheduled jobs with human-readable schedules and next-run timers
- **Costs** — token usage and spend over time (Recharts)
- **Skills / Docs** — installed skills and an agent-docs browser
- **Workshop** — scratch space for driving the agent

## Stack

Next.js (App Router) · React · TypeScript · Tailwind · SWR polling · a WebSocket hook for
live gateway events · Framer Motion · Recharts. API routes under `app/api/` proxy the
gateway so the browser never talks to it directly.

## Run

Requires a running OpenClaw gateway (default `ws://127.0.0.1:18789`).

```bash
npm install
npm run dev        # http://localhost:3000
```

`npm run build && npm start` to serve production · `npm run lint` to lint.
