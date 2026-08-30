import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@tempo/ui/components/sidebar";
import { SidebarAccount } from "@/features/auth/components/sidebar-account";
import { AppSidebarNav } from "./app-sidebar-nav";
import { Brand } from "@/components/share/brand";
import { SidebarTimer } from "@/features/time-entry/components/sidebar-timer";
import { TimeEntryCreateDialog } from "@/features/time-entry/components/time-entry-create-dialog";
import { Button } from "@tempo/ui/components/button";
import { PlayCircle } from "lucide-react";

export function AppSidebar() {
  return (
    <Sidebar className="print-app-sidebar border-none">
      <SidebarHeader className="pt-4 pl-4">
        <Brand />
      </SidebarHeader>

      <SidebarContent>
        <AppSidebarNav />
      </SidebarContent>

      <SidebarFooter>
        <div className="w-full">
          <TimeEntryCreateDialog
            trigger={
              <Button
                aria-label="Zaznamenat čas"
                className="h-9 w-full justify-start gap-2 rounded-lg bg-primary px-3 font-semibold text-primary-foreground shadow-sm transition-[transform,background-color,box-shadow] hover:bg-primary/90 hover:shadow-md active:translate-y-px group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
                type="button"
              >
                <PlayCircle data-icon="inline-start" />
                <span className="group-data-[collapsible=icon]:hidden">
                  Zaznamenat čas
                </span>
              </Button>
            }
          />
        </div>
        <SidebarTimer />
        <SidebarAccount />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
