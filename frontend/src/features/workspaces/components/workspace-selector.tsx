import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";

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
import { $api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";

import { useWorkspaceStore } from "../store";

export function WorkspaceSelector() {
  const { activeWorkspace, setWorkspace, reset } = useWorkspaceStore();

  const [open, setOpen] = useState(false);

  const queryClient = useQueryClient();

  const { data, isLoading } = $api.useQuery("get", "/api/v1/workspaces", {
    params: {
      query: {
        size: 100,
      },
    },
  });

  const workspaces = data?.items ?? [];

  const activeWorkspaceName =
    workspaces.find((workspace) => workspace.id === activeWorkspace)?.name ??
    "All workspaces";

  const handleWorkspaceChange = (id: number | null) => {
    if (id === null) {
      reset();
    } else {
      setWorkspace(id);
    }

    setOpen(false);
    queryClient.invalidateQueries();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-56 justify-between"
          />
        }
      >
        <div>
          <span className="text-muted-foreground">Workspace:</span>
          <span className="truncate"> {activeWorkspaceName}</span>
        </div>
        <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
      </PopoverTrigger>

      <PopoverContent className="w-56 p-0" align="start">
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
