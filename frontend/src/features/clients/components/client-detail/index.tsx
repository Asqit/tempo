import {
  CalendarDays,
  CircleDollarSign,
  FolderKanban,
  Hash,
} from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { $api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/money";
import { ProjectsTable } from "@/features/projects/components/projects-table";
import { ClientHeader } from "./components/client-header";
import { useWorkspaceStore } from "@/features/workspaces/store";

type ClientDetailProps = {
  id: number;
};

function formatDate(value: string | null | undefined) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("cs-CZ", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("cs-CZ", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function ClientDetail({ id }: ClientDetailProps) {
  const { activeWorkspace } = useWorkspaceStore();

  const {
    data: client,
    isLoading,
    isError,
  } = $api.useQuery(
    "get",
    "/api/v1/clients/{id}",
    {
      params: {
        path: { id },
        header: {
          "X-Workspace-Id": activeWorkspace!,
        },
      },
    },
    {
      enabled: !!activeWorkspace,
    },
  );

  const { data: projects } = $api.useQuery(
    "get",
    "/api/v1/projects/",
    {
      params: {
        query: {
          client_id: id,
          page: 1,
          size: 100,
        },
        header: {
          "X-Workspace-Id": activeWorkspace!,
        },
      },
    },
    {
      enabled: !!activeWorkspace,
    },
  );

  if (isLoading) {
    return <ClientDetailSkeleton />;
  }

  if (isError || !client) {
    return (
      <section className="flex min-h-64 items-center justify-center">
        <div className="text-center">
          <p className="font-medium">Klienta se nepodařilo načíst.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Zkuste stránku obnovit.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-8">
      <ClientHeader client={client} />

      <div className="grid sm:grid-cols-3">
        <OverviewCard
          index={0}
          icon={FolderKanban}
          label="Projekty"
          value={projects?.total ?? "—"}
          description="Aktivní projekty klienta"
        />

        <OverviewCard
          index={1}
          icon={CircleDollarSign}
          label="Hodinová sazba"
          value={
            client.hourly_rate
              ? formatMoney(Number(client.hourly_rate), client.currency)
              : "—"
          }
          description={
            client.hourly_rate
              ? "Za odpracovanou hodinu"
              : "Sazba není nastavena"
          }
        />

        <OverviewCard
          index={2}
          icon={CalendarDays}
          label="Spolupráce od"
          value={formatDate(client.created_at)}
          description={`Aktualizováno ${formatDate(client.updated_at)}`}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="min-w-0">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading text-lg font-bold tracking-tight">
                  Projekty
                </h2>

                {projects?.total !== undefined && (
                  <span className="bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    {projects.total}
                  </span>
                )}
              </div>

              <p className="mt-1 text-sm text-muted-foreground">
                Projekty a práce spojené s tímto klientem.
              </p>
            </div>
          </div>

          <ProjectsTable clientId={id} />
        </section>

        <aside className="space-y-4">
          <div className="overflow-hidden rounded-xl border border-border/70 bg-card">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <div>
                <h3 className="font-heading text-sm font-semibold">
                  Informace
                </h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Základní údaje klienta
                </p>
              </div>
            </div>

            <div className="divide-y">
              <InfoRow
                icon={Hash}
                label="Client ID"
                value={`CL-${String(client.id).padStart(4, "0")}`}
                mono
              />

              <InfoRow
                icon={CircleDollarSign}
                label="Hodinová sazba"
                value={
                  client.hourly_rate
                    ? `${formatMoney(Number(client.hourly_rate), client.currency)}/h`
                    : "Nenastaveno"
                }
              />

              <InfoRow
                icon={CalendarDays}
                label="Vytvořeno"
                value={formatDateTime(client.created_at)}
              />

              <InfoRow
                icon={CalendarDays}
                label="Poslední změna"
                value={formatDateTime(client.updated_at)}
              />
            </div>
          </div>

          <div className="rounded-xl border border-border/70 bg-muted/50 p-5">
            <p className="text-xs font-medium text-muted-foreground">TIP</p>

            <p className="mt-2 text-sm leading-relaxed">
              Projekty můžeš použít pro oddělení jednotlivých zakázek, produktů
              nebo pracovních oblastí tohoto klienta.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}

type OverviewCardProps = {
  index: number;
  icon: React.ElementType;
  label: string;
  value: string | number;
  description: string;
};

function OverviewCard({
  index,
  icon: Icon,
  label,
  value,
  description,
}: OverviewCardProps) {
  return (
    <div
      className={cn(
        "group rounded-none border border-border/70 bg-card p-5 transition-colors",
        index === 0 && "rounded-t-xl sm:rounded-tr-none sm:rounded-l-xl",
        index === 2 && "rounded-b-xl sm:rounded-bl-none sm:rounded-r-xl",
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
          <Icon className="size-4 text-muted-foreground" />
        </div>
      </div>

      <div className="mt-5">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>

        <p className="mt-1 truncate font-heading text-2xl font-bold tracking-tight">
          {value}
        </p>

        <p className="mt-1 truncate text-xs text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}

type InfoRowProps = {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  mono?: boolean;
};

function InfoRow({ icon: Icon, label, value, mono = false }: InfoRowProps) {
  return (
    <div className="flex items-center gap-3 px-5 py-4">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Icon className="size-3.5 text-muted-foreground" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>

        <p
          className={
            mono
              ? "mt-0.5 truncate font-mono text-xs"
              : "mt-0.5 truncate text-sm font-medium"
          }
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function ClientDetailSkeleton() {
  return (
    <section className="space-y-8">
      <header className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-px" />
            <Skeleton className="h-4 w-20" />
          </div>

          <div className="flex gap-2">
            <Skeleton className="h-9 w-28" />
            <Skeleton className="h-9 w-32" />
          </div>
        </div>

        <Skeleton className="h-12 w-72" />
      </header>

      <div className="grid sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className={cn(
              "rounded-none border border-border/70 bg-card p-5",
              index === 0 && "rounded-t-xl sm:rounded-tr-none sm:rounded-l-xl",
              index === 2 && "rounded-b-xl sm:rounded-bl-none sm:rounded-r-xl",
            )}
          >
            <Skeleton className="size-9 rounded-lg" />
            <Skeleton className="mt-5 h-3 w-20" />
            <Skeleton className="mt-2 h-7 w-32" />
            <Skeleton className="mt-2 h-3 w-36" />
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <Skeleton className="h-6 w-24" />
              <Skeleton className="mt-2 h-4 w-64" />
            </div>

            <Skeleton className="h-8 w-24" />
          </div>

          <div className="overflow-hidden rounded-xl border border-border/70 bg-card">
            <div className="border-b p-5">
              <Skeleton className="h-4 w-40" />
            </div>

            <div className="space-y-3 p-5">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-10 w-full" />
              ))}
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="overflow-hidden rounded-xl border border-border/70 bg-card">
            <div className="border-b p-5">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-2 h-3 w-36" />
            </div>

            <div className="divide-y">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex gap-3 p-5">
                  <Skeleton className="size-8 rounded-lg" />
                  <div className="flex-1">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="mt-2 h-4 w-28" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Skeleton className="h-28 w-full rounded-xl" />
        </aside>
      </div>
    </section>
  );
}
