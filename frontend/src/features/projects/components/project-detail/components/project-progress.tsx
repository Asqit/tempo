import { Progress, ProgressLabel } from "@/components/ui/progress";

type ProjectProgressProps = {
  value: number;
};

export function ProjectProgress({ value }: ProjectProgressProps) {
  return (
    <div className="rounded-none border border-border/70 bg-card p-3">
      <Progress value={value}>
        <ProgressLabel>Casovy progres projektu</ProgressLabel>
        <span className="ml-auto text-xs text-muted-foreground tabular-nums">
          {`${Math.round(value)}%`}
        </span>
      </Progress>
    </div>
  );
}
