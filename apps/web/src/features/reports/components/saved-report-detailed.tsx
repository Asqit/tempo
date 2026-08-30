import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  CalendarDays,
  Clock3,
  FileText,
  ListFilter,
  Wallet,
} from "lucide-react";

import { Badge } from "@tempo/ui/components/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@tempo/ui/components/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@tempo/ui/components/chart";
import { generateColorFromString } from "@/lib/utils";
import { calculateAmount, formatMoney } from "@/lib/money";
import { formatHoursFromMinutes, formatDuration } from "@/lib/time";
import {
  formatDay,
  formatShortDay,
  getReportRate,
  getReportClientNames,
  getReportCurrency,
  getReportProjectNames,
  getReportTotalMinutes,
  groupSnapshotsByDay,
  type ReportDetails,
  type Snapshot,
} from "./saved-report-utils";

interface Props {
  data: Snapshot[];
  report: ReportDetails;
}

const UNASSIGNED_LABEL = "Bez projektu";

export function SavedReportDetailed({ data, report }: Props) {
  const totalMinutes = getReportTotalMinutes(data);
  const hourlyRate = getReportRate(report);
  const currency = getReportCurrency(report);
  const clientNames = getReportClientNames(report);
  const projectNames = getReportProjectNames(report);
  const totalAmount = calculateAmount(totalMinutes, hourlyRate);
  const days = groupSnapshotsByDay(data);

  const projectBreakdown = (() => {
    const projects = new Map<string, { minutes: number; entries: number }>();

    for (const snapshot of data) {
      const name = snapshot.project_name ?? UNASSIGNED_LABEL;
      const current = projects.get(name) ?? { minutes: 0, entries: 0 };
      projects.set(name, {
        minutes: current.minutes + snapshot.duration_minutes,
        entries: current.entries + 1,
      });
    }

    return [...projects.entries()]
      .map(([name, values]) => ({
        name,
        ...values,
        share: totalMinutes > 0 ? (values.minutes / totalMinutes) * 100 : 0,
        color:
          name === UNASSIGNED_LABEL
            ? "var(--muted-foreground)"
            : generateColorFromString(name).bg,
      }))
      .sort((left, right) => right.minutes - left.minutes);
  })();

  const dailyBreakdown = days.map(([day, entries]) => ({
    day,
    label: formatShortDay(day),
    minutes: entries.reduce(
      (total, entry) => total + entry.duration_minutes,
      0,
    ),
    entries: entries.length,
  }));

  const chartConfig = {
    minutes: {
      label: "Čas",
      color: "var(--primary)",
    },
  } satisfies ChartConfig;

  return (
    <div className="flex flex-col gap-5">
      <Card className="overflow-visible border-border/80 shadow-none">
        <CardContent className="flex flex-col gap-4 pt-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <ListFilter />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Detailní report
                </p>
                <h2 className="mt-1 truncate text-xl font-semibold tracking-tight">
                  {report.name}
                </h2>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline">
                    <CalendarDays data-icon="inline-start" />
                    {formatShortDay(report.period_start.slice(0, 10))} –{" "}
                    {formatShortDay(report.period_end.slice(0, 10))}
                  </Badge>
                  {clientNames && (
                    <Badge variant="secondary">
                      <FileText data-icon="inline-start" />
                      {clientNames}
                    </Badge>
                  )}
                  {projectNames && (
                    <Badge variant="secondary">{projectNames}</Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right text-xs text-muted-foreground">
              <p>
                {report.description || "Všechny zaznamenané hodiny v období"}
              </p>
              <p className="mt-1 tabular-nums">{data.length} záznamů</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          icon={Clock3}
          label="Zaznamenaný čas"
          value={formatHoursFromMinutes(totalMinutes)}
          detail={`${totalMinutes.toLocaleString("cs-CZ")} minut`}
        />
        <SummaryCard
          icon={CalendarDays}
          label="Aktivní dny"
          value={String(days.length)}
          detail={days.length === 1 ? "den s aktivitou" : "dnů s aktivitou"}
        />
        <SummaryCard
          icon={ListFilter}
          label="Projekty"
          value={String(projectBreakdown.length)}
          detail={projectBreakdown[0]?.name ?? "Bez záznamů"}
        />
        <SummaryCard
          icon={Wallet}
          label="Odhadovaná částka"
          value={
            totalAmount === null || !currency
              ? "—"
              : formatMoney(totalAmount, currency)
          }
          detail={
            hourlyRate === null || !currency
              ? "Bez hodinové sazby"
              : `${formatMoney(hourlyRate, currency)} / h`
          }
          emphasis
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
        <Card className="border-border/80 shadow-none">
          <CardHeader className="border-b border-border/70">
            <CardTitle className="text-base">Tempo práce</CardTitle>
            <p className="text-sm text-muted-foreground">
              Denní objem zaznamenaného času v tomto reportu.
            </p>
          </CardHeader>
          <CardContent className="pt-5">
            {dailyBreakdown.length === 0 ? (
              <EmptyReport />
            ) : (
              <ChartContainer config={chartConfig} className="h-[230px] w-full">
                <BarChart
                  data={dailyBreakdown}
                  margin={{ left: -20, right: 8 }}
                >
                  <CartesianGrid vertical={false} strokeDasharray="4 4" />
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tickMargin={8}
                    minTickGap={18}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) =>
                      formatHoursFromMinutes(Number(value))
                    }
                    width={48}
                  />
                  <ChartTooltip
                    cursor={{ fill: "var(--muted)", opacity: 0.45 }}
                    content={
                      <ChartTooltipContent
                        formatter={(value, _name, item) => (
                          <span className="flex items-center gap-2">
                            <span>{item.payload?.label}</span>
                            <span className="font-mono font-medium tabular-nums">
                              {formatDuration(Number(value), "short")}
                            </span>
                          </span>
                        )}
                      />
                    }
                  />
                  <Bar
                    dataKey="minutes"
                    fill="var(--color-minutes)"
                    radius={[5, 5, 2, 2]}
                    maxBarSize={34}
                  />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-none">
          <CardHeader className="border-b border-border/70">
            <CardTitle className="text-base">Kam šel čas</CardTitle>
            <p className="text-sm text-muted-foreground">
              Rozdělení podle projektu.
            </p>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 pt-5">
            {projectBreakdown.length === 0 ? (
              <EmptyReport />
            ) : (
              projectBreakdown.map((project) => (
                <div key={project.name} className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: project.color }}
                    />
                    <span className="min-w-0 flex-1 truncate font-medium">
                      {project.name}
                    </span>
                    <span className="font-mono text-xs tabular-nums text-muted-foreground">
                      {project.share.toFixed(0)} %
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${project.share}%`,
                        backgroundColor: project.color,
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatDuration(project.minutes, "short")} ·{" "}
                    {project.entries}{" "}
                    {project.entries === 1 ? "záznam" : "záznamů"}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/80 shadow-none">
        <CardHeader className="border-b border-border/70">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <CardTitle className="text-base">Časové záznamy</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Každý záznam v reportu, chronologicky podle data.
              </p>
            </div>
            <Badge variant="outline">{data.length} řádků</Badge>
          </div>
        </CardHeader>
        <CardContent className="px-0">
          {data.length === 0 ? (
            <EmptyReport />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-sm">
                <thead className="bg-muted/30">
                  <tr className="border-b border-border text-left">
                    <th className="px-5 py-3 text-xs font-medium text-muted-foreground">
                      Datum
                    </th>
                    <th className="px-5 py-3 text-xs font-medium text-muted-foreground">
                      Popis
                    </th>
                    <th className="px-5 py-3 text-xs font-medium text-muted-foreground">
                      Projekt
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">
                      Doba
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">
                      Částka
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[...data]
                    .sort(
                      (left, right) =>
                        new Date(left.logged_at).getTime() -
                        new Date(right.logged_at).getTime(),
                    )
                    .map((entry) => {
                      const amount = calculateAmount(
                        entry.duration_minutes,
                        hourlyRate,
                      );

                      return (
                        <tr
                          key={entry.id}
                          className="border-b border-border/70 last:border-0 hover:bg-muted/20"
                        >
                          <td className="whitespace-nowrap px-5 py-3 align-top">
                            <p className="text-xs font-medium">
                              {formatDay(entry.logged_at.slice(0, 10))}
                            </p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {new Date(entry.logged_at).toLocaleTimeString(
                                "cs-CZ",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </p>
                          </td>
                          <td className="max-w-[22rem] px-5 py-3 align-top">
                            {entry.description || (
                              <span className="italic text-muted-foreground">
                                Bez popisu
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-3 align-top">
                            <p className="text-xs font-medium">
                              {entry.project_name ?? "Bez projektu"}
                            </p>
                            {entry.client_name && (
                              <p className="mt-0.5 text-xs text-muted-foreground">
                                {entry.client_name}
                              </p>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-5 py-3 text-right align-top font-mono text-xs font-medium tabular-nums">
                            {formatDuration(entry.duration_minutes, "short")}
                          </td>
                          <td className="whitespace-nowrap px-5 py-3 text-right align-top font-mono text-xs tabular-nums">
                            {amount === null || !currency
                              ? "—"
                              : formatMoney(amount, currency)}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  detail,
  emphasis = false,
}: {
  icon: typeof Clock3;
  label: string;
  value: string;
  detail: string;
  emphasis?: boolean;
}) {
  return (
    <Card className="border-border/80 shadow-none">
      <CardContent className="flex items-start gap-3 pt-5">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <Icon />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p
            className={
              emphasis
                ? "mt-1 truncate text-xl font-semibold tabular-nums text-primary"
                : "mt-1 truncate text-xl font-semibold tabular-nums"
            }
          >
            {value}
          </p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {detail}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyReport() {
  return (
    <div className="flex min-h-32 items-center justify-center text-sm text-muted-foreground">
      V tomto reportu nejsou žádné záznamy.
    </div>
  );
}
