import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  Check,
  ChevronsUpDown,
  LogOut,
  Settings,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar";
import { ColorAvatar } from "@/components/share/color-avatar";
import { useAuthStore } from "@/features/auth";
import { useWorkspaceStore } from "@/features/workspaces/store";
import { $api } from "@/lib/api";
import { cn } from "@/lib/utils";

export function SidebarAccount() {
  const { user, logout } = useAuthStore.getState();
  const { activeWorkspace, setWorkspace, reset } = useWorkspaceStore();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutateAsync: logoutMutation } = $api.useMutation(
    "delete",
    "/api/v1/auth/logout",
  );
  const { data, isLoading } = $api.useQuery("get", "/api/v1/workspaces", {
    params: { query: { size: 100 } },
  });

  if (!user) return null;

  const workspaces = data?.items ?? [];
  const active = workspaces.find((w) => w.id === activeWorkspace);
  const activeWorkspaceName = active?.name ?? "Všechny workspaces";

  const handleWorkspaceChange = (id: number | null) => {
    if (id === null) reset();
    else setWorkspace(id);
    setOpen(false);
    queryClient.invalidateQueries();
  };

  const handleLogout = async () => {
    try {
      await logoutMutation({ params: { cookie: { refresh_token: null } } });
      logout();
      navigate({ to: "/" });
    } catch (_) {
      toast.error("Nešlo se odhlásit");
    }
  };

  const goToWorkspaceSettings = () => {
    setOpen(false);
    navigate({ to: "/app/settings/workspace" });
  };

  const goToInvite = () => {
    setOpen(false);
    toast.info("Pozvání členů zatím není hotové 🚧");
  };

  const goToAccountSettings = () => {
    setOpen(false);
    navigate({ to: "/app/settings/account" });
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            render={
              <button
                type="button"
                className="flex h-9 rounded-md w-full items-center gap-1.5 border border-sidebar-border/70 bg-sidebar-accent/35 px-2 text-left text-sm font-medium hover:bg-sidebar-accent data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              />
            }
          >
            <span className="truncate">{activeWorkspaceName}</span>
            <ChevronsUpDown className="ml-auto size-3.5 shrink-0 opacity-50" />
          </PopoverTrigger>

          <PopoverContent className="w-72 p-0" align="start" side="top">
            {/* Aktuální workspace */}
            <div className="flex items-center gap-3 p-3">
              <ColorAvatar
                name={activeWorkspaceName}
                className="size-9 rounded-md"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">
                  {activeWorkspaceName}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 px-3 pb-3">
              <Button
                size="sm"
                variant="outline"
                onClick={goToWorkspaceSettings}
              >
                <Settings className="size-3.5" />
                Nastavení
              </Button>
              <Button size="sm" variant="outline" onClick={goToInvite}>
                <UserPlus className="size-3.5" />
                Pozvat
              </Button>
            </div>

            <div className="border-t" />

            {/* Switcher */}
            <Command>
              <CommandInput placeholder="Hledat workspace..." />
              <CommandList>
                <CommandEmpty>Žádný workspace nenalezen.</CommandEmpty>
                <CommandGroup heading="Workspaces">
                  <CommandItem
                    value="all workspaces"
                    onSelect={() => handleWorkspaceChange(null)}
                  >
                    <Check
                      className={cn(
                        "mr-2 size-4",
                        activeWorkspace === null ? "opacity-100" : "opacity-0",
                      )}
                    />
                    Všechny workspaces
                  </CommandItem>
                  {isLoading ? (
                    <CommandItem disabled>Načítám workspaces...</CommandItem>
                  ) : (
                    workspaces.map((workspace) => (
                      <CommandItem
                        key={workspace.id}
                        value={workspace.name}
                        onSelect={() => handleWorkspaceChange(workspace.id)}
                      >
                        <Check
                          className={cn(
                            "mr-2 size-4",
                            activeWorkspace === workspace.id
                              ? "opacity-100"
                              : "opacity-0",
                          )}
                        />
                        <span className="truncate">{workspace.name}</span>
                      </CommandItem>
                    ))
                  )}
                </CommandGroup>
              </CommandList>
            </Command>

            <div className="border-t" />

            {/* Účet */}
            <div className="p-1">
              <button
                type="button"
                onClick={goToAccountSettings}
                className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
              >
                <ColorAvatar name={user.name} className="size-6" />
                <div className="min-w-0 flex-1 text-left leading-tight">
                  <p className="truncate">{user.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </p>
                </div>
                <Settings className="size-3.5 opacity-60" />
              </button>
              <div className="flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-sm">
                <span className="text-muted-foreground">Vzhled</span>
                <ModeToggle />
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut className="size-3.5" />
                Odhlásit se
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
