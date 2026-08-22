# CLIXAD.md

This file provides guidance for CLIXAD agents working within this project.

## Project Overview

Tempo is a self-hosted time tracking, reporting, and invoicing application. It is built with a Vite/React frontend and a Python FastAPI backend.

## Project Structure

-   **`frontend/`**: Contains the Vite/React frontend application.
    -   **`frontend/src/features`**: Feature-specific code.
    -   **`frontend/src/components/ui`**: Shared UI components.
-   **`backend/`**: (Do not touch) Python FastAPI backend.

## Commands (Run from `frontend/` directory):

-   **Install dependencies**: `bun install`
-   **Run development server**: `bun run dev` (also regenerates API types)
-   **Build for production**: `bun run build`
-   **Lint code**: `bun run lint`

## Conventions & Gotchas:

-   **API Types**: The API type client (`frontend/src/lib/api.d.ts`) is generated. If it looks stale, regenerate it with `bun run openapi-ts`. Never edit the backend to fix API types.
-   **Generated Files**: Do not manually edit `frontend/src/routeTree.gen.ts` or `frontend/src/lib/api.d.ts`.
-   **Project Structure**: Prefer existing structures and reuse UI primitives. Keep feature code in `features/` and shared UI in `components/ui/`.
-   **Agent Notes**: Use `frontend/.agent-notes/` for feature-specific knowledge. Create new files as needed. Entries should be short and factual.
-   **Commit Messages**: Use conventional commit format (`type(scope): summary`).
