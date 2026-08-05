import { Outlet } from "@tanstack/react-router";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import { AppHeader } from "./components/app-header";
import { AppSidebar } from "./components/app-sidebar";

export function AppLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset>
        <div className="flex min-h-svh flex-col bg-transparent">
          <AppHeader />

          <main className="flex-1 px-4 py-5 md:px-8 md:py-7">
            <Outlet />
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
