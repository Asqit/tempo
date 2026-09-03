import type { View } from "react-big-calendar";
import type { components } from "@tempo/api-types";
import { $api, getWorkspaceHeader } from "@/lib/api";
import { useMemo, useState, useEffect } from "react";
import { localizer } from "./utils/calendar-localizer";
import {
  calendarMessages,
  calendarHeaderStyles,
} from "./utils/calendar-config";
import { getViewRange, toCalendarEvent } from "./utils/calendar";
import { CalendarToolbar } from "./components/calendar-toolbar";
import { CalendarEventItem } from "./components/calendar-event-item";
import { CreateEntryDialog } from "./components/create-entry-dialog";
import ShadcnBigCalendar from "@tempo/ui/components/shadcn-big-calendar/index";

type TimeEntry = components["schemas"]["TimeEntryRead"];

export function TimeEntryCalendar() {
  const workspaceHeader = getWorkspaceHeader();
  const [view, setView] = useState<View>("week");
  const [date, setDate] = useState(new Date());
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{
    start: Date;
    end: Date;
  } | null>(null);

  useEffect(() => {
    const styleEl = document.createElement("style");
    styleEl.textContent = calendarHeaderStyles;
    document.head.appendChild(styleEl);
    return () => styleEl.remove();
  }, []);

  const range = useMemo(() => getViewRange(view, date), [view, date]);

  const { data } = $api.useQuery("get", "/api/v1/time-entries/calendar", {
    params: {
      query: {
        start_time: range.start.toISOString(),
        end_time: range.end.toISOString(),
      },
      header: workspaceHeader ?? { "X-Workspace-Id": 0 },
    },
    enabled: !!workspaceHeader,
  });

  if (!workspaceHeader) {
    return null;
  }

  const events = ((data ?? []) as TimeEntry[]).map(toCalendarEvent);

  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    setSelectedSlot(slotInfo);
    setCreateDialogOpen(true);
  };

  return (
    <>
      <div
        className="rounded-xl overflow-x-hidden border border-border bg-card shadow-sm"
        style={{ height: "600px", display: "flex", flexDirection: "column" }}
      >
        <ShadcnBigCalendar
          localizer={localizer}
          culture="cs"
          messages={calendarMessages}
          events={events}
          defaultView="week"
          view={view}
          date={date}
          onNavigate={(nextDate: Date) => setDate(nextDate)}
          onView={(nextView: View) => setView(nextView)}
          onSelectSlot={handleSelectSlot}
          views={{ day: true, week: true }}
          step={30}
          timeslots={2}
          showMultiDayTimes
          selectable
          popup
          components={{
            toolbar: CalendarToolbar,
            event: CalendarEventItem,
          }}
          eventPropGetter={() => ({
            style: {
              background: "transparent",
              border: "none",
              boxShadow: "none",
              borderRadius: "0.5rem",
            },
          })}
          formats={{
            weekdayFormat: (dateValue: Date, culture?: string) =>
              localizer.format(dateValue, "EEE", culture),
            dayFormat: (dateValue: Date, culture?: string) =>
              localizer.format(dateValue, "d", culture),
            monthHeaderFormat: (dateValue: Date, culture?: string) =>
              localizer.format(dateValue, "LLLL yyyy", culture),
            dayHeaderFormat: (dateValue: Date, culture?: string) =>
              localizer.format(dateValue, "EEEE d. MMM", culture),
            agendaDateFormat: (dateValue: Date, culture?: string) =>
              localizer.format(dateValue, "d. MMM", culture),
            agendaTimeFormat: (dateValue: Date, culture?: string) =>
              localizer.format(dateValue, "HH:mm", culture),
          }}
        />
      </div>

      <CreateEntryDialog
        open={createDialogOpen}
        onOpenChange={(open) => {
          setCreateDialogOpen(open);
          if (!open) {
            setSelectedSlot(null);
          }
        }}
        selectedSlot={selectedSlot}
      />
    </>
  );
}
