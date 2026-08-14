import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { $api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { Briefcase, Plus, Users } from "lucide-react";
import { useState } from "react";
import { useWorkspaceStore } from "../store";

// ─── Create Dialog ────────────────────────────────────────────────────────────

function CreateWorkspaceDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const queryClient = useQueryClient();
  const { setWorkspace } = useWorkspaceStore();

  const { mutate, isPending } = $api.useMutation(
    "post",
    "/api/v1/workspaces/",
    {
      onSuccess: (workspace) => {
        queryClient.invalidateQueries({
          queryKey: ["get", "/api/v1/workspaces"],
        });
        setWorkspace(workspace.id);
        setName("");
        setOpen(false);
      },
    },
  );

  const handleCreate = () => {
    if (name.trim().length < 3) return;
    mutate({ body: { name: name.trim() } });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus className="mr-2 h-4 w-4" />
        New workspace
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Create workspace</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="ws-name">Name</Label>
          <Input
            id="ws-name"
            placeholder="My workspace"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            autoFocus
          />
          {name.length > 0 && name.trim().length < 3 && (
            <p className="text-xs text-destructive">Minimum 3 characters</p>
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={name.trim().length < 3 || isPending}
          >
            {isPending ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Workspace Card ───────────────────────────────────────────────────────────

type WorkspaceCardProps = {
  id: number;
  name: string;
  clientCount: number;
  createdAt: string;
  isActive: boolean;
  onSelect: (id: number) => void;
};

function WorkspaceCard({
  id,
  name,
  clientCount,
  createdAt,
  isActive,
  onSelect,
}: WorkspaceCardProps) {
  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        isActive && "ring-2 ring-primary",
      )}
      onClick={() => onSelect(id)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Briefcase className="h-4 w-4 text-muted-foreground" />
          {isActive && (
            <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
              Active
            </span>
          )}
        </div>
        <CardTitle className="text-base">{name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Users className="h-3.5 w-3.5" />
          <span>
            {clientCount} {clientCount === 1 ? "client" : "clients"}
          </span>
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">
          Created {new Date(createdAt).toLocaleDateString("cs-CZ")}
        </p>
      </CardFooter>
    </Card>
  );
}

// ─── Overview ─────────────────────────────────────────────────────────────────

export function WorkspaceOverview() {
  const { activeWorkspace, setWorkspace } = useWorkspaceStore();

  const handleWorkspaceSelect = (id: number) => {
    setWorkspace(id);
  };

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    $api.useInfiniteQuery(
      "get",
      "/api/v1/workspaces",
      {},
      {
        getNextPageParam: (l) => (l.page >= l.pages ? undefined : l.page + 1),
        initialPageParam: 0,
      },
    );

  const workspaces = data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Workspaces</h1>
          <p className="text-sm text-muted-foreground">
            Select a workspace or create a new one.
          </p>
        </div>
        <CreateWorkspaceDialog />
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 w-4 rounded bg-muted" />
                <div className="h-5 w-32 rounded bg-muted" />
              </CardHeader>
              <CardContent>
                <div className="h-4 w-20 rounded bg-muted" />
              </CardContent>
              <CardFooter>
                <div className="h-3 w-24 rounded bg-muted" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : workspaces.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <Briefcase className="mb-3 h-8 w-8 text-muted-foreground" />
          <p className="font-medium">No workspaces yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your first workspace to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {workspaces.map((ws) => (
            <WorkspaceCard
              key={ws.id}
              id={ws.id}
              name={ws.name}
              clientCount={ws.clients.length}
              createdAt={ws.created_at}
              isActive={ws.id === activeWorkspace}
              onSelect={handleWorkspaceSelect}
            />
          ))}
        </div>
      )}

      {/* Load more */}
      {hasNextPage && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? "Loading..." : "Load more"}
          </Button>
        </div>
      )}
    </div>
  );
}
