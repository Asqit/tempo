import { CalendarDays, ClipboardList, Wallet } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { calculateAmount, formatMoney } from "@/lib/money";
import { formatDuration } from "@/lib/time";
import {
  formatDay,
  getReportRate,
  getReportTotalMinutes,
  groupSnapshotsByDay,
  type ReportDetails,
  type Snapshot,
} from "./saved-report-utils";

interface Props {
  data: Snapshot[];
  report: ReportDetails;
}

export function SavedReportTimesheet({ data, report }: Props) {
  const totalMinutes = getReportTotalMinutes(data);
  const hourlyRate = getReportRate(report);
  const totalAmount = calculateAmount(totalMinutes, hourlyRate);
  const days = groupSnapshotsByDay(data);

  return (
    <div className="flex flex-col gap-5">
      <Card className="border-border/80 shadow-none">
        <CardHeader className="border-b border-border/70">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <ClipboardList className="size-4 text-primary" />
                Timesheet pro klienta
              </CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Denní přehled práce připravený ke kontrole nebo odeslání.
              </p>
            </div>
            <Badge variant="secondary">
              <CalendarDays data-icon="inline-start" />
              {days.length} {days.length === 1 ? "den" : "dnů"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 pt-5 sm:grid-cols-3">
          <div>
            <p className="text-xs text-muted-foreground">Celkem času</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">
              {formatDuration(totalMinutes, "spaced")}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Záznamů</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{data.length}</p>
          </div>
          <div>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Wallet className="size-3" />
              K fakturaci
            </p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">
              {totalAmount === null || !report.client_snapshot
                ? "—"
                : formatMoney(totalAmount, report.client_snapshot.currency)}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/80 shadow-none">
        <CardContent className="px-0">
          {days.length === 0 ? (
            <p className="px-5 py-12 text-center text-sm text-muted-foreground">
              Pro toto období nejsou zaznamenané žádné hodiny.
            </p>
          ) : (
            days.map(([day, entries], dayIndex) => {
              const dayMinutes = entries.reduce(
                (total, entry) => total + entry.duration_minutes,
                0,
              );
              const dayAmount = calculateAmount(dayMinutes, hourlyRate);

              return (
                <section key={day}>
                  {dayIndex > 0 && <Separator />}
                  <div className="flex flex-wrap items-baseline justify-between gap-2 bg-muted/30 px-5 py-3">
                    <h3 className="text-sm font-semibold capitalize">{formatDay(day)}</h3>
                    <div className="flex items-center gap-3 text-sm tabular-nums">
                      <span className="font-medium">{formatDuration(dayMinutes, "spaced")}</span>
                      {dayAmount !== null && report.client_snapshot && (
                        <span className="text-muted-foreground">
                          {formatMoney(dayAmount, report.client_snapshot.currency)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="divide-y divide-border/70">
                    {entries.map((entry) => (
                      <div
                        key={entry.id}
                        className="grid gap-2 px-5 py-3 text-sm sm:grid-cols-[minmax(0,1fr)_10rem_6rem] sm:items-center"
                      >
                        <div className="min-w-0">
                          <p className="truncate">
                            {entry.description || (
                              <span className="italic text-muted-foreground">
                                Bez popisu
                              </span>
                            )}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {entry.project_name ?? "Bez projektu"}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {entry.client_name ?? "—"}
                        </p>
                        <p className="text-left font-medium tabular-nums sm:text-right">
                          {formatDuration(entry.duration_minutes, "spaced")}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
