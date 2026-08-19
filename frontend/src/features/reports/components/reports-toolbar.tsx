import * as React from "react";
import {
  format,
  startOfWeek,
  endOfWeek,
  subWeeks,
  startOfMonth,
  endOfMonth,
  subMonths,
} from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClientPicker } from "@/features/clients/components/client-picker";
import { ProjectPicker } from "@/features/projects/components/project-picker";
import type { DateRange } from "react-day-picker";

type Preset =
  "this_week" | "last_week" | "this_month" | "last_month" | "custom";

interface Props {
  setStartTime(d: string): void;
  setEndTime(d: string): void;
  setClientId(id: number): void;
  setProjectId(id: number): void;
  setBillable(b: boolean): void;
  clientId?: number;
  projectId?: number;
}

function getPresetRange(preset: Preset): DateRange | undefined {
  const now = new Date();
  switch (preset) {
    case "this_week":
      return {
        from: startOfWeek(now, { weekStartsOn: 1 }),
        to: endOfWeek(now, { weekStartsOn: 1 }),
      };
    case "last_week": {
      const lastWeek = subWeeks(now, 1);
      return {
        from: startOfWeek(lastWeek, { weekStartsOn: 1 }),
        to: endOfWeek(lastWeek, { weekStartsOn: 1 }),
      };
    }
    case "this_month":
      return { from: startOfMonth(now), to: endOfMonth(now) };
    case "last_month": {
      const lastMonth = subMonths(now, 1);
      return { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) };
    }
    default:
      return undefined;
  }
}

export function ReportsToolbar(props: Props) {
  const {
    setStartTime,
    setEndTime,
    setClientId,
    setProjectId,
    setBillable,
    clientId,
    projectId,
  } = props;

  const [preset, setPreset] = React.useState<Preset>("this_week");
  const [range, setRange] = React.useState<DateRange | undefined>(
    getPresetRange("this_week"),
  );
  const [popoverOpen, setPopoverOpen] = React.useState(false);

  function applyRange(next: DateRange | undefined) {
    setRange(next);
    if (next?.from) setStartTime(next.from.toISOString());
    if (next?.to) setEndTime(next.to.toISOString());
  }

  function handlePresetChange(value: Preset) {
    setPreset(value);
    if (value === "custom") {
      setPopoverOpen(true);
      return;
    }
    applyRange(getPresetRange(value));
  }

  function handleCustomSelect(next: DateRange | undefined) {
    setRange(next);
    if (next?.from && next?.to) {
      applyRange(next);
      setPopoverOpen(false);
    }
  }

  const rangeLabel =
    range?.from && range?.to
      ? `${format(range.from, "d MMM")} – ${format(range.to, "d MMM yyyy")}`
      : "Select range";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        value={preset}
        onValueChange={(v) => handlePresetChange(v as Preset)}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Period" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="this_week">This week</SelectItem>
          <SelectItem value="last_week">Last week</SelectItem>
          <SelectItem value="this_month">This month</SelectItem>
          <SelectItem value="last_month">Last month</SelectItem>
          <SelectItem value="custom">Custom</SelectItem>
        </SelectContent>
      </Select>

      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-[240px] justify-start text-left font-normal"
            onClick={() => {
              setPreset("custom");
              setPopoverOpen(true);
            }}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {rangeLabel}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={range}
            onSelect={handleCustomSelect}
            numberOfMonths={2}
            defaultMonth={range?.from}
          />
        </PopoverContent>
      </Popover>

      <ClientPicker value={clientId ?? 0} onChange={(v) => setClientId(v)} />
      <ProjectPicker value={projectId ?? 0} onChange={(v) => setProjectId(v)} />
    </div>
  );
}
