import type { components } from "@/lib/api.d";
import * as React from "react";
import { format, isToday, isYesterday, startOfDay } from "date-fns";
import { cs } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@tempo/ui/components/table";
import { Badge } from "@tempo/ui/components/badge";
import { generateColorFromString } from "@/lib/utils";
import { Card, CardContent } from "@tempo/ui/components/card";
import { Inbox } from "lucide-react";
import { durationMinutesBetween, formatDuration } from "@/lib/time";

interface Props {
  entries: Array<components["schemas"]["TimeEntryRead"]>;
}

/** Ticks every `intervalMs` while `active` is true — used to keep running entries live. */
function useNow(active: boolean, intervalMs = 30_000) {
  const [now, setNow] = React.useState(() => Date.now());
  React.useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [active, intervalMs]);
  return now;
}

function formatDayLabel(day: Date): string {
  if (isToday(day)) return "Dnes";
  if (isYesterday(day)) return "Včera";
  return format(day, "EEEE, d. MMMM yyyy", { locale: cs });
}

function groupByDay(entries: components["schemas"]["TimeEntryRead"][]) {
  const groups = new Map<string, components["schemas"]["TimeEntryRead"][]>();
  for (const entry of entries) {
    const key = format(startOfDay(new Date(entry.start_time)), "yyyy-MM-dd");
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(entry);
  }
  return [...groups.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1)); // newest first
}

export function ReportTable({ entries }: Props) {
  const hasRunning = entries.some((e) => !e.end_time);
  const now = useNow(hasRunning);

  const grouped = React.useMemo(() => groupByDay(entries), [entries]);

  const grandTotal = React.useMemo(
    () =>
      entries.reduce(
        (sum, e) => sum + durationMinutesBetween(e.start_time, e.end_time, now),
        0,
      ),
    [entries, now],
  );

  if (entries.length === 0) {
    return (
      <Card className="border">
        <CardContent className="flex flex-col items-center justify-center gap-2 py-16 text-center">
          <Inbox className="h-8 w-8 text-muted-foreground" strokeWidth={1.5} />
          <p className="font-medium">Žádné záznamy</p>
          <p className="text-sm text-muted-foreground">
            Pro zvolené období nemáte žádné odpracované záznamy.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border">
      <CardContent className="px-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Popis</TableHead>
              <TableHead>Projekt</TableHead>
              <TableHead>Klient</TableHead>
              <TableHead className="text-center">Zpoplatnění</TableHead>
              <TableHead className="text-right">Doba trvání</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {grouped.map(([day, dayEntries]) => {
              const dayTotal = dayEntries.reduce(
                (sum, e) =>
                  sum + durationMinutesBetween(e.start_time, e.end_time, now),
                0,
              );
              const dayHasRunning = dayEntries.some((e) => !e.end_time);

              return (
                <React.Fragment key={day}>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableCell colSpan={4} className="font-medium capitalize">
                      {formatDayLabel(new Date(day))}
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {formatDuration(dayTotal, "short")}
                      {dayHasRunning && (
                        <span
                          className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-orange-500 align-middle"
                          aria-hidden="true"
                        />
                      )}
                    </TableCell>
                  </TableRow>

                  {dayEntries.map((entry) => {
                    const minutes = durationMinutesBetween(
                      entry.start_time,
                      entry.end_time,
                      now,
                    );
                    const isRunning = !entry.end_time;

                    return (
                      <TableRow key={entry.id}>
                        <TableCell
                          className={
                            entry.description
                              ? undefined
                              : "text-muted-foreground italic"
                          }
                        >
                          {entry.description || "Bez popisu"}
                        </TableCell>
                        <TableCell>
                          {entry.project ? (
                            <span className="inline-flex items-center gap-2">
                              <span
                                className="h-2 w-2 shrink-0 rounded-full ring-2 ring-offset-1 ring-offset-background"
                                style={{
                                  backgroundColor: generateColorFromString(
                                    entry.project.name,
                                  ).bg,
                                  "--tw-ring-color": generateColorFromString(
                                    entry.project.name,
                                  ),
                                  opacity: 1,
                                } as React.CSSProperties}
                              />
                              {entry.project.name}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {entry.client?.name ?? (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={entry.billable ? "default" : "secondary"}
                          >
                            {entry.billable ? "Ano" : "Ne"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {isRunning ? (
                            <span className="inline-flex items-center gap-1.5 font-medium text-orange-500">
                              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-orange-500" />
                              {formatDuration(minutes, "short")}
                            </span>
                          ) : (
                            formatDuration(minutes, "short")
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between border-t px-4 py-3">
          <span className="text-sm text-muted-foreground">
            {entries.length} {entries.length === 1 ? "záznam" : "záznamů"}
          </span>
          <span className="font-medium tabular-nums">
            Celkově: {formatDuration(grandTotal, "short")}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
