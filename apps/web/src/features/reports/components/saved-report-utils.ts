import type { components } from "@tempo/api-types";
import { format } from "date-fns";
import { cs } from "date-fns/locale";
import { parseHourlyRate } from "@/lib/money";

export type Snapshot = components["schemas"]["ReportEntrySnapshot"];
export type ReportDetails = components["schemas"]["ReportRead"];

export function getReportRate(report: ReportDetails) {
  return parseHourlyRate(report.client_snapshot[0]?.hourly_rate);
}

export function getReportCurrency(report: ReportDetails) {
  return report.client_snapshot[0]?.currency;
}

export function getReportClientNames(report: ReportDetails) {
  return report.client_snapshot.map((client) => client.name).join(", ");
}

export function getReportProjectNames(report: ReportDetails) {
  return report.project_snapshot.map((project) => project.name).join(", ");
}

export function getReportTotalMinutes(data: Snapshot[]) {
  return data.reduce((total, snapshot) => total + snapshot.duration_minutes, 0);
}

export function getDayKey(date: string) {
  return format(new Date(date), "yyyy-MM-dd");
}

export function formatDay(date: string) {
  return format(new Date(`${date}T12:00:00`), "EEEE, d. MMMM yyyy", {
    locale: cs,
  });
}

export function formatShortDay(date: string) {
  return format(new Date(`${date}T12:00:00`), "d. MMM", { locale: cs });
}

export function groupSnapshotsByDay(data: Snapshot[]) {
  const groups = new Map<string, Snapshot[]>();

  for (const snapshot of data) {
    const key = getDayKey(snapshot.logged_at);
    const current = groups.get(key) ?? [];
    groups.set(key, [...current, snapshot]);
  }

  return [...groups.entries()].sort(([left], [right]) =>
    left.localeCompare(right),
  );
}
