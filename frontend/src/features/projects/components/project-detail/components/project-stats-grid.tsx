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
      <article className="rounded-none border py-12 px-5">
        <p className="text-xs text-muted-foreground uppercase">Celkem</p>
        <p className="mt-1 text-5xl font-black">{totalHoursLabel}</p>
      </article>

      <article className="rounded-none border bg-dotted py-12 px-5">
        <p className="text-xs uppercase">Tento týden</p>
        <p className="mt-1 text-5xl font-black">{weeklyHoursLabel}</p>
      </article>

      <article className="rounded-none border py-12 px-5">
        <p className="text-xs text-muted-foreground uppercase">
          Průmer / zaznam
        </p>
        <p className="mt-1 text-5xl font-black">{averageEntryHoursLabel}</p>
      </article>
    </div>
  );
}
