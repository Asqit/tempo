import { Outlet } from "@tanstack/react-router";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./components/app-sidebar";
import { useWorkspaceStore } from "@/features/workspaces/store";
import { WorkspaceOverview } from "@/features/workspaces/components/workspace-overview";
import { ModeToggle } from "@/components/ui/mode-toggle";

export function AppLayout() {
  const { activeWorkspace } = useWorkspaceStore();

  if (!activeWorkspace) {
    return <WorkspaceOverview />;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex min-h-svh flex-col pt-6 bg-sidebar">
          <ModeToggle />
          <main className="flex-1 px-4 py-5 md:px-8 md:py-7 rounded-tl-lg bg-background">
            <Outlet />
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
