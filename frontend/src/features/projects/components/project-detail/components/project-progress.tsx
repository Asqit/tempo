import { Progress, ProgressLabel } from "@/components/ui/progress";

function formatDate(date: Date | null): string {
  if (!date) return "—";
  return date.toLocaleDateString("cs-CZ", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

type ProjectProgressProps = {
  value: number;
  startDate: Date | null;
  endDate: Date | null;
};

export function ProjectProgress({
  value,
  startDate,
  endDate,
}: ProjectProgressProps) {
  return (
    <div className="rounded-none border border-border/70 bg-card p-3 space-y-3">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{formatDate(startDate)}</span>
        <span className="text-muted-foreground">{formatDate(endDate)}</span>
      </div>
      <Progress value={value}>
        <ProgressLabel>Casovy progres projektu</ProgressLabel>
        <span className="ml-auto text-xs text-muted-foreground tabular-nums">
          {`${Math.round(value)}%`}
        </span>
      </Progress>
    </div>
  );
}
