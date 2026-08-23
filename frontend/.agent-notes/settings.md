# Settings

- `features/settings/components/settings-layout.tsx` is the shared settings shell with Account/Workspace navigation.
- Settings navigation is a sticky horizontal header rather than a left-side rail, so the slices remain available while scrolling.
- Account settings currently expose read-only user data and theme preference because the OpenAPI contract has no user-update endpoint.
- Workspace settings load the active workspace, update its name through `PUT /api/v1/workspaces/{workspace_id}`, and list members from `WorkspaceRead.members`.
