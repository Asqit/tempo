import { dateFnsLocalizer } from "react-big-calendar";
import { format, getDay, parse, startOfWeek } from "date-fns";
import { cs } from "date-fns/locale";

export const localizer = dateFnsLocalizer({
  format,
  parse: (value: string, formatString: string, referenceDate: Date) =>
    parse(value, formatString, referenceDate, { locale: cs }),
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales: { cs },
});
