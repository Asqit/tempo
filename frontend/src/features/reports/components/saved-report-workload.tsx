import { Activity, CalendarRange, Layers3 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { generateColorFromString } from "@/lib/utils";
import { formatDuration, formatHoursFromMinutes } from "@/lib/time";
import {
  formatShortDay,
  getReportTotalMinutes,
  groupSnapshotsByDay,
  type Snapshot,
} from "./saved-report-utils";

interface Props {
  data: Snapshot[];
}

export function SavedReportWorkload({ data }: Props) {
  const totalMinutes = getReportTotalMinutes(data);
  const days = groupSnapshotsByDay(data);
  const projectMap = new Map<string, { minutes: number; entries: number }>();

  for (const entry of data) {
    const name = entry.project_name ?? "Bez projektu";
    const current = projectMap.get(name) ?? { minutes: 0, entries: 0 };
    projectMap.set(name, {
      minutes: current.minutes + entry.duration_minutes,
      entries: current.entries + 1,
    });
  }

  const projects = [...projectMap.entries()]
    .map(([name, values]) => ({
      name,
      ...values,
      share: totalMinutes > 0 ? (values.minutes / totalMinutes) * 100 : 0,
      color: name === "Bez projektu" ? "var(--muted-foreground)" : generateColorFromString(name).bg,
    }))
    .sort((left, right) => right.minutes - left.minutes);

  const busiestDay = days.reduce(
    (busiest, [day, entries]) => {
      const minutes = entries.reduce((total, entry) => total + entry.duration_minutes, 0);
      return minutes > busiest.minutes ? { day, minutes } : busiest;
    },
    { day: "", minutes: 0 },
  );
  const averageDayMinutes = days.length > 0 ? totalMinutes / days.length : 0;

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <MetricCard
          icon={Activity}
          label="Celkové vytížení"
          value={formatHoursFromMinutes(totalMinutes)}
          detail={`${data.length} záznamů`}
        />
        <MetricCard
          icon={CalendarRange}
          label="Aktivní dny"
          value={String(days.length)}
          detail={
            busiestDay.day
              ? `Nejvíc ${formatShortDay(busiestDay.day)}`
              : "Bez aktivity"
          }
        />
        <MetricCard
          icon={Layers3}
          label="Průměr za aktivní den"
          value={formatDuration(Math.round(averageDayMinutes), "spaced")}
          detail={`${projects.length} ${projects.length === 1 ? "projekt" : "projektů"}`}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="border-border/80 shadow-none">
          <CardHeader className="border-b border-border/70">
            <CardTitle className="text-base">Rozložení práce</CardTitle>
            <p className="text-sm text-muted-foreground">
              Podíl jednotlivých projektů na celkovém čase.
            </p>
          </CardHeader>
          <CardContent className="flex flex-col gap-5 pt-5">
            {projects.length === 0 ? (
              <p className="text-sm text-muted-foreground">Žádná data k zobrazení.</p>
            ) : (
              projects.map((project, index) => (
                <div key={project.name} className="flex flex-col gap-2">
                  <div className="flex items-center gap-3 text-sm">
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: project.color }}
                    />
                    <span className="min-w-0 flex-1 truncate font-medium">
                      {project.name}
                    </span>
                    {index === 0 && <Badge variant="secondary">Největší podíl</Badge>}
                    <span className="font-mono text-xs tabular-nums text-muted-foreground">
                      {project.share.toFixed(0)} %
                    </span>
                  </div>
                  <Progress value={project.share} aria-label={`${project.name}: ${project.share.toFixed(0)} %`} />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{project.entries} {project.entries === 1 ? "záznam" : "záznamů"}</span>
                    <span className="tabular-nums">{formatDuration(project.minutes, "spaced")}</span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-none">
          <CardHeader className="border-b border-border/70">
            <CardTitle className="text-base">Denní rytmus</CardTitle>
            <p className="text-sm text-muted-foreground">
              Kdy se práce během období skutečně odehrávala.
            </p>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 pt-5">
            {days.length === 0 ? (
              <p className="text-sm text-muted-foreground">Žádná data k zobrazení.</p>
            ) : (
              days.map(([day, entries]) => {
                const minutes = entries.reduce(
                  (total, entry) => total + entry.duration_minutes,
                  0,
                );
                const share = totalMinutes > 0 ? (minutes / totalMinutes) * 100 : 0;

                return (
                  <div key={day} className="flex items-center gap-3 text-sm">
                    <span className="w-12 shrink-0 text-xs text-muted-foreground">
                      {formatShortDay(day)}
                    </span>
                    <Progress value={share} className="flex-1" aria-label={`${formatShortDay(day)}: ${formatDuration(minutes, "spaced")}`} />
                    <span className="w-14 shrink-0 text-right font-mono text-xs tabular-nums">
                      {formatDuration(minutes, "spaced")}
                    </span>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <Card className="border-border/80 shadow-none">
      <CardContent className="flex items-start gap-3 pt-5">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{detail}</p>
        </div>
      </CardContent>
    </Card>
  );
}
