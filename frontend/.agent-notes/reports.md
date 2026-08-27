# Reports

- Saved report detail now supports three local presentation modes: `Detail`, `Timesheet`, and `Vytížení`.
- `saved-report-details.tsx` owns mode selection; `saved-report-detailed.tsx` is the analysis/ledger view inspired by Toggl's detailed report; `saved-report-timesheet.tsx` is client-facing daily work; `saved-report-workload.tsx` summarizes project and daily allocation.
- All modes use the existing `ReportRead.snapshots` payload; no API or route changes are required for switching views.
- The report view toggle uses the existing Base UI `Toggle` primitive because `ToggleGroup` is not installed in this project.
- Saved report views have browser print/PDF foundations: app chrome and mode controls hide in print, report cards avoid page breaks, table headers repeat, and animations/backgrounds are disabled or normalized.
- Shared duration and billing logic lives in `src/lib/time.ts` and `src/lib/money.ts`; report views should import those helpers instead of defining local formatters or amount calculations.
- Reports UI copy is Czech; use `Výkaz času` for the client-facing timesheet view and keep report statistics/filter labels localized.
- `ReportRead.client_snapshot` and `project_snapshot` are arrays; use helpers in `saved-report-utils.ts` for first-client billing data and joined display names.
- The live report page collects a required report name and optional description before saving with `client_ids` and `project_ids`.
- Report metadata uses a dedicated card with `Field` primitives; keep the title prominent and description contextual rather than presenting bare controls.
- Saving a live report uses a focused dialog from the page-header action; do not put save metadata fields inline above the report preview.
