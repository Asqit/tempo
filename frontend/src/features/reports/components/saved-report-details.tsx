import type { components } from "@/lib/api.d";
import { format } from "date-fns";
import { CalendarDays, Clock3, FileText, FolderKanban } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

type Snapshot = components["schemas"]["ReportEntrySnapshot"];
type ReportDetails = components["schemas"]["ReportRead"];

interface Props {
  data: Snapshot[];
  report: ReportDetails;
}

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
    maximumFractionDigits: 0,
  }).format(amount);
}

export function SavedReportDetails({ data, report }: Props) {
  const totalMinutes = data.reduce(
    (acc, snapshot) => acc + snapshot.duration_minutes,
    0,
  );

  const hourlyRate = Number(report.client_snapshot?.hourly_rate ?? 0);
  const totalAmount = (totalMinutes / 60) * hourlyRate;

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Badge
          variant="outline"
          className="h-7 shrink-0 rounded-none border-border px-2.5 font-mono text-[10px] uppercase tracking-wide"
        >
          <CalendarDays className="mr-1.5 size-3" />
          {format(report.period_start, "dd.MM.yyyy")} –{" "}
          {format(report.period_end, "dd.MM.yyyy")}
        </Badge>
        <p className="text-muted-foreground">{report.description}</p>
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
                  Client
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
                  Project
                </p>

                <p className="truncate text-sm font-medium">
                  {report.project_snapshot.name}
                </p>
              </div>
            </div>
          )}

          {report.client_snapshot && (
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="flex size-8 shrink-0 items-center justify-center border border-border bg-muted/30">
                <Clock3 className="size-3.5 text-muted-foreground" />
              </div>

              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Hourly rate
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
            Total time
          </p>

          <p className="mt-1 text-2xl font-bold tracking-tight tabular-nums">
            {fmtMinutes(totalMinutes)}
          </p>

          <p className="mt-0.5 text-[10px] text-muted-foreground">
            {totalMinutes.toLocaleString("cs-CZ")} minutes tracked
          </p>
        </div>

        <div className="border-b border-border px-4 py-4 sm:border-b-0 sm:border-r">
          <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Entries
          </p>

          <p className="mt-1 text-2xl font-bold tracking-tight tabular-nums">
            {data.length}
          </p>

          <p className="mt-0.5 text-[10px] text-muted-foreground">
            Time entries included
          </p>
        </div>

        {report.client_snapshot && (
          <div className="relative overflow-hidden px-4 py-4">
            <div className="absolute inset-y-0 right-0 w-1 bg-primary" />

            <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Billable value
            </p>

            <p className="mt-1 text-2xl font-bold tracking-tight tabular-nums">
              {fmtMoney(totalAmount, report.client_snapshot.currency)}
            </p>

            <p className="mt-0.5 text-[10px] text-muted-foreground">
              Based on {fmtMoney(hourlyRate, report.client_snapshot.currency)}
              /h
            </p>
          </div>
        )}
      </div>

      {/* Entries */}
      <div className="border border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Activity
            </p>

            <h3 className="text-sm font-semibold">Time entries</h3>
          </div>

          <span className="font-mono text-[10px] text-muted-foreground">
            {data.length.toString().padStart(2, "0")} RECORDS
          </span>
        </div>

        <Separator />

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/20">
              <tr className="border-b border-border">
                <th className="px-4 py-2.5 text-left text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Date
                </th>

                <th className="px-4 py-2.5 text-left text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Description
                </th>

                <th className="px-4 py-2.5 text-left text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Project
                </th>

                <th className="px-4 py-2.5 text-right text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Duration
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
                      {format(snapshot.logged_at, "dd.MM.yyyy")}
                    </div>

                    <div className="mt-0.5 font-mono text-[10px] text-muted-foreground tabular-nums">
                      {format(snapshot.logged_at, "HH:mm")}
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
                            No description
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
