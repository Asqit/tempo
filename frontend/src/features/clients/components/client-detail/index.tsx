import { CalendarDays, Clock3, FolderKanban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { $api, getWorkspaceHeader } from "@/lib/api";
import { ProjectsTable } from "@/features/projects/components/projects-table";
import { ClientHeader } from "./components/client-header";
import { cn } from "@/lib/utils";

type ClientDetailProps = {
  id: number;
};

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("cs-CZ", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("cs-CZ", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function ClientDetail({ id }: ClientDetailProps) {
  const workspaceHeader = getWorkspaceHeader();

  const {
    data: client,
    isLoading,
    isError,
  } = $api.useQuery(
    "get",
    "/api/v1/clients/{id}",
    {
      params: {
        path: {
          id,
        },
        header: workspaceHeader,
      },
    },
    {
      enabled: !!workspaceHeader,
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
        header: workspaceHeader,
      },
    },
    {
      enabled: !!workspaceHeader,
    },
  );

  if (!workspaceHeader) {
    return null;
  }

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
    <section className="space-y-6">
      {/* Header */}
      <ClientHeader client={client} />

      <Separator />

      {/* Summary */}
      <div className="grid md:grid-cols-3">
        <SummaryCard
          label="Projects"
          value={projects?.total ?? "—"}
          description="Associated projects"
          icon={FolderKanban}
        />

        <SummaryCard
          label="Created"
          value={formatDate(client.created_at)}
          description="Client created"
          icon={CalendarDays}
          className="text-primary"
        />

        <SummaryCard
          label="Last updated"
          value={formatDate(client.updated_at)}
          description={formatDateTime(client.updated_at)}
          icon={Clock3}
        />
      </div>

      {/* Main content */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b">
            <div>
              <h2 className="font-heading text-sm font-bold uppercase tracking-wide">
                Associated projects
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Projects associated with {client.name}
              </p>
            </div>

            <Button variant="ghost" size="sm">
              View all
            </Button>
          </CardHeader>

          <CardContent className="p-0">
            <ProjectsTable clientId={id} />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader className="border-b">
              <h2 className="font-heading text-xs font-bold uppercase tracking-wide">
                Client details
              </h2>
            </CardHeader>

            <CardContent className="space-y-5 pt-5">
              <DetailField
                label="Client ID"
                value={`CL-${String(client.id).padStart(4, "0")}`}
                mono
              />

              <DetailField
                label="Created"
                value={formatDateTime(client.created_at)}
              />

              <DetailField
                label="Last updated"
                value={formatDateTime(client.updated_at)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <h2 className="font-heading text-xs font-bold uppercase tracking-wide">
                Activity
              </h2>
            </CardHeader>

            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Clock3 className="size-4" />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-medium">Last updated</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {formatDateTime(client.updated_at)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

type SummaryCardProps = {
  label: string;
  value: string | number;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  className?: string;
};

function SummaryCard({
  label,
  value,
  description,
  icon: Icon,
  className,
}: SummaryCardProps) {
  return (
    <Card className="p-0!">
      <CardContent className={cn("relative p-5", className)}>
        <Icon className="absolute right-5 top-5 size-4 text-muted-foreground" />

        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground!">
          {label}
        </p>

        <p className="mt-3 truncate font-heading text-5xl font-black tracking-tight">
          {value}
        </p>

        <p className="mt-2 text-xs text-muted-foreground!">{description}</p>
      </CardContent>
    </Card>
  );
}

type DetailFieldProps = {
  label: string;
  value: string;
  mono?: boolean;
};

function DetailField({ label, value, mono = false }: DetailFieldProps) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>

      <p
        className={mono ? "mt-1 font-mono text-sm" : "mt-1 text-sm font-medium"}
      >
        {value}
      </p>
    </div>
  );
}

function ClientDetailSkeleton() {
  return (
    <section className="space-y-6">
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

      <Separator />

      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index}>
            <CardContent className="p-5">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="mt-4 h-8 w-32" />
              <Skeleton className="mt-3 h-3 w-28" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <Card>
          <CardHeader className="border-b">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="mt-2 h-3 w-52" />
          </CardHeader>

          <CardContent className="p-6">
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-10 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b">
            <Skeleton className="h-3 w-28" />
          </CardHeader>

          <CardContent className="space-y-5 pt-5">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index}>
                <Skeleton className="h-3 w-16" />
                <Skeleton className="mt-2 h-4 w-32" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
