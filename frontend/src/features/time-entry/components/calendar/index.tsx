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
  endOfWeek,
  format,
  formatDuration,
  getHours,
  getMinutes,
  intervalToDuration,
  startOfWeek,
  subDays,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { match } from "ts-pattern";
import { generateColorFromString } from "@/lib/utils";
import { TimeEntryUpdateDialog } from "../time-entry-update-dialog";

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

  // Scroll na 7:00 při mountu
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 7 * CELL_HEIGHT;
    }
  }, []);

  useEffect(() => {
    match(range)
      .with("today", () => {
        setStartDate(new Date());
        setEndDate(new Date());
      })
      .with("yesterday", () => {
        setStartDate(subDays(new Date(), 1));
        setEndDate(subDays(new Date(), 1));
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
  }, [range]);

  const days = 1 + differenceInCalendarDays(endDate, startDate);

  const segments = useMemo(() => {
    if (!data) return [];
    return data.flatMap((entry) => {
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
  }, [data, startDate, days]);

  if (!workspaceHeader) return null;

  const handleNavigate = (dir: -1 | 1) => {
    setStartDate((d) => addDays(d, dir * days));
    setEndDate((d) => addDays(d, dir * days));
    setRange("custom");
  };

  const colStyle = { gridTemplateColumns: `3rem repeat(${days}, 1fr)` };

  return (
    <div className="flex flex-col border overflow-hidden">
      {/* Toolbar */}
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
              render={<Button variant="outline" className="min-w-sm" />}
            >
              {RANGE_LABELS[range]}
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuGroup>
                <DropdownMenuItem onSelect={() => setRange("today")}>
                  Dnes
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setRange("yesterday")}>
                  Včera
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setRange("this-week")}>
                  Tento týden
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setRange("last-week")}>
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

      {/* Day headers */}
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

      {/* Scrollable area */}
      <div
        ref={scrollRef}
        className="overflow-y-auto relative"
        style={{ maxHeight: "550px" }}
      >
        <div className="relative">
          {/* Grid */}
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

          {/* Entry overlay */}
          <div
            className="absolute inset-0 grid pointer-events-none"
            style={{
              ...colStyle,
              gridTemplateRows: `repeat(24, ${CELL_HEIGHT}px)`,
            }}
          >
            {segments.map(({ entry, day, rowStart, rowEnd }) => {
              const projectName = entry.project?.name ?? "Bez projektu";
              const userName = "Neznámý uživatel";
              const { fg, bg } = generateColorFromString(projectName);

              const duration = intervalToDuration({
                start: entry.start_time,
                end: entry.end_time ?? new Date().toISOString(),
              });

              return (
                <TimeEntryUpdateDialog
                  key={`${entry.id}-${day}`}
                  entry={{
                    id: entry.id,
                    description: entry.description,
                    project_id: entry?.project?.id,
                    start_time: entry.start_time,
                    end_time: entry.end_time,
                  }}
                  onUpdated={() => {
                    // případně invalidate/refetch calendar query
                  }}
                >
                  <div
                    className="text-xs p-1.5 m-0.5 rounded overflow-hidden pointer-events-auto cursor-pointer hover:brightness-110 transition-all"
                    style={{
                      gridColumn: day + 2,
                      gridRow: `${rowStart} / ${rowEnd}`,
                      background: bg,
                      color: fg,
                      borderLeft: `3px solid ${fg}`,
                    }}
                  >
                    <p className="font-bold truncate">{projectName}</p>
                    <p className="opacity-75 truncate">{userName}</p>
                    <time className="tabular-nums opacity-60">
                      {formatDuration(duration, {
                        format: ["hours", "minutes"],
                      })}
                    </time>
                  </div>
                </TimeEntryUpdateDialog>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
