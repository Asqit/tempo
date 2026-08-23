import { Outlet } from "@tanstack/react-router";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./components/app-sidebar";
import { AppHeader } from "./components/app-header";
import { useWorkspaceStore } from "@/features/workspaces/store";
import { WorkspaceOverview } from "@/features/workspaces/components/workspace-overview";

export function AppLayout() {
  const { activeWorkspace } = useWorkspaceStore();

  if (!activeWorkspace) {
    return <WorkspaceOverview />;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="print-report-shell">
        <div className="flex min-h-svh flex-col bg-sidebar pl-4">
          <AppHeader />
          <main className="flex-1 rounded-tl-xl bg-background px-4 py-5 md:px-8 md:py-7 print-report-main">
            <Outlet />
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
