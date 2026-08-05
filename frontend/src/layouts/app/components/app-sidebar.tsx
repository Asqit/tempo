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

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
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
