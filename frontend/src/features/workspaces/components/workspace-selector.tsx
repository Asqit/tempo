import { Check, ChevronsUpDown, Building2 } from "lucide-react";
import { useState } from "react";
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
import { $api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { useWorkspaceStore } from "../store";

export function WorkspaceSelector() {
  const { activeWorkspace, setWorkspace, reset } = useWorkspaceStore();
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { data, isLoading } = $api.useQuery("get", "/api/v1/workspaces", {
    params: { query: { size: 100 } },
  });
  const workspaces = data?.items ?? [];
  const active = workspaces.find((w) => w.id === activeWorkspace);
  const activeWorkspaceName = active?.name ?? "All workspaces";

  const handleWorkspaceChange = (id: number | null) => {
    if (id === null) reset();
    else setWorkspace(id);
    setOpen(false);
    queryClient.invalidateQueries();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            role="combobox"
            aria-expanded={open}
            className="flex h-10 w-full items-center gap-2 rounded-md border border-sidebar-border/70 bg-sidebar-accent/35 px-2 text-left hover:bg-sidebar-accent data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          />
        }
      >
        <div className="flex size-6 shrink-0 items-center justify-center bg-primary/10 text-primary">
          <Building2 className="size-3.5" />
        </div>
        <div className="grid min-w-0 flex-1 text-left leading-tight">
          <span className="truncate text-[11px] uppercase tracking-wide text-muted-foreground">
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
          <CommandInput placeholder="Search workspaces..." />
          <CommandList>
            <CommandEmpty>No workspace found.</CommandEmpty>
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
                All workspaces
              </CommandItem>
              {isLoading ? (
                <CommandItem disabled>Loading workspaces...</CommandItem>
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
