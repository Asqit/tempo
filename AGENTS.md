# AGENTS.md

This repository contains a Vite/React frontend in [frontend](frontend). This file only covers frontend work — never read, reason about, or touch backend code.

## Working conventions

- Prefer the existing project structure instead of introducing new abstractions.
- Keep frontend feature code under [frontend/src/features](frontend/src/features) and shared UI under [frontend/src/components/ui](frontend/src/components/ui).
- Reuse existing UI primitives and patterns before creating new components.
- Prefer generated artifacts where available: do not hand-edit [frontend/src/routeTree.gen.ts](frontend/src/routeTree.gen.ts) or [frontend/src/lib/api.d.ts](frontend/src/lib/api.d.ts).
- Keep changes minimal and consistent with the existing architecture; avoid introducing new state libraries or tooling unless clearly necessary.

## Commands

- Run everything from [frontend](frontend) with Bun: `bun install`, `bun run dev`, `bun run build`, `bun run lint`.
- If the API type client looks stale, regenerate it with `bun run openapi-ts` from [frontend](frontend). Never edit backend code to make this happen — flag it to the user instead.

## Knowledge base — read this first, every session

You don't retain context between runs. [frontend/.agent-notes](frontend/.agent-notes) is your memory — a set of lookup files, one per feature/area (e.g. `time-entry-calendar.md`, `reports.md`, `routing.md`).

- **Before a task:** read the relevant note file(s) if they exist, instead of re-exploring the whole codebase.
- **After a task:** update the relevant file(s) — new gotchas, decisions made and why, patterns to follow. Create a new file if the area has none yet.
- Keep entries short and factual — a lookup index, not a diary. Prune stale info rather than appending forever.
- Create `frontend/.agent-notes/` on first use if it doesn't exist.

## Commit messages

After every commit-worthy change, end your response with a conventional commit message for it (`type(scope): summary` + body if needed). Skip this if nothing commit-worthy happened.

## Helpful references

- Frontend-specific guidance: [frontend/AGENTS.md](frontend/AGENTS.md)
- Frontend overview: [frontend/README.md](frontend/README.md)
