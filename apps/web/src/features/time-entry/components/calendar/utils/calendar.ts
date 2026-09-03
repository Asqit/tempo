import type { components } from "@tempo/api-types";
import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import type { View } from "react-big-calendar";

type TimeEntry = components["schemas"]["TimeEntryRead"];

export type CalendarEvent = {
  id: number;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  resource: TimeEntry;
};

export function getViewRange(view: View, currentDate: Date) {
  switch (view) {
    case "day":
      return { start: startOfDay(currentDate), end: endOfDay(currentDate) };
    case "month":
      return {
        start: startOfMonth(currentDate),
        end: endOfMonth(currentDate),
      };
    case "week":
      return {
        start: startOfWeek(currentDate, { weekStartsOn: 1 }),
        end: endOfWeek(currentDate, { weekStartsOn: 1 }),
      };
    default:
      return {
        start: startOfMonth(currentDate),
        end: endOfMonth(currentDate),
      };
  }
}

export function toCalendarEvent(entry: TimeEntry): CalendarEvent {
  const start = new Date(entry.start_time);
  const end = entry.end_time
    ? new Date(entry.end_time)
    : new Date(start.getTime() + 60 * 60 * 1000);

  return {
    id: entry.id,
    title: entry.project?.name ?? "Bez projektu",
    start,
    end,
    allDay: false,
    resource: entry,
  };
}
