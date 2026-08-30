import { Check, ChevronsUpDown, Building2 } from "lucide-react";
import { useState } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@tempo/ui/components/command";
import { Button } from "@tempo/ui/components/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@tempo/ui/components/popover";
import { $api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { useWorkspaceStore } from "../store";
import { useAuthStore } from "@/features/auth";

export function WorkspaceSelector() {
  const { user } = useAuthStore();
  const { activeWorkspace, setWorkspace, setRole, reset } = useWorkspaceStore();
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { data, isLoading } = $api.useQuery("get", "/api/v1/workspaces", {
    params: { query: { size: 100 } },
  });
  const workspaces = data?.items ?? [];
  const active = workspaces.find((w) => w.id === activeWorkspace);
  const activeWorkspaceName = active?.name ?? "Všechny workspace";

  const handleWorkspaceChange = (id: number | null) => {
    if (id === null) {
      reset();
      setOpen(false);
      return;
    }

    const workspace = workspaces.find((w) => w.id === id);
    const member = workspace?.members.find(
      (member) => member.user_id === user?.id,
    );

    if (!workspace || !member) {
      return;
    }

    setWorkspace(workspace.id);
    setRole(member.role);

    setOpen(false);
    queryClient.invalidateQueries();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            role="combobox"
            aria-expanded={open}
            variant="ghost"
            className="h-10 w-full justify-start gap-2 rounded-lg border border-sidebar-border/70 bg-sidebar-accent/35 px-2 text-left hover:bg-sidebar-accent data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          />
        }
      >
        <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Building2 className="size-3.5" />
        </div>
        <div className="grid min-w-0 flex-1 text-left leading-tight">
          <span className="truncate text-[11px] tracking-wide text-muted-foreground">
            Workspace
          </span>
          <span className="truncate text-sm font-medium">
            {activeWorkspaceName}
          </span>
        </div>
        <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
      </PopoverTrigger>

      <PopoverContent className="w-64 p-0" align="start">
        <Command>
          <CommandInput placeholder="Hledat workspace..." />
          <CommandList>
            <CommandEmpty>Žádný workspace nenalezen.</CommandEmpty>
            <CommandGroup>
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
                Všechny workspace
              </CommandItem>
              {isLoading ? (
                <CommandItem disabled>Načítám workspace...</CommandItem>
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
      </PopoverContent>
    </Popover>
  );
}
