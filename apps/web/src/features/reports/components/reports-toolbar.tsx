import type { DateRange } from "react-day-picker";
import {
  format,
  startOfWeek,
  endOfWeek,
  subWeeks,
  startOfMonth,
  endOfMonth,
  subMonths,
} from "date-fns";
import { Calendar as CalendarIcon, Folder, User } from "lucide-react";
import { Button } from "@tempo/ui/components/button";
import { Calendar } from "@tempo/ui/components/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@tempo/ui/components/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@tempo/ui/components/select";
import { ClientPicker } from "@/features/clients/components/client-picker";
import { ProjectPicker } from "@/features/projects/components/project-picker";
import { cs } from "date-fns/locale";
import { FilterPill } from "@/components/share/filter-pill";
import { useState } from "react";

type Preset =
  "this_week" | "last_week" | "this_month" | "last_month" | "custom";

interface Props {
  setStartTime(d: string): void;
  setEndTime(d: string): void;
  setClientIds(ids: number[]): void;
  setProjectIds(ids: number[]): void;
  setBillable(b: boolean): void;
  clientIds?: number[];
  projectIds?: number[];
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
    setClientIds,
    setProjectIds,
    clientIds,
    projectIds,
  } = props;

  const [preset, setPreset] = useState<Preset>("this_week");
  const [range, setRange] = useState<DateRange | undefined>(
    getPresetRange("this_week"),
  );
  const [popoverOpen, setPopoverOpen] = useState(false);

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
      : "Vyberte období";

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Období */}
      <FilterPill
        icon={CalendarIcon}
        label={rangeLabel}
        active={preset === "custom"}
        onClear={() => {
          setPreset("this_week");
          applyRange(getPresetRange("this_week"));
        }}
      >
        <div className="flex items-center gap-2 w-fit">
          <Select
            value={preset}
            onValueChange={(v) => handlePresetChange(v as Preset)}
          >
            <SelectTrigger className="w-[160px] border-0 shadow-none">
              <SelectValue placeholder="Období" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this_week">Tento Týden</SelectItem>
              <SelectItem value="last_week">Minulý Týden</SelectItem>
              <SelectItem value="this_month">Tento Měsíc</SelectItem>
              <SelectItem value="last_month">Minulý Měsíc</SelectItem>
              <SelectItem value="custom">Vlastní</SelectItem>
            </SelectContent>
          </Select>

          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger>
              <Button
                variant="ghost"
                className="h-8 px-2 font-normal"
                onClick={() => {
                  setPreset("custom");
                  setPopoverOpen(true);
                }}
              >
                {rangeLabel}
              </Button>
            </PopoverTrigger>

            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                locale={cs}
                mode="range"
                selected={range}
                onSelect={handleCustomSelect}
                numberOfMonths={2}
                defaultMonth={range?.from}
              />
            </PopoverContent>
          </Popover>
        </div>
      </FilterPill>

      <FilterPill
        icon={User}
        label={clientIds?.length ? `Klienti (${clientIds.length})` : "Klienti"}
        active={!!clientIds?.length}
        onClear={() => setClientIds([])}
      >
        <ClientPicker
          multiple
          value={clientIds ?? []}
          onChange={setClientIds}
        />
      </FilterPill>

      <FilterPill
        icon={Folder}
        label={
          projectIds?.length ? `Projekty (${projectIds.length})` : "Projekty"
        }
        active={!!projectIds?.length}
        onClear={() => setProjectIds([])}
      >
        <ProjectPicker
          multiple
          value={projectIds ?? []}
          onChange={setProjectIds}
        />
      </FilterPill>
    </div>
  );
}
