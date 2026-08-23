import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ColorAvatar } from "@/components/share/color-avatar";
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
import { Link } from "@tanstack/react-router";
import { ArrowRight, Briefcase, Plus, Settings2, Users } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "@/features/auth";
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
        Nový workspace
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Vytvořit workspace</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="ws-name">Název</Label>
          <Input
            id="ws-name"
            placeholder="Můj workspace"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            autoFocus
          />
          {name.length > 0 && name.trim().length < 3 && (
            <p className="text-xs text-destructive">Minimálně 3 znaky</p>
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Zrušit
          </Button>
          <Button
            onClick={handleCreate}
            disabled={name.trim().length < 3 || isPending}
          >
            {isPending ? "Vytvářím…" : "Vytvořit"}
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
      role="button"
      tabIndex={0}
      className={cn(
        "group cursor-pointer text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        isActive && "ring-2 ring-primary",
      )}
      onClick={() => onSelect(id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(id);
        }
      }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            <Briefcase className="size-5" />
          </span>
          {isActive && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              Aktivní
            </span>
          )}
        </div>
        <CardTitle className="mt-1 text-lg">{name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-3.5 w-3.5" />
          <span>
            {clientCount} {clientCount === 1 ? "klient" : clientCount >= 2 && clientCount <= 4 ? "klienti" : "klientů"}
          </span>
        </div>
      </CardContent>
      <CardFooter>
        <p className="flex w-full items-center justify-between text-xs text-muted-foreground">
          Vytvořen {new Date(createdAt).toLocaleDateString("cs-CZ")}
          <ArrowRight className="size-4 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
        </p>
      </CardFooter>
    </Card>
  );
}

// ─── Overview ─────────────────────────────────────────────────────────────────

export function WorkspaceOverview() {
  const { activeWorkspace, setWorkspace } = useWorkspaceStore();
  const user = useAuthStore((state) => state.user);

  const handleWorkspaceSelect = (id: number) => {
    setWorkspace(id);
  };

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    $api.useInfiniteQuery(
      "get",
      "/api/v1/workspaces",
      {},
      {
        pageParamName: "page",
        getNextPageParam: (l) => (l.page >= l.pages ? undefined : l.page + 1),
        initialPageParam: 1,
      },
    );

  const workspaces = data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <section className="relative overflow-hidden rounded-2xl border border-border/70 bg-sidebar px-6 py-8 text-sidebar-foreground shadow-sm md:px-10 md:py-10">
        <div className="pointer-events-none absolute -right-16 -top-24 size-64 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative flex flex-col gap-7 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <div className="mb-4 flex items-center gap-3">
              {user && <ColorAvatar name={user.name} className="size-9 text-xs" />}
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-sidebar-foreground/60">
                Přehled workspace
              </span>
            </div>
            <h1 className="text-3xl font-black tracking-tight md:text-5xl">
              {user ? `Rádi vás vidíme, ${user.name.split(" ")[0]}.` : "Vytvořte si prostor pro dobrou práci."}
            </h1>
            <p className="mt-3 max-w-md text-sm leading-6 text-sidebar-foreground/65 md:text-base">
              Vyberte workspace a pokračujte v práci, nebo vytvořte nový pro jiný tým či projekt.
            </p>
          </div>
          <CreateWorkspaceDialog />
        </div>
      </section>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Vaše workspace</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight">Vyberte, kde chcete pracovat</h2>
        </div>
        <Link
          to="/app/settings/account"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Nastavení účtu <Settings2 className="size-4" />
        </Link>
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
          <p className="font-medium">Zatím nemáte žádný workspace</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Vytvořte svůj první workspace a začněte pracovat.
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
            {isFetchingNextPage ? "Načítám…" : "Načíst další"}
          </Button>
        </div>
      )}
    </div>
  );
}
