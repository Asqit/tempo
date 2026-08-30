# UI Audit

- The UI consistency, language, navigation, spacing, motion, and theme polish pass is complete.
- Czech is the active product language; do not re-open the previous mixed-language audit without new evidence.
- Shared primitives and page-header patterns are established. Reuse them for new work.
- Keep the existing rounded scale, warm-lime light theme, forest ink, and separate neon-on-charcoal dark theme.
- Shared shadcn primitives and the global token stylesheet now live in `packages/ui`; import primitives from `@tempo/ui/components/*` and styles from `@tempo/ui/globals.css`.
- Keep app-specific UI in `apps/web`, including `EntityPicker`, theme controls/provider, toaster configuration, and feature composition.
