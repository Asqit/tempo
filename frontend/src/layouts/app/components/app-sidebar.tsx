import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { SidebarAccount } from "@/features/auth/components/sidebar-account";
import { AppSidebarNav } from "./app-sidebar-nav";
import { Brand } from "@/components/share/brand";
import { WorkspaceSelector } from "@/features/workspaces/components/workspace-selector";
import { useWorkspaceStore } from "@/features/workspaces/store";
import { WorkspaceOverview } from "@/features/workspaces/components/workspace-overview";

export function AppSidebar() {
  const { activeWorkspace } = useWorkspaceStore();

  // TODO: also validate that the selected workspace exists on the server!
  if (!activeWorkspace) {
    return <WorkspaceOverview />;
  }

  return (
    <Sidebar className="border-none">
      <SidebarHeader className="p-4 border-b">
        <Brand />
      </SidebarHeader>

      <SidebarContent>
        <AppSidebarNav />
      </SidebarContent>

      <SidebarFooter>
        <SidebarAccount />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
