import type { components } from "@/lib/api.d";
import { useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
import { cs } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@tempo/ui/components/table";
import { Card, CardContent } from "@tempo/ui/components/card";
import { Inbox } from "lucide-react";
import { formatDuration } from "@/lib/time";

interface Props {
  reports: Array<components["schemas"]["ReportRead"]>;
}

export function ReportsList({ reports }: Props) {
  const navigate = useNavigate();

  if (!reports.length) {
    return (
      <Card className="border">
        <CardContent className="flex flex-col items-center justify-center gap-2 py-16 text-center">
          <Inbox className="h-8 w-8 text-muted-foreground" strokeWidth={1.5} />
          <p className="font-medium">Žádné reporty</p>
          <p className="text-sm text-muted-foreground">
            Zatím jste neuložili žádný report.
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
              <TableHead>Název</TableHead>
              <TableHead>Klient</TableHead>
              <TableHead>Projekt</TableHead>
              <TableHead>Období</TableHead>
              <TableHead className="text-center">Záznamy</TableHead>
              <TableHead className="text-right">Doba trvání</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.map((report) => {
              const totalMins = report.snapshots.reduce(
                (acc, s) => acc + s.duration_minutes,
                0,
              );

              return (
                <TableRow
                  key={report.id}
                  tabIndex={0}
                  role="link"
                  onClick={() =>
                    navigate({
                      to: "/app/reports/saved/$id",
                      params: { id: String(report.id) },
                    })
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      navigate({
                        to: "/app/reports/saved/$id",
                        params: { id: String(report.id) },
                      });
                    }
                  }}
                  className="cursor-pointer focus-visible:bg-accent focus-visible:outline-none"
                >
                  <TableCell className="max-w-xs">
                    <div className="font-medium truncate">{report.name}</div>
                    {report.description && (
                      <div className="text-sm text-muted-foreground truncate">
                        {report.description}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {report.client_snapshot.length > 0 ? (
                      <span className="inline-flex items-center gap-1.5">
                        {report.client_snapshot.map((client) => client.name).join(", ")}
                        {report.client_snapshot.length === 1 &&
                          report.client_snapshot[0].hourly_rate && (
                          <span className="text-xs text-muted-foreground">
                            ({report.client_snapshot[0].hourly_rate}{" "}
                            {report.client_snapshot[0].currency}/h)
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {report.project_snapshot.length > 0 ? (
                      report.project_snapshot.map((project) => project.name).join(", ")
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                      <time>
                        {format(new Date(report.period_start), "d. M. yyyy", {
                          locale: cs,
                        })}
                      </time>
                      <span>→</span>
                      <time>
                        {format(new Date(report.period_end), "d. M. yyyy", {
                          locale: cs,
                        })}
                      </time>
                    </span>
                  </TableCell>
                  <TableCell className="text-center tabular-nums text-muted-foreground">
                    {report.snapshots.length}
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {formatDuration(totalMins, "short")}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
