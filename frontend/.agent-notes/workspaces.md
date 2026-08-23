# Workspaces

- The app shell must stay mounted when `activeWorkspace` is null so account/workspace settings, theme, switching, and logout remain available through `SidebarAccount`.
- `WorkspaceRequiredContent` gates workspace-dependent routes at the app shell; it renders `WorkspaceOverview` without mounting their route components when no workspace is selected. Account/settings and workspace-management routes remain available.
- Workspace selection/create continues to use `useWorkspaceStore`; selecting or creating a workspace returns to the dashboard through the persisted store.
