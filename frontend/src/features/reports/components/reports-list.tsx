import type { components } from "@/lib/api.d";
import { Link } from "@tanstack/react-router";
import { format } from "date-fns";

interface Props {
  reports: Array<components["schemas"]["ReportRead"]>;
}

function fmtMinutes(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function ReportsList({ reports }: Props) {
  if (!reports.length)
    return <p className="text-sm text-muted-foreground">No reports yet.</p>;

  return (
    <ul className="space-y-2">
      {reports.map((report) => {
        const totalMins = report.snapshots.reduce(
          (acc, s) => acc + s.duration_minutes,
          0,
        );

        return (
          <li key={report.id}>
            <Link
              to="/app/reports/saved/$id"
              params={{ id: report.id }}
              className="block border bg-card p-4 hover:bg-accent transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="font-medium truncate">{report.name}</h2>
                  {report.description && (
                    <p className="text-sm text-muted-foreground truncate mt-0.5">
                      {report.description}
                    </p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="font-medium tabular-nums">
                    {fmtMinutes(totalMins)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {report.snapshots.length} entries
                  </p>
                </div>
              </div>
              <div className="mt-2 flex gap-1.5 text-xs text-muted-foreground">
                <time>{format(report.period_start, "dd.MM.yyyy")}</time>
                <span>→</span>
                <time>{format(report.period_end, "dd.MM.yyyy")}</time>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
