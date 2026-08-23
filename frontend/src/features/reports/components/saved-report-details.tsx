import { useState } from "react";
import { CalendarDays, Gauge, ListChecks } from "lucide-react";

import { Toggle } from "@/components/ui/toggle";
import { SavedReportDetailed } from "./saved-report-detailed";
import { SavedReportTimesheet } from "./saved-report-timesheet";
import { SavedReportWorkload } from "./saved-report-workload";
import type { ReportDetails, Snapshot } from "./saved-report-utils";

interface Props {
  data: Snapshot[];
  report: ReportDetails;
}

type ReportMode = "detailed" | "timesheet" | "workload";

const REPORT_MODES: Array<{
  value: ReportMode;
  label: string;
  icon: typeof ListChecks;
}> = [
  { value: "detailed", label: "Detail", icon: ListChecks },
  { value: "timesheet", label: "Timesheet", icon: CalendarDays },
  { value: "workload", label: "Vytížení", icon: Gauge },
];

export function SavedReportDetails({ data, report }: Props) {
  const [mode, setMode] = useState<ReportMode>("detailed");

  return (
    <div className="flex flex-col gap-5">
      <header className="print-report-controls flex flex-col gap-3 border-b border-border/70 pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Pohled na report
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Zvolte způsob, který nejlépe odpovídá tomu, co právě potřebujete zjistit.
          </p>
        </div>
        <div
          className="flex w-full rounded-lg border border-border bg-muted/30 p-1 sm:w-auto"
          role="group"
          aria-label="Pohled na report"
        >
          {REPORT_MODES.map(({ value, label, icon: Icon }) => (
            <Toggle
              key={value}
              type="button"
              variant="default"
              size="sm"
              pressed={mode === value}
              onPressedChange={() => setMode(value)}
              aria-label={label}
              className="flex-1 gap-1.5 px-3 data-[state=on]:bg-background data-[state=on]:shadow-sm sm:flex-none"
            >
              <Icon data-icon="inline-start" />
              {label}
            </Toggle>
          ))}
        </div>
      </header>

      {mode === "detailed" && <SavedReportDetailed report={report} data={data} />}
      {mode === "timesheet" && <SavedReportTimesheet report={report} data={data} />}
      {mode === "workload" && <SavedReportWorkload data={data} />}
    </div>
  );
}
