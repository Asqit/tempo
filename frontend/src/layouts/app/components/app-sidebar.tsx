import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { SidebarAccount } from "@/features/auth/components/sidebar-account";
import { Sparkles } from "lucide-react";

import { AppSidebarNav } from "./app-sidebar-nav";

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1.5">
          <div className="flex size-8 items-center justify-center rounded-none bg-primary text-primary-foreground">
            <Sparkles className="size-4" />
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-medium">Tick</span>
            <span className="truncate text-xs text-muted-foreground">
              App workspace
            </span>
          </div>
        </div>
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
