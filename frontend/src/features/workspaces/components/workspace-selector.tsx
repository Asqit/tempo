import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { $api } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useWorkspaceStore } from "../store";

export function WorkspaceSelector() {
  const { activeWorkspace, setWorkspace, reset } = useWorkspaceStore();
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const { data, isLoading } = $api.useInfiniteQuery(
    "get",
    "/api/v1/workspaces",
    {},
    {
      getNextPageParam: (l) => (l.page >= l.pages ? undefined : l.page + 1),
      initialPageParam: 0,
    },
  );

  const items = data?.pages
    ?.flatMap((p) => p.items)
    .filter((i) => i.name.toLowerCase().includes(search.toLowerCase()));

  const activeName = items?.find((i) => i.id === activeWorkspace)?.name;

  const handleWorkspaceChange = (id: number) => {
    setWorkspace(id);
    queryClient.invalidateQueries();
  };

  const handleWorkspaceReset = () => {
    reset();
    queryClient.invalidateQueries();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" />}>
        {activeName ?? "Select workspace"}
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {isLoading && (
            <DropdownMenuItem disabled>Loading...</DropdownMenuItem>
          )}
          {items?.map((i) => (
            <DropdownMenuItem
              key={i.id}
              onSelect={() => handleWorkspaceChange(i.id)}
            >
              {i.name}
            </DropdownMenuItem>
          ))}
          {activeWorkspace && (
            <DropdownMenuItem onSelect={handleWorkspaceReset}>
              Clear
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
