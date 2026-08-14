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
import { ModeToggle } from "@/components/ui/mode-toggle";
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
      <SidebarHeader>
        <Brand />
      </SidebarHeader>

      <SidebarContent>
        <AppSidebarNav />

        <ModeToggle />
      </SidebarContent>

      <SidebarFooter>
        <WorkspaceSelector />
        <SidebarAccount />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
