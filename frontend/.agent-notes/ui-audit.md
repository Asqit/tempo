# UI Audit

- Shared primitives establish rounded controls, semantic color tokens, `Field` form patterns, and `Card` layouts.
- Several feature screens bypass those patterns with `rounded-none`, raw `<button>`/`<input>` elements, custom pickers, and literal red/orange colors.
- Page headers drift between sentence case/semibold and uppercase/black 3xl headings; page wrappers also inconsistently use separators and entry animations.
- Workspace selection has duplicate implementations: `workspace-selector.tsx` (English) and `sidebar-account.tsx` (Czech, with account actions).
- Product copy is mixed Czech/English and often has inconsistent diacritics; choose one locale before a UI polish pass.
- Keep shared control and page-header decisions centralized; prefer `components/ui` and feature-shared wrappers over per-screen class strings.
- First consistency pass applied to workspace controls, invite placeholder, timer controls, time-entry editing, project creation, and picker triggers; workspace sharing behavior remains API-neutral.
- Picker pagination now grows the query size for “Zobrazit další”; date pickers and picker triggers accept IDs so labels do not collide or point at duplicate controls.
- App pages now share `components/share/page-header.tsx`; `AppHeader` is the active shell header and owns the sidebar trigger, theme toggle, and notifications.
- Client/project table shells, the client-create dialog, client detail panels, and project detail surfaces now follow the rounded scale: `rounded-xl` for containers, `rounded-lg` for compact panels, and `rounded-full` for status chips. Metric-card groups intentionally remain connected (no gaps), with rounding only on the group's outer corners, matching reports.
- `tw-animate-css` is imported globally. Its `duration-*`, `delay-*`, `ease-*`, and `fill-mode-*` utilities set the package's animation variables. Use a single route fade plus staggered `PageHeader`/content entrances; avoid nested slide animations. Do not gate product-requested motion behind `motion-safe` unless a user-facing motion preference exists, because it fully disables those effects for OS-level reduced-motion users.
- Light theme uses a warm-lime paper surface, forest ink, a contrast-safe garden-lime primary, green-tinted neutrals, and softer green-gray shadows. Keep dark mode tokens separate; it already has the intended neon-on-charcoal character.
