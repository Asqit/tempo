import { Outlet, useLocation } from "@tanstack/react-router";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./components/app-sidebar";
import { AppHeader } from "./components/app-header";
import { WorkspaceOverview } from "@/features/workspaces/components/workspace-overview";
import { useWorkspaceStore } from "@/features/workspaces/store";

function WorkspaceRequiredContent() {
  const { pathname } = useLocation();
  const activeWorkspace = useWorkspaceStore((state) => state.activeWorkspace);
  const normalizedPath = pathname.replace(/\/$/, "") || "/app";
  const canBrowseWithoutWorkspace =
    normalizedPath.startsWith("/app/settings/") ||
    normalizedPath.startsWith("/app/workspaces");

  if (!activeWorkspace && !canBrowseWithoutWorkspace) {
    return <WorkspaceOverview />;
  }

  return <Outlet />;
}

export function AppLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="print-report-shell">
        <div className="flex min-h-svh flex-col bg-sidebar pl-4">
          <AppHeader />
          <main className="flex-1 rounded-tl-2xl bg-background px-4 py-5 md:px-8 md:py-7 print-report-main">
            <WorkspaceRequiredContent />
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
