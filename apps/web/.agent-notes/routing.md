# Routing

- `AppHeader` renders route-aware breadcrumbs using TanStack Router's `useLocation` and the shared shadcn breadcrumb primitive.
- Breadcrumb labels cover dashboard, clients, projects, reports/saved reports, invoices, workspace, and account/workspace settings routes.
- Dynamic detail routes use human-readable labels instead of exposing IDs; keep `routeTree.gen.ts` generated and untouched.
