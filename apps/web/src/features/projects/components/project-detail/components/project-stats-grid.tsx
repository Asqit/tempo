type ProjectStatsGridProps = {
  totalHoursLabel: string;
  weeklyHoursLabel: string;
  entriesCount: number;
  averageEntryHoursLabel: string;
};

export function ProjectStatsGrid({
  totalHoursLabel,
  weeklyHoursLabel,
  averageEntryHoursLabel,
}: ProjectStatsGridProps) {
  return (
    <div className="grid sm:grid-cols-3">
      <article className="rounded-t-xl border border-border/70 bg-card px-5 py-12 sm:rounded-tr-none sm:rounded-l-xl">
        <p className="text-xs text-muted-foreground uppercase">Celkem</p>
        <p className="mt-1 text-5xl font-black">{totalHoursLabel}</p>
      </article>

      <article className="rounded-none border border-border/70 bg-dotted px-5 py-12">
        <p className="text-xs uppercase">Tento týden</p>
        <p className="mt-1 text-5xl font-black">{weeklyHoursLabel}</p>
      </article>

      <article className="rounded-b-xl border border-border/70 bg-card px-5 py-12 sm:rounded-bl-none sm:rounded-r-xl">
        <p className="text-xs text-muted-foreground uppercase">
          Průmer / zaznam
        </p>
        <p className="mt-1 text-5xl font-black">{averageEntryHoursLabel}</p>
      </article>
    </div>
  );
}
