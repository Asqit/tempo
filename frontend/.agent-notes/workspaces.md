# Workspaces

- `workspace-share.tsx` uses the generated `POST /api/v1/workspaces/{workspace_id}/members/` endpoint with `candidate_email` as a query parameter.
- Invite dialog uses TanStack Form + Zod validation, closes/resets after success, and reports pending/success/error states with Sonner.
- Unread notifications use `PUT /api/v1/notifications/{id}/read`; invalidate `['get', '/api/v1/notifications/']` afterward so the unread badge updates.
- Workspace UI and copy consistency work is complete; preserve the current patterns when extending workspace features.
