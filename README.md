# clawdash

OpenClaw Mission Control. A terminal-aesthetic dashboard for monitoring and driving an always-on AI agent.

clawdash connects to a local OpenClaw gateway over WebSocket and renders live agent state: active sessions, scheduled jobs, memory, docs, skills, and token spend. The UI plays a full boot sequence on load and keeps the retro-terminal look throughout.

## Pages

- **Overview**: boot sequence, live gateway status, countdown to the next cron run
- **Agents**: active agent sessions and identities
- **Cron**: scheduled jobs with human-readable schedules and next-run timers
- **Costs**: token usage and spend over time, charted with Recharts
- **Skills**: installed agent skills
- **Docs**: agent documentation browser
- **Workshop**: scratch space for working with the agent

## Stack

Next.js (App Router), React, TypeScript, Tailwind CSS, SWR for polling, a WebSocket hook for live gateway events, Framer Motion, Recharts.

API routes under `app/api/` proxy the OpenClaw gateway so the browser never talks to it directly.

## Running

Requires a running OpenClaw gateway (default `ws://127.0.0.1:18789`).

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).
