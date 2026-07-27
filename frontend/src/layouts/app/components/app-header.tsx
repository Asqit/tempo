import { SidebarTrigger } from "@/components/ui/sidebar";

export function AppHeader() {
  return (
    <header className="flex h-14 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur">
      <SidebarTrigger />
      <div className="min-w-0">
        <h1 className="truncate text-sm font-medium">Tick</h1>
        <p className="truncate text-xs text-muted-foreground">
          Time tracking and invoicing made easy
        </p>
      </div>
    </header>
  );
}
