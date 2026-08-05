import { useMemo } from "react";
import { $api } from "@/lib/api";
import { EntriesTable } from "@/features/time-entry/components/entries-table";

import { ProjectHeader } from "./components/project-header";
import { ProjectProgress } from "./components/project-progress";
import { ProjectStatsGrid } from "./components/project-stats-grid";
import { ProjectWeeklyChart } from "./components/project-weekly-chart";

type ProjectDetailProps = {
  id: number;
};

type ProjectData = {
  id: number;
  name: string;
  clientName: string;
  startAt: Date | null;
  endAt: Date | null;
};

type ParsedTimeEntry = {
  id: number;
  startAt: Date;
  endAt: Date | null;
};

type WeekBarPoint = {
  key: string;
  label: string;
  hours: number;
};

function formatHours(hours: number): string {
  return `${hours.toLocaleString("cs-CZ", {
    minimumFractionDigits: hours > 0 && hours < 10 ? 1 : 0,
    maximumFractionDigits: 1,
  })} h`;
}

function toDateOrNull(value: unknown): Date | null {
  if (typeof value !== "string") {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getProjectData(data: unknown): ProjectData | null {
  if (!data || typeof data !== "object") {
    return null;
  }

  const raw = data as {
    id?: unknown;
    name?: unknown;
    start_time?: unknown;
    end_time?: unknown;
    client?: { name?: unknown } | null;
  };

  if (typeof raw.id !== "number" || typeof raw.name !== "string") {
    return null;
  }

  const clientName =
    raw.client && typeof raw.client.name === "string"
      ? raw.client.name
      : "Bez klienta";

  return {
    id: raw.id,
    name: raw.name,
    clientName,
    startAt: toDateOrNull(raw.start_time),
    endAt: toDateOrNull(raw.end_time),
  };
}

function getEntries(data: unknown): ParsedTimeEntry[] {
  if (!data || typeof data !== "object") {
    return [];
  }

  const raw = data as { items?: unknown[] };
  if (!Array.isArray(raw.items)) {
    return [];
  }

  return raw.items
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const entry = item as {
        id?: unknown;
        start_time?: unknown;
        end_time?: unknown;
      };

      if (typeof entry.id !== "number") {
        return null;
      }

      const startAt = toDateOrNull(entry.start_time);
      if (!startAt) {
        return null;
      }

      return {
        id: entry.id,
        startAt,
        endAt: toDateOrNull(entry.end_time),
      } satisfies ParsedTimeEntry;
    })
    .filter((entry): entry is ParsedTimeEntry => entry !== null);
}

function getDurationHours(entry: ParsedTimeEntry, nowMs: number): number {
  const endMs = entry.endAt ? entry.endAt.getTime() : nowMs;
  return Math.max(0, endMs - entry.startAt.getTime()) / 3_600_000;
}

function getOverlapHoursInRange(
  entry: ParsedTimeEntry,
  rangeStartMs: number,
  rangeEndMs: number,
  nowMs: number,
): number {
  const entryStartMs = entry.startAt.getTime();
  const entryEndMs = entry.endAt ? entry.endAt.getTime() : nowMs;

  const overlapStartMs = Math.max(entryStartMs, rangeStartMs);
  const overlapEndMs = Math.min(entryEndMs, rangeEndMs);

  if (overlapEndMs <= overlapStartMs) {
    return 0;
  }

  return (overlapEndMs - overlapStartMs) / 3_600_000;
}

function addHoursByDay(
  buckets: Map<string, WeekBarPoint>,
  entry: ParsedTimeEntry,
  rangeStart: Date,
  rangeEnd: Date,
  nowMs: number,
) {
  const entryStartMs = entry.startAt.getTime();
  const entryEndMs = entry.endAt ? entry.endAt.getTime() : nowMs;
  let cursor = Math.max(entryStartMs, rangeStart.getTime());
  const finalEndMs = Math.min(entryEndMs, rangeEnd.getTime());

  while (cursor < finalEndMs) {
    const current = new Date(cursor);
    const bucketKey = toLocalDateKey(current);
    const bucket = buckets.get(bucketKey);

    if (!bucket) {
      break;
    }

    const nextDay = new Date(current);
    nextDay.setHours(24, 0, 0, 0);
    const segmentEndMs = Math.min(nextDay.getTime(), finalEndMs);

    bucket.hours += (segmentEndMs - cursor) / 3_600_000;
    cursor = segmentEndMs;
  }
}

function getWeekBounds(reference = new Date()) {
  const start = new Date(reference);
  const mondayOffset = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - mondayOffset);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

function toLocalDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function ProjectDetail({ id }: ProjectDetailProps) {
  const nowMs = useMemo(() => new Date().getTime(), []);
  const weekBounds = useMemo(() => getWeekBounds(), []);

  const {
    data: project,
    isLoading: isProjectLoading,
    isError: isProjectError,
  } = $api.useQuery("get", "/api/v1/projects/{id}", {
    params: {
      path: {
        id,
      },
    },
  });

  const {
    data: allTimeEntries,
    isLoading: isAllEntriesLoading,
    isError: isAllEntriesError,
  } = $api.useQuery("get", "/api/v1/time-entries/", {
    params: {
      query: {
        project_id: id,
        page: 1,
        size: 100,
      },
    },
  });

  const {
    data: weekTimeEntries,
    isLoading: isWeekEntriesLoading,
    isError: isWeekEntriesError,
  } = $api.useQuery("get", "/api/v1/time-entries/", {
    params: {
      query: {
        project_id: id,
        start_time: weekBounds.start.toISOString(),
        end_time: weekBounds.end.toISOString(),
        page: 1,
        size: 100,
      },
    },
  });

  const projectData = useMemo(() => getProjectData(project), [project]);
  const allEntries = useMemo(
    () => getEntries(allTimeEntries),
    [allTimeEntries],
  );
  const weeklyEntries = useMemo(
    () => getEntries(weekTimeEntries),
    [weekTimeEntries],
  );

  const totalHours = useMemo(
    () =>
      allEntries.reduce(
        (sum, entry) => sum + getDurationHours(entry, nowMs),
        0,
      ),
    [allEntries, nowMs],
  );
  const weeklyHours = useMemo(
    () =>
      weeklyEntries.reduce(
        (sum, entry) =>
          sum +
          getOverlapHoursInRange(
            entry,
            weekBounds.start.getTime(),
            weekBounds.end.getTime(),
            nowMs,
          ),
        0,
      ),
    [weeklyEntries, nowMs, weekBounds.end, weekBounds.start],
  );
  const averageEntryHours = useMemo(
    () => (allEntries.length > 0 ? totalHours / allEntries.length : 0),
    [allEntries.length, totalHours],
  );

  const weekChartData = useMemo<WeekBarPoint[]>(() => {
    const dayLabels = ["Po", "Ut", "St", "Ct", "Pa", "So", "Ne"];

    const buckets = dayLabels.map((label, index) => {
      const date = new Date(weekBounds.start);
      date.setDate(weekBounds.start.getDate() + index);
      return {
        key: toLocalDateKey(date),
        label,
        hours: 0,
      } satisfies WeekBarPoint;
    });

    const byKey = new Map(buckets.map((point) => [point.key, point]));

    for (const entry of weeklyEntries) {
      addHoursByDay(byKey, entry, weekBounds.start, weekBounds.end, nowMs);
    }

    return buckets.map((bucket) => ({
      ...bucket,
      hours: Number(bucket.hours.toFixed(2)),
    }));
  }, [nowMs, weekBounds.end, weekBounds.start, weeklyEntries]);

  const progressPercent = (() => {
    if (!projectData?.startAt || !projectData.endAt) {
      return null;
    }

    const startMs = projectData.startAt.getTime();
    const endMs = projectData.endAt.getTime();
    const total = endMs - startMs;
    if (total <= 0) {
      return null;
    }

    return Math.min(100, Math.max(0, ((nowMs - startMs) / total) * 100));
  })();

  if (isProjectLoading) {
    return <p className="text-sm text-muted-foreground">Načítám projekt...</p>;
  }

  if (isProjectError || !projectData) {
    return (
      <p className="text-sm text-destructive">
        Nepodařilo se načíst detail projektu.
      </p>
    );
  }

  const hasEntriesError = isAllEntriesError || isWeekEntriesError;

  return (
    <section className="space-y-4">
      <ProjectHeader
        name={projectData.name}
        clientName={projectData.clientName}
      />

      {progressPercent !== null ? (
        <ProjectProgress value={progressPercent} />
      ) : null}

      <ProjectStatsGrid
        totalHoursLabel={formatHours(totalHours)}
        weeklyHoursLabel={formatHours(weeklyHours)}
        entriesCount={allEntries.length}
        averageEntryHoursLabel={formatHours(averageEntryHours)}
      />

      <ProjectWeeklyChart
        weekStartLabel={weekBounds.start.toLocaleDateString("cs-CZ")}
        weekEndLabel={weekBounds.end.toLocaleDateString("cs-CZ")}
        data={weekChartData}
        isLoading={isWeekEntriesLoading}
        hasError={hasEntriesError}
        formatHours={formatHours}
      />

      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Poslední výkazy projektu</h3>
        <EntriesTable
          projectId={id}
          showProjectColumn={false}
          size={20}
          showSelection
          showQuickActions
        />
      </div>

      {isAllEntriesLoading ? (
        <p className="text-xs text-muted-foreground">
          Načítám souhrn statistik...
        </p>
      ) : null}
    </section>
  );
}
