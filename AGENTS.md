# AGENTS.md

This repository contains a FastAPI backend in [backend](backend) and a Vite/React frontend in [frontend](frontend).

## Working conventions

- Prefer the existing project structure instead of introducing new abstractions.
- Keep backend code under [backend/src](backend/src) using the existing API versioning pattern: routers in [backend/src/api/v1](backend/src/api/v1), domain-specific modules in their own folders, and shared infrastructure in [backend/src/core](backend/src/core).
- Keep frontend feature code under [frontend/src/features](frontend/src/features) and shared UI under [frontend/src/components/ui](frontend/src/components/ui).
- Reuse existing UI primitives and patterns before creating new components.
- Prefer generated artifacts where available: do not hand-edit [frontend/src/routeTree.gen.ts](frontend/src/routeTree.gen.ts) or [frontend/src/lib/api.d.ts](frontend/src/lib/api.d.ts).

## Commands

- Frontend: run commands from [frontend](frontend) with Bun, for example `bun install`, `bun run dev`, `bun run build`, and `bun run lint`.
- Backend: use the existing dev script at [backend/run_dev.sh](backend/run_dev.sh) when starting the API locally.
- If API schemas change in the backend, regenerate the frontend type client with `bun run openapi-ts` from [frontend](frontend) when appropriate.

## Project-specific notes

- The frontend uses React 19, TypeScript, TanStack Router, React Query, Zustand, Zod, and shadcn/ui.
- The backend uses FastAPI and SQLAlchemy, with routers and services organized by domain.
- Keep changes minimal and consistent with the existing architecture; avoid introducing new state libraries or tooling unless clearly necessary.

## Helpful references

- Frontend-specific guidance: [frontend/AGENTS.md](frontend/AGENTS.md)
- Frontend overview: [frontend/README.md](frontend/README.md)
- Backend entrypoint: [backend/src/main.py](backend/src/main.py)
