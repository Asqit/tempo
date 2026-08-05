import { SidebarTrigger } from "@/components/ui/sidebar";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border/70 bg-background/85 px-4 backdrop-blur md:px-8">
      <SidebarTrigger />
      <div className="min-w-0">
        <h1 className="truncate text-base font-semibold tracking-tight">
          Tempo
        </h1>
        <p className="truncate text-xs text-muted-foreground/90">
          Time tracking and invoicing for focused teams
        </p>
      </div>
    </header>
  );
}
