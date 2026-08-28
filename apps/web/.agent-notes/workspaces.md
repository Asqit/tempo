# Workspaces

- The app shell must stay mounted when `activeWorkspace` is null so account/workspace settings, theme, switching, and logout remain available through `SidebarAccount`.
- `WorkspaceRequiredContent` gates workspace-dependent routes at the app shell; it renders `WorkspaceOverview` without mounting their route components when no workspace is selected. Account/settings and workspace-management routes remain available.
- Workspace selection/create continues to use `useWorkspaceStore`; selecting or creating a workspace returns to the dashboard through the persisted store.
- Workspace settings now use the workspace list endpoint; per-workspace GET/PUT routes were removed. Members can invite with a role, leave via `/workspaces/members/me`, and owners can delete via `/workspaces/`.
- Notification invites can be accepted directly from the notification popover; workspace event types include invite acceptance, removal, role change, and leaving.
- Workspace settings now show the signed-in user's invitation history for the active workspace using GET `/api/v1/workspaces/invitations`; the API currently returns paginated invitation records without display-name fields.
