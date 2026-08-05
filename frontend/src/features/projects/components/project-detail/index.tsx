import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  FolderKanban,
} from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { $api } from "@/lib/api";

type ProjectDetailProps = {
  id: number;
};

type ProjectDetailData = {
  id: number;
  name: string;
  clientName: string;
  clientId: number | null;
};

type TimePoint = {
  day: string;
  label: string;
  hours: number;
};

const chartConfig = {
  hours: {
    label: "Hodiny",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

function normalizeProjectDetail(data: unknown): ProjectDetailData | null {
  if (!data || typeof data !== "object") {
    return null;
  }

  const raw = data as {
    id?: unknown;
    name?: unknown;
    client?: { id?: unknown; name?: unknown } | null;
  };

  if (typeof raw.id !== "number" || typeof raw.name !== "string") {
    return null;
  }

  return {
    id: raw.id,
    name: raw.name,
    clientName:
      raw.client && typeof raw.client.name === "string"
        ? raw.client.name
        : "Bez klienta",
    clientId:
      raw.client && typeof raw.client.id === "number" ? raw.client.id : null,
  };
}

function buildTimeSeries(data: unknown): TimePoint[] {
  const source =
    data &&
    typeof data === "object" &&
    "items" in data &&
    Array.isArray((data as { items?: unknown[] }).items)
      ? (data as { items: unknown[] }).items
      : [];

  const totals = new Map<string, number>();

  for (const item of source) {
    if (!item || typeof item !== "object") {
      continue;
    }

    const raw = item as {
      start_time?: unknown;
      end_time?: unknown;
    };

    if (typeof raw.start_time !== "string") {
      continue;
    }

    const start = new Date(raw.start_time);
    const end = raw.end_time ? new Date(String(raw.end_time)) : new Date();

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      continue;
    }

    const diffHours = Math.max(0, end.getTime() - start.getTime()) / 3600000;
    const key = start.toISOString().slice(0, 10);
    totals.set(key, (totals.get(key) ?? 0) + diffHours);
  }

  return Array.from(totals.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .slice(-10)
    .map(([day, hours]) => ({
      day,
      label: new Date(day).toLocaleDateString("cs-CZ", {
        day: "numeric",
        month: "short",
      }),
      hours: Number(hours.toFixed(2)),
    }));
}

function formatHours(hours: number) {
  return `${hours.toLocaleString("cs-CZ", {
    minimumFractionDigits: hours > 0 && hours < 10 ? 1 : 0,
    maximumFractionDigits: 1,
  })} h`;
}

export function ProjectDetail({ id }: ProjectDetailProps) {
  const { data, isLoading, isError } = $api.useQuery(
    "get",
    "/api/v1/projects/{id}",
    {
      params: {
        path: {
          id,
        },
      },
    },
  );
  const { data: timeEntriesData, isLoading: isTimeLoading } = $api.useQuery(
    "get",
    "/api/v1/time-entries/",
    {
      params: {
        query: {
          project_id: id,
          page: 1,
          size: 100,
        },
      },
    } as unknown as never,
  );

  const project = useMemo(() => normalizeProjectDetail(data), [data]);
  const timeSeries = useMemo(
    () => buildTimeSeries(timeEntriesData),
    [timeEntriesData],
  );
  const totalHours = useMemo(
    () => timeSeries.reduce((sum, point) => sum + point.hours, 0),
    [timeSeries],
  );

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Načítám projekt...</p>;
  }

  if (isError || !project) {
    return (
      <p className="text-sm text-destructive">Projekt se nepodařilo načíst.</p>
    );
  }

  const hasClient = project.clientId !== null;

  return (
    <section className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="space-y-4">
        <div className="border border-border/80 bg-card p-5">
          <p className="text-[11px] font-semibold tracking-[0.24em] text-muted-foreground uppercase">
            Project route
          </p>

          <div className="mt-4 flex items-start gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center border border-border/70 bg-muted/25 text-foreground">
              <FolderKanban className="size-5" />
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-2xl font-semibold text-foreground">
                {project.name}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Rychlá orientace. Co právě řešíš, kam to patří a co z toho
                navazuje dál.
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <div className="border border-border/70 bg-muted/20 px-3 py-3">
              <p className="text-[11px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                Projekt ID
              </p>
              <p className="mt-1 font-medium text-foreground">#{project.id}</p>
            </div>

            <div className="border border-border/70 bg-muted/20 px-3 py-3">
              <p className="text-[11px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                Stav
              </p>
              <p className="mt-1 font-medium text-foreground">
                {hasClient ? "Napojený na klienta" : "Bez klienta"}
              </p>
            </div>
          </div>
        </div>

        <div className="border border-border/80 bg-card p-4">
          <p className="text-[11px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
            Kam dál
          </p>
          <div className="mt-3 grid gap-2 text-sm">
            <Link
              to="/app/projects"
              className="flex items-center justify-between border border-border/70 px-3 py-2 transition-colors hover:bg-muted/30"
            >
              <span>Seznam projektů</span>
              <ArrowUpRight className="size-4 text-muted-foreground" />
            </Link>
            {hasClient ? (
              <Link
                to="/app/clients/$id"
                params={{ id: String(project.clientId) }}
                className="flex items-center justify-between border border-border/70 px-3 py-2 transition-colors hover:bg-muted/30"
              >
                <span>Otevřít klienta</span>
                <ArrowUpRight className="size-4 text-muted-foreground" />
              </Link>
            ) : null}
          </div>
        </div>
      </aside>

      <div className="border border-border/80 bg-card p-5">
        <div className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.24em] text-muted-foreground uppercase">
          <span>Map</span>
          <span className="h-px flex-1 bg-border/80" />
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-stretch">
          <div className="border border-border/70 bg-muted/20 p-5">
            <div className="flex items-center gap-3">
              <FolderKanban className="size-4 text-muted-foreground" />
              <p className="text-[11px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                Projekt
              </p>
            </div>
            <h3 className="mt-4 text-2xl font-semibold text-foreground">
              {project.name}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Aktivní kus práce, který v aplikaci žije pod klientem.
            </p>
          </div>

          <div className="hidden items-center justify-center lg:flex">
            <ArrowRight className="size-5 text-muted-foreground" />
          </div>

          <div className="border border-border/70 bg-background p-5">
            <div className="flex items-center gap-3">
              <Building2 className="size-4 text-muted-foreground" />
              <p className="text-[11px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                Klient
              </p>
            </div>
            <h3 className="mt-4 text-2xl font-semibold text-foreground">
              {project.clientName}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {hasClient
                ? "Tady je hlavní kontext projektu. Scope, návaznosti i další práce se v praxi točí kolem klienta."
                : "Projekt zatím nemá klienta, takže mu chybí hlavní kontext i jasná návaznost v appce."}
            </p>
          </div>
        </div>

        <div className="mt-4 border border-border/70 px-4 py-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                Čas na projektu
              </p>
              <p className="mt-2 text-3xl font-semibold text-foreground">
                {formatHours(totalHours)}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Součet z načtených výkazů pro tenhle projekt.
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              {timeSeries.length > 0
                ? `Posledních ${timeSeries.length} dnů s aktivitou`
                : "Zatím bez záznamů"}
            </p>
          </div>

          <div className="mt-4">
            {isTimeLoading ? (
              <div className="flex h-56 items-center justify-center border border-border/70 bg-muted/10 text-sm text-muted-foreground">
                Načítám odpracovaný čas...
              </div>
            ) : timeSeries.length > 0 ? (
              <ChartContainer
                config={chartConfig}
                className="h-56 w-full"
                initialDimension={{ width: 720, height: 224 }}
              >
                <AreaChart
                  data={timeSeries}
                  margin={{ left: 8, right: 8, top: 8 }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        formatter={(value) => formatHours(Number(value))}
                      />
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="hours"
                    stroke="var(--color-hours)"
                    fill="var(--color-hours)"
                    fillOpacity={0.18}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ChartContainer>
            ) : (
              <div className="flex h-56 items-center justify-center border border-dashed border-border/70 bg-muted/10 text-sm text-muted-foreground">
                Pro tenhle projekt zatím není vykázaný žádný čas.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
