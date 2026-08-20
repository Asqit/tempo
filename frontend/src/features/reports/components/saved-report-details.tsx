import type { components } from "@/lib/api.d";
import { useMemo } from "react";
import { format } from "date-fns";
import { Cell, Pie, PieChart } from "recharts";

import {
  CalendarDays,
  Clock3,
  FileText,
  FolderKanban,
  PieChart as PieChartIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { generateColorFromString } from "@/lib/utils";

type Snapshot = components["schemas"]["ReportEntrySnapshot"];
type ReportDetails = components["schemas"]["ReportRead"];

interface Props {
  data: Snapshot[];
  report: ReportDetails;
}

const UNASSIGNED_LABEL = "Bez projektu";
const UNASSIGNED_COLOR = "#94a3b8"; // slate-400, kept fixed instead of hashed

function fmtMinutes(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;

  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;

  return `${h}h ${m}m`;
}

function fmtMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("cs-CZ", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "CZK" ? 0 : 2,
  }).format(amount);
}

export function SavedReportDetails({ data, report }: Props) {
  const totalMinutes = data.reduce(
    (acc, snapshot) => acc + snapshot.duration_minutes,
    0,
  );

  const hourlyRate = report.client_snapshot?.hourly_rate
    ? Number(report.client_snapshot.hourly_rate)
    : null;
  const totalAmount = hourlyRate ? (totalMinutes / 60) * hourlyRate : null;

  const projectBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of data) {
      const key = s.project_name ?? UNASSIGNED_LABEL;
      map.set(key, (map.get(key) ?? 0) + s.duration_minutes);
    }
    return [...map.entries()]
      .map(([name, minutes]) => ({
        name,
        minutes,
        fill:
          name === UNASSIGNED_LABEL
            ? UNASSIGNED_COLOR
            : generateColorFromString(name),
      }))
      .sort((a, b) => b.minutes - a.minutes);
  }, [data]);

  const chartConfig = useMemo(
    () =>
      Object.fromEntries(
        projectBreakdown.map((p) => [p.name, { label: p.name, color: p.fill }]),
      ) satisfies ChartConfig,
    [projectBreakdown],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Badge
          variant="outline"
          className="h-7 shrink-0 rounded-none border-border px-2.5 font-mono text-[10px] uppercase tracking-wide"
        >
          <CalendarDays className="mr-1.5 size-3" />
          {format(new Date(report.period_start), "dd.MM.yyyy")} –{" "}
          {format(new Date(report.period_end), "dd.MM.yyyy")}
        </Badge>
        {report.description && (
          <p className="text-muted-foreground">{report.description}</p>
        )}
      </div>

      {/* Report context */}
      <div className="border border-border bg-card">
        <div className="grid divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {report.client_snapshot && (
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="flex size-8 shrink-0 items-center justify-center border border-border bg-muted/30">
                <FileText className="size-3.5 text-muted-foreground" />
              </div>

              <div className="min-w-0">
                <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Klient
                </p>

                <p className="truncate text-sm font-medium">
                  {report.client_snapshot.name}
                </p>
              </div>
            </div>
          )}

          {report.project_snapshot && (
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="flex size-8 shrink-0 items-center justify-center border border-border bg-muted/30">
                <FolderKanban className="size-3.5 text-muted-foreground" />
              </div>

              <div className="min-w-0">
                <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Projekt
                </p>

                <p className="truncate text-sm font-medium">
                  {report.project_snapshot.name}
                </p>
              </div>
            </div>
          )}

          {hourlyRate !== null && report.client_snapshot && (
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="flex size-8 shrink-0 items-center justify-center border border-border bg-muted/30">
                <Clock3 className="size-3.5 text-muted-foreground" />
              </div>

              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Hodinová sazba
                </p>

                <p className="font-mono text-sm font-medium tabular-nums">
                  {fmtMoney(hourlyRate, report.client_snapshot.currency)}
                  <span className="ml-1 text-xs text-muted-foreground">/h</span>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="grid border border-border sm:grid-cols-3">
        <div className="border-b border-border px-4 py-4 sm:border-b-0 sm:border-r">
          <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Celkový čas
          </p>

          <p className="mt-1 text-2xl font-bold tracking-tight tabular-nums">
            {fmtMinutes(totalMinutes)}
          </p>

          <p className="mt-0.5 text-[10px] text-muted-foreground">
            {totalMinutes.toLocaleString("cs-CZ")} minut zaznamenáno
          </p>
        </div>

        <div
          className={
            totalAmount !== null
              ? "border-b border-border px-4 py-4 sm:border-b-0 sm:border-r"
              : "px-4 py-4"
          }
        >
          <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Záznamy
          </p>

          <p className="mt-1 text-2xl font-bold tracking-tight tabular-nums">
            {data.length}
          </p>

          <p className="mt-0.5 text-[10px] text-muted-foreground">
            Počet časových záznamů
          </p>
        </div>

        {totalAmount !== null && report.client_snapshot && (
          <div className="relative overflow-hidden px-4 py-4">
            <div className="absolute inset-y-0 right-0 w-1 bg-primary" />

            <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Fakturovaná částka
            </p>

            <p className="mt-1 text-2xl font-bold tracking-tight tabular-nums">
              {fmtMoney(totalAmount, report.client_snapshot.currency)}
            </p>

            <p className="mt-0.5 text-[10px] text-muted-foreground">
              Při sazbě {fmtMoney(hourlyRate!, report.client_snapshot.currency)}
              /h
            </p>
          </div>
        )}
      </div>

      {/* Project breakdown */}
      {projectBreakdown.length > 0 && (
        <div className="border border-border">
          <div className="px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              <PieChartIcon className="mr-1 inline size-3" />
              Přehled
            </p>
            <h3 className="text-sm font-semibold">Rozdělení podle projektu</h3>
          </div>

          <Separator />

          <div className="grid gap-4 px-4 py-4 sm:grid-cols-[180px_1fr] sm:items-center">
            <ChartContainer
              config={chartConfig}
              className="mx-auto aspect-square max-h-[180px]"
            >
              <PieChart>
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      hideLabel
                      formatter={(value, name) => (
                        <span className="flex items-center gap-1.5">
                          <span className="font-medium">{name}</span>
                          <span className="text-muted-foreground">
                            {fmtMinutes(Number(value))}
                          </span>
                        </span>
                      )}
                    />
                  }
                />
                <Pie
                  data={projectBreakdown}
                  dataKey="minutes"
                  nameKey="name"
                  innerRadius={45}
                  outerRadius={75}
                  strokeWidth={2}
                >
                  {projectBreakdown.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>

            <div className="space-y-2">
              {projectBreakdown.map((p) => {
                const pct =
                  totalMinutes > 0 ? (p.minutes / totalMinutes) * 100 : 0;
                return (
                  <div key={p.name} className="flex items-center gap-3 text-sm">
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: p.fill }}
                    />
                    <span className="min-w-0 flex-1 truncate">{p.name}</span>
                    <span className="w-9 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                      {Math.round(pct)}%
                    </span>
                    <span className="w-14 shrink-0 text-right font-mono text-xs font-medium tabular-nums">
                      {fmtMinutes(p.minutes)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Entries */}
      <div className="border border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Přehled
            </p>

            <h3 className="text-sm font-semibold">Časové záznamy</h3>
          </div>

          <span className="font-mono text-[10px] text-muted-foreground">
            {data.length.toString().padStart(2, "0")} ZÁZNAMŮ
          </span>
        </div>

        <Separator />

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/20">
              <tr className="border-b border-border">
                <th className="px-4 py-2.5 text-left text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Datum
                </th>

                <th className="px-4 py-2.5 text-left text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Popis
                </th>

                <th className="px-4 py-2.5 text-left text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Projekt
                </th>

                <th className="px-4 py-2.5 text-right text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Doba trvání
                </th>
              </tr>
            </thead>

            <tbody>
              {data.map((snapshot, index) => (
                <tr
                  key={snapshot.id}
                  className="group border-b border-border last:border-0 transition-colors hover:bg-muted/20"
                >
                  <td className="whitespace-nowrap px-4 py-3 align-top">
                    <div className="font-mono text-xs tabular-nums">
                      {format(new Date(snapshot.logged_at), "dd.MM.yyyy")}
                    </div>

                    <div className="mt-0.5 font-mono text-[10px] text-muted-foreground tabular-nums">
                      {format(new Date(snapshot.logged_at), "HH:mm")}
                    </div>
                  </td>

                  <td className="px-4 py-3 align-top">
                    <div className="flex gap-3">
                      <span className="mt-0.5 w-5 shrink-0 font-mono text-[9px] text-muted-foreground">
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <span className="leading-5">
                        {snapshot.description || (
                          <span className="italic text-muted-foreground">
                            Bez popisu
                          </span>
                        )}
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-3 align-top">
                    {snapshot.project_name ? (
                      <div>
                        <div className="text-xs font-medium">
                          {snapshot.project_name}
                        </div>

                        {snapshot.client_name && (
                          <div className="mt-0.5 text-[10px] text-muted-foreground">
                            {snapshot.client_name}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>

                  <td className="whitespace-nowrap px-4 py-3 text-right align-top">
                    <span className="font-mono text-xs font-semibold tabular-nums">
                      {fmtMinutes(snapshot.duration_minutes)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
