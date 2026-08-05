# AGENTS.md

This workspace is the Tick frontend app. It uses Vite, React 19, TypeScript, Tailwind CSS, shadcn/ui, TanStack Router, React Query, Zustand, and Zod.

## Project conventions

- Prefer Bun for installs and scripts. Use `bun install`, `bun run dev`, `bun run lint`, and `bun run build`.
- Keep feature-specific code under `src/features/<feature>/...` and shared UI under `src/components/ui/`.
- Use the existing alias-based imports (`@/`) for shared modules instead of relative paths when they cross package boundaries.
- Keep route definitions under `src/routes/` and layouts under `src/layouts/`.
- Do not hand-edit generated router output in `src/routeTree.gen.ts`.
- Prefer the generated API client in `src/lib/api.ts` and `src/lib/api.d.ts` over ad-hoc fetch logic.
- Use Zod for form and request validation, and `sonner` for user-facing toast notifications.
- Feature-related code must stay in the appropriate feature folder.
- When a component becomes complex, split it into smaller components.
- When splitting a component into parent/child parts, create a folder using kebab-case naming for the component, with a nested `components` folder for the children.
- If anything is unclear, ask Andy first instead of doing expensive dependency or node_modules lookup.
- Keep the root components folder split into `src/components/ui` for third-party/shadcn-style primitives and `src/components/share` for project-specific shared components.

## Common workflows

- For UI work, reuse existing shadcn-style primitives from `src/components/ui/` before introducing new components.
- For auth-related work, inspect `src/features/auth/` and the Zustand store in `src/features/auth/store.ts`.
- For routing changes, add or update route files in `src/routes/` and keep the router setup consistent with the existing TanStack Router pattern.
- If API schemas change, regenerate the client types with `bun run openapi-ts` when appropriate.

## Notes

- The app setup and project overview are documented in [README.md](README.md).
- The repository-wide instructions live in [../AGENTS.md](../AGENTS.md).
- `bun run dev` starts Vite and also runs the OpenAPI type generation step, which expects the backend to expose `/openapi.json` at `http://127.0.0.1:8000`.
- Keep changes minimal and consistent with the existing architecture; avoid introducing new state libraries or tooling unless necessary.
