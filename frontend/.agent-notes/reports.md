# Reports

- Saved report detail now supports three local presentation modes: `Detail`, `Timesheet`, and `Vytížení`.
- `saved-report-details.tsx` owns mode selection; `saved-report-detailed.tsx` is the analysis/ledger view inspired by Toggl's detailed report; `saved-report-timesheet.tsx` is client-facing daily work; `saved-report-workload.tsx` summarizes project and daily allocation.
- All modes use the existing `ReportRead.snapshots` payload; no API or route changes are required for switching views.
- The report view toggle uses the existing Base UI `Toggle` primitive because `ToggleGroup` is not installed in this project.
- Saved report views have browser print/PDF foundations: app chrome and mode controls hide in print, report cards avoid page breaks, table headers repeat, and animations/backgrounds are disabled or normalized.
- Shared duration and billing logic lives in `src/lib/time.ts` and `src/lib/money.ts`; report views should import those helpers instead of defining local formatters or amount calculations.
