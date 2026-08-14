import { useMemo } from "react";
import { Building2, CalendarDays } from "lucide-react";

import { ColorAvatar } from "@/components/share/color-avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProjectsTable } from "@/features/projects/components/projects-table";
import { Separator } from "@/components/ui/separator";
import { $api, getWorkspaceHeader } from "@/lib/api";
import { ClientHeader } from "./components/client-header";

type ClientDetailProps = {
  id: number;
};

type ClientDetailData = {
  name: string;
  createdAt: string | null;
  updatedAt: string | null;
};

function normalizeClientDetail(data: unknown): ClientDetailData | null {
  if (!data || typeof data !== "object") {
    return null;
  }

  const raw = data as {
    name?: unknown;
    user?: { name?: unknown } | null;
    created_at?: unknown;
    updated_at?: unknown;
  };

  if (typeof raw.name !== "string") {
    return null;
  }

  return {
    name: raw.name,
    createdAt: typeof raw.created_at === "string" ? raw.created_at : null,
    updatedAt: typeof raw.updated_at === "string" ? raw.updated_at : null,
  };
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString("cs-CZ");
}

export function ClientDetail({ id }: ClientDetailProps) {
  const workspaceHeader = getWorkspaceHeader();

  const { data, isLoading, isError } = $api.useQuery(
    "get",
    "/api/v1/clients/{id}",
    {
      params: {
        path: {
          id,
        },
        header: workspaceHeader,
      },
      enabled: !!workspaceHeader,
    },
  );

  const client = useMemo(() => normalizeClientDetail(data), [data]);

  if (!workspaceHeader) {
    return null;
  }

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Načítám klienta...</p>;
  }

  if (isError || !client) {
    return (
      <p className="text-sm text-destructive">Klienta se nepodařilo načíst.</p>
    );
  }

  const displayName = client.name;

  return (
    <section className="space-y-6">
      <ClientHeader client={data} />

      <Separator />

      <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="border-border/80">
          <CardHeader className="border-b border-border/70">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <ColorAvatar name={displayName} className="size-12" />
              <div className="space-y-1">
                <CardTitle className="text-2xl">{displayName}</CardTitle>
                <CardDescription>
                  Vše důležité o klientovi na jednom místě.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5 pt-5">
            <div className="rounded-none border border-border/70 bg-muted/20 p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex size-10 items-center justify-center rounded-none border border-border/70 bg-background">
                  <Building2 className="size-4 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Klient
                  </p>
                  <p className="mt-1 font-medium text-foreground">
                    {displayName}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Základní info a hned vedle práce, která na klienta navazuje.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-none border border-border/70 bg-card p-3">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Vytvořeno
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <CalendarDays className="size-4 text-muted-foreground" />
                  <span className="font-medium text-foreground">
                    {formatDateTime(client.createdAt)}
                  </span>
                </div>
              </div>
              <div className="rounded-none border border-border/70 bg-card p-3">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Aktualizováno
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <CalendarDays className="size-4 text-muted-foreground" />
                  <span className="font-medium text-foreground">
                    {formatDateTime(client.updatedAt)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80">
          <CardHeader>
            <CardTitle className="text-lg">Na čem se maká</CardTitle>
            <CardDescription>
              Přehled projektů, které pod tohohle klienta spadají.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProjectsTable
              clientId={id}
              hideHeader
              compact
              title="Projekty"
              description="Co je teď kolem klienta rozjeté"
            />
          </CardContent>
        </Card>
      </section>
    </section>
  );
}
