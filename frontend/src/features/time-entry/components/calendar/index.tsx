import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { $api, getWorkspaceHeader } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useMemo, useEffect, useRef } from "react";
import {
  addDays,
  differenceInCalendarDays,
  endOfDay,
  endOfWeek,
  format,
  formatDuration,
  getHours,
  getMinutes,
  intervalToDuration,
  startOfDay,
  startOfWeek,
  subDays,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { match } from "ts-pattern";
import { generateColorFromString } from "@/lib/utils";
import { EntryPopover } from "./components/entry-popover";

type RangeSelector =
  "today" | "yesterday" | "this-week" | "last-week" | "custom";

const RANGE_LABELS: Record<RangeSelector, string> = {
  today: "Dnes",
  yesterday: "Včera",
  "this-week": "Tento týden",
  "last-week": "Minulý týden",
  custom: "Vlastní",
};

const CELL_HEIGHT = 48;
const TIME_COL_WIDTH = "3rem";

type RawSegment = { entry: any; day: number; rowStart: number; rowEnd: number };
type Segment = RawSegment & { col: number; totalCols: number };

function computeLayout(raw: RawSegment[]): Segment[] {
  const byDay = new Map<number, RawSegment[]>();
  for (const seg of raw) {
    if (!byDay.has(seg.day)) byDay.set(seg.day, []);
    byDay.get(seg.day)!.push(seg);
  }

  const result: Segment[] = [];

  for (const daySegs of byDay.values()) {
    const sorted = [...daySegs].sort((a, b) => a.rowStart - b.rowStart);
    const colEnds: number[] = [];

    const withCol = sorted.map((seg) => {
      let col = colEnds.findIndex((end) => end <= seg.rowStart);
      if (col === -1) {
        col = colEnds.length;
        colEnds.push(seg.rowEnd);
      } else {
        colEnds[col] = seg.rowEnd;
      }
      return { ...seg, col };
    });

    result.push(
      ...withCol.map((seg) => {
        const overlapping = withCol.filter(
          (o) => o.rowStart < seg.rowEnd && o.rowEnd > seg.rowStart,
        );
        return {
          ...seg,
          totalCols: Math.max(...overlapping.map((o) => o.col)) + 1,
        };
      }),
    );
  }

  return result;
}

export function TimeEntryCalendar() {
  const workspaceHeader = getWorkspaceHeader();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [startDate, setStartDate] = useState<Date>(() =>
    startOfWeek(new Date()),
  );
  const [endDate, setEndDate] = useState<Date>(() => endOfWeek(new Date()));
  const [range, setRange] = useState<RangeSelector>("this-week");

  const { data } = $api.useQuery("get", "/api/v1/time-entries/calendar", {
    params: {
      query: {
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
      },
      header: workspaceHeader ?? { "X-Workspace-Id": 0 },
    },
    enabled: !!workspaceHeader,
  });

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 7 * CELL_HEIGHT;
  }, []);

  const applyRange = (r: RangeSelector) => {
    setRange(r);
    match(r)
      .with("today", () => {
        setStartDate(startOfDay(new Date()));
        setEndDate(endOfDay(new Date()));
      })
      .with("yesterday", () => {
        setStartDate(startOfDay(subDays(new Date(), 1)));
        setEndDate(endOfDay(subDays(new Date(), 1)));
      })
      .with("this-week", () => {
        setStartDate(startOfWeek(new Date()));
        setEndDate(endOfWeek(new Date()));
      })
      .with("last-week", () => {
        setStartDate(startOfWeek(subDays(new Date(), 7)));
        setEndDate(endOfWeek(subDays(new Date(), 7)));
      })
      .with("custom", () => {})
      .exhaustive();
  };

  const days = 1 + differenceInCalendarDays(endDate, startDate);

  const segments = useMemo(() => {
    if (!data) return [];

    const raw = data.flatMap((entry) => {
      const entryStart = new Date(entry.start_time);
      const entryEnd = new Date(entry.end_time ?? new Date().toISOString());
      const startDay = differenceInCalendarDays(entryStart, startDate);
      const endDay = differenceInCalendarDays(entryEnd, startDate);
      const spanDays = endDay - startDay + 1;

      return Array.from({ length: spanDays }, (_, i) => {
        const day = startDay + i;
        const isFirst = i === 0;
        const isLast = i === spanDays - 1;
        const rowStart = isFirst ? getHours(entryStart) + 1 : 1;
        const rowEnd = Math.max(
          rowStart + 1,
          isLast ? getHours(entryEnd) + (getMinutes(entryEnd) > 0 ? 2 : 1) : 25,
        );
        return { entry, day, rowStart, rowEnd };
      }).filter((s) => s.day >= 0 && s.day < days);
    });

    return computeLayout(raw);
  }, [data, startDate, days]);

  if (!workspaceHeader) return null;

  const handleNavigate = (dir: -1 | 1) => {
    setStartDate((d) => addDays(d, dir * days));
    setEndDate((d) => addDays(d, dir * days));
    setRange("custom");
  };

  const colStyle = {
    gridTemplateColumns: `${TIME_COL_WIDTH} repeat(${days}, 1fr)`,
  };

  return (
    <div className="flex flex-col border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b bg-card">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleNavigate(-1)}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="outline" className="min-w-36" />}
            >
              {RANGE_LABELS[range]}
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => applyRange("today")}>
                  Dnes
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => applyRange("yesterday")}>
                  Včera
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => applyRange("this-week")}>
                  Tento týden
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => applyRange("last-week")}>
                  Minulý týden
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  Vlastní rozsah
                </DropdownMenuLabel>
                <div className="flex gap-1 px-2 pb-2">
                  <Input
                    type="date"
                    defaultValue={format(startDate, "yyyy-MM-dd")}
                    onChange={(e) => {
                      setStartDate(new Date(e.currentTarget.value));
                      setRange("custom");
                    }}
                  />
                  <Input
                    type="date"
                    defaultValue={format(endDate, "yyyy-MM-dd")}
                    onChange={(e) => {
                      setEndDate(new Date(e.currentTarget.value));
                      setRange("custom");
                    }}
                  />
                </div>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" size="icon" onClick={() => handleNavigate(1)}>
            <ChevronRight className="size-4" />
          </Button>
        </div>
        <span className="text-sm text-muted-foreground">
          {format(startDate, "d. M.")} – {format(endDate, "d. M. yyyy")}
        </span>
      </div>

      <div
        className="grid sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b"
        style={colStyle}
      >
        <div />
        {Array.from({ length: days }).map((_, d) => (
          <div key={d} className="p-3 text-sm font-medium text-center">
            {format(addDays(startDate, d), "EEE dd")}
          </div>
        ))}
      </div>

      <div
        ref={scrollRef}
        className="overflow-y-auto relative"
        style={{ maxHeight: "550px" }}
      >
        <div className="relative">
          {/* Background grid */}
          <div className="grid" style={colStyle}>
            {Array.from({ length: 24 }).map((_, hour) => (
              <>
                <div
                  key={`label-${hour}`}
                  className="text-xs text-muted-foreground flex items-start justify-end pr-2 pt-1 border-b select-none"
                  style={{ height: CELL_HEIGHT }}
                >
                  {String(hour).padStart(2, "0")}:00
                </div>
                {Array.from({ length: days }).map((_, day) => (
                  <div
                    key={`${day}-${hour}`}
                    className="border-b border-l"
                    style={{ height: CELL_HEIGHT }}
                  />
                ))}
              </>
            ))}
          </div>

          {/* Per-day overlay s overlap podporou */}
          <div
            className="absolute inset-0 flex pointer-events-none"
            style={{ paddingLeft: TIME_COL_WIDTH }}
          >
            {Array.from({ length: days }).map((_, dayIndex) => (
              <div
                key={dayIndex}
                className="relative flex-1"
                style={{ height: 24 * CELL_HEIGHT }}
              >
                {segments
                  .filter((s) => s.day === dayIndex)
                  .map(({ entry, rowStart, rowEnd, col, totalCols }) => {
                    const projectName = entry.project?.name ?? "Bez projektu";
                    const { fg, bg } = generateColorFromString(projectName);
                    const duration = intervalToDuration({
                      start: entry.start_time,
                      end: entry.end_time ?? new Date().toISOString(),
                    });

                    return (
                      <EntryPopover
                        key={`${entry.id}-${dayIndex}`}
                        entry={entry}
                      >
                        <div
                          className="absolute text-xs p-1.5 rounded overflow-hidden pointer-events-auto cursor-pointer hover:brightness-110 transition-all"
                          style={{
                            top: (rowStart - 1) * CELL_HEIGHT,
                            height: (rowEnd - rowStart) * CELL_HEIGHT,
                            left: `${(col / totalCols) * 100}%`,
                            width: `${(1 / totalCols) * 100}%`,
                            background: bg,
                            color: fg,
                            borderLeft: `3px solid ${fg}`,
                            boxSizing: "border-box",
                          }}
                        >
                          <p className="font-bold truncate">{projectName}</p>
                          <p className="opacity-75 truncate">
                            {entry.user?.name ?? "Neznámý uživatel"}
                          </p>
                          <time className="tabular-nums opacity-60">
                            {formatDuration(duration, {
                              format: ["hours", "minutes"],
                            })}
                          </time>
                        </div>
                      </EntryPopover>
                    );
                  })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
