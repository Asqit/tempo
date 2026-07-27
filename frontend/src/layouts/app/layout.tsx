import { Outlet } from "@tanstack/react-router";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import { AppHeader } from "./components/app-header";
import { AppSidebar } from "./components/app-sidebar";

export function AppLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset>
        <div className="flex min-h-svh flex-col">
          <AppHeader />

          <main className="flex-1 p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
