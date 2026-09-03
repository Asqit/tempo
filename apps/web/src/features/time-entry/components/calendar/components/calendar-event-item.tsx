import { generateColorFromString } from "@/lib/utils";
import { format } from "date-fns";
import type { EventProps } from "react-big-calendar";
import { EntryPopover } from "./entry-popover";
import type { CalendarEvent } from "../utils/calendar";

export function CalendarEventItem({ event }: EventProps<CalendarEvent>) {
  const entry = event.resource;
  const label =
    entry.project?.name ??
    entry.client?.name ??
    entry.description ??
    "Bez projektu";
  const timeLabel = format(new Date(entry.start_time), "HH:mm");
  const { bg, fg } = generateColorFromString(label);

  const inner = (
    <div
      className="flex h-full w-full items-center justify-between gap-1 overflow-hidden rounded-[4px] px-1.5 py-0.5 text-left"
      style={{
        background: bg,
        color: fg,
        borderLeft: `3px solid ${fg}`,
      }}
    >
      <span className="truncate text-[10px] font-medium leading-tight">
        {label}
      </span>
      <span className="shrink-0 text-[9px] opacity-80 leading-tight">
        {timeLabel}
      </span>
    </div>
  );

  return <EntryPopover entry={entry}>{inner}</EntryPopover>;
}
