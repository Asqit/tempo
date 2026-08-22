import { SidebarTrigger } from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { UnreadNotifications } from "@/features/notifications/components/unread";

export function AppHeader() {
  return (
    <header className="flex min-h-14 items-center gap-3 bg-sidebar px-4 animate-in fade-in slide-in-from-top-1 duration-300 ease-out fill-mode-both backdrop-blur md:px-8">
      <SidebarTrigger />
      <div className="min-w-0">
        <h1 className="truncate text-base font-semibold tracking-tight">
          Tempo
        </h1>
        <p className="truncate text-xs text-muted-foreground/90">
          Sledování času a fakturace pro soustředěné týmy
        </p>
      </div>
      <div className="ml-auto flex items-center gap-1">
        <ModeToggle />
        <UnreadNotifications />
      </div>
    </header>
  );
}
