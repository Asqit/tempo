// CSS for sticky day headers in RBC
export const calendarHeaderStyles = `
  .rbc-calendar {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .rbc-toolbar {
    flex-shrink: 0;
  }

  .rbc-time-view,
  .rbc-month-view {
    flex: 1;
    overflow-y: auto;
  }

  .rbc-header {
    position: sticky;
    top: 0;
    z-index: 9;
    background-color: hsl(var(--background));
  }

  .rbc-time-header {
    position: sticky;
    top: 0;
    z-index: 9;
  }
`;

export const calendarMessages = {
  allDay: "Celý den",
  agenda: "Agenda",
  date: "Datum",
  day: "Den",
  month: "Měsíc",
  next: "Další",
  noEventsInRange: "Žádné výkazy v tomto rozsahu.",
  previous: "Předchozí",
  time: "Čas",
  today: "Dnes",
  week: "Týden",
  work_week: "Pracovní týden",
  showMore: (total: number) => `+${total} dalších`,
};

export const calendarFormats = {
  weekdayFormat: (
    dateValue: Date,
    culture?: string,
    format?: (date: Date, fmt: string, opts?: any) => string,
  ) => format?.(dateValue, "EEE", { locale: culture }) ?? "",
  dayFormat: (
    dateValue: Date,
    culture?: string,
    format?: (date: Date, fmt: string, opts?: any) => string,
  ) => format?.(dateValue, "d", { locale: culture }) ?? "",
  monthHeaderFormat: (
    dateValue: Date,
    culture?: string,
    format?: (date: Date, fmt: string, opts?: any) => string,
  ) => format?.(dateValue, "LLLL yyyy", { locale: culture }) ?? "",
  dayHeaderFormat: (
    dateValue: Date,
    culture?: string,
    format?: (date: Date, fmt: string, opts?: any) => string,
  ) => format?.(dateValue, "EEEE d. MMM", { locale: culture }) ?? "",
  agendaDateFormat: (
    dateValue: Date,
    culture?: string,
    format?: (date: Date, fmt: string, opts?: any) => string,
  ) => format?.(dateValue, "d. MMM", { locale: culture }) ?? "",
  agendaTimeFormat: (
    dateValue: Date,
    culture?: string,
    format?: (date: Date, fmt: string, opts?: any) => string,
  ) => format?.(dateValue, "HH:mm", { locale: culture }) ?? "",
};
