import { Button } from "@tempo/ui/components/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ToolbarProps } from "react-big-calendar";
import type { CalendarEvent } from "../utils/calendar";

const VIEW_OPTIONS = [
  { key: "week" as const, label: "Týden" },
  { key: "day" as const, label: "Den" },
];

export function CalendarToolbar({
  label,
  onNavigate,
  onView,
  view,
  views,
}: ToolbarProps<CalendarEvent>) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border bg-card px-3 py-2">
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={() => onNavigate("PREV")}>
          <ChevronLeft className="size-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onNavigate("NEXT")}>
          <ChevronRight className="size-4" />
        </Button>
      </div>

      <div className="text-sm font-medium text-muted-foreground">{label}</div>

      <div className="flex items-center gap-1">
        {VIEW_OPTIONS.filter(
          ({ key }) => (views as Record<string, unknown>)[key] !== false,
        ).map(({ key, label: optionLabel }) => (
          <Button
            key={key}
            type="button"
            size="sm"
            variant={view === key ? "default" : "secondary"}
            onClick={() => onView(key)}
            className={
              view === key
                ? ""
                : "bg-transparent text-muted-foreground hover:text-foreground"
            }
          >
            {optionLabel}
          </Button>
        ))}
      </div>
    </div>
  );
}
