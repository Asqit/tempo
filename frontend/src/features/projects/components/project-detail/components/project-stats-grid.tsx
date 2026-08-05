type ProjectStatsGridProps = {
  totalHoursLabel: string;
  weeklyHoursLabel: string;
  entriesCount: number;
  averageEntryHoursLabel: string;
};

export function ProjectStatsGrid({
  totalHoursLabel,
  weeklyHoursLabel,
  entriesCount,
  averageEntryHoursLabel,
}: ProjectStatsGridProps) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
      <article className="rounded-none border border-border/70 bg-card p-3">
        <p className="text-xs text-muted-foreground">Celkem</p>
        <p className="mt-1 text-xl font-semibold">{totalHoursLabel}</p>
      </article>
      <article className="rounded-none border border-border/70 bg-card p-3">
        <p className="text-xs text-muted-foreground">Tento tyden</p>
        <p className="mt-1 text-xl font-semibold">{weeklyHoursLabel}</p>
      </article>
      <article className="rounded-none border border-border/70 bg-card p-3">
        <p className="text-xs text-muted-foreground">Pocet zaznamu</p>
        <p className="mt-1 text-xl font-semibold">{entriesCount}</p>
      </article>
      <article className="rounded-none border border-border/70 bg-card p-3">
        <p className="text-xs text-muted-foreground">Prumer / zaznam</p>
        <p className="mt-1 text-xl font-semibold">{averageEntryHoursLabel}</p>
      </article>
    </div>
  );
}
