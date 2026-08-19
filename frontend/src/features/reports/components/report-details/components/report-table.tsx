import type { components } from "@/lib/api.d";
import * as React from "react";
import { format, startOfDay } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { generateColorFromString } from "@/lib/utils";

interface Props {
  entries: Array<components["schemas"]["TimeEntryRead"]>;
}

function durationMinutes(
  entry: components["schemas"]["TimeEntryRead"],
): number | null {
  if (!entry.end_time) return null; // running
  const start = new Date(entry.start_time).getTime();
  const end = new Date(entry.end_time).getTime();
  return Math.round((end - start) / 60000);
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
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
  const grouped = groupByDay(entries);

  const grandTotal = entries.reduce(
    (sum, e) => sum + (durationMinutes(e) ?? 0),
    0,
  );

  return (
    <div className="border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Description</TableHead>
            <TableHead>Project</TableHead>
            <TableHead>Client</TableHead>
            <TableHead className="text-center">Billable</TableHead>
            <TableHead className="text-right">Duration</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {grouped.map(([day, dayEntries]) => {
            const dayTotal = dayEntries.reduce(
              (sum, e) => sum + (durationMinutes(e) ?? 0),
              0,
            );

            return (
              <React.Fragment key={day}>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableCell colSpan={4} className="font-medium">
                    {format(new Date(day), "EEEE, d MMM yyyy")}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatDuration(dayTotal)}
                  </TableCell>
                </TableRow>

                {dayEntries.map((entry) => {
                  const minutes = durationMinutes(entry);
                  const { fg, bg } = generateColorFromString(
                    entry?.client?.name ??
                      entry?.project?.name ??
                      entry.description,
                  );
                  return (
                    <TableRow key={entry.id}>
                      <TableCell>{entry.description || "—"}</TableCell>
                      <TableCell>
                        {entry.project ? (
                          <span className="inline-flex items-center gap-2">
                            <span
                              className="h-2 w-2 rounded-full"
                              style={{
                                backgroundColor: bg,
                              }}
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
                          {entry.billable ? "Billable" : "Non-billable"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {minutes === null ? (
                          <span className="text-orange-500">Running…</span>
                        ) : (
                          formatDuration(minutes)
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

      <div className="flex justify-end border-t px-4 py-3 font-medium">
        Total: {formatDuration(grandTotal)}
      </div>
    </div>
  );
}
