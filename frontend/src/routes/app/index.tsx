import { NewEntry } from "@/features/time-entry/components/new-entry";
import { createFileRoute } from "@tanstack/react-router";
import { $api } from "@/lib/api";
import { useWorkspaceStore } from "@/features/workspaces/store";
import {
  getHours,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import { useMemo } from "react";
import { TimeEntryCalendar } from "@/features/time-entry/components/calendar";
import { durationMinutesBetween, formatDuration } from "@/lib/time";

export const Route = createFileRoute("/app/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { activeWorkspace } = useWorkspaceStore();
  const { data, isLoading } = $api.useQuery(
    "get",
    "/api/v1/time-entries/calendar",
    {
      params: {
        query: {
          start_time: startOfMonth(new Date()).toISOString(),
          end_time: endOfMonth(new Date()).toISOString(),
        },
        header: {
          "X-Workspace-Id": activeWorkspace!,
        },
      },
    },
  );

  const { total, billable } = useMemo(() => {
    if (isLoading) {
      return {
        total: "00h:00m",
        billable: "00h:00m",
      };
    }

    const { totalMinutes, billableMinutes } = (data ?? []).reduce(
      (acc, entry) => {
        if (!entry.end_time) return acc;

        const minutes = durationMinutesBetween(entry.start_time, entry.end_time);

        acc.totalMinutes += minutes;

        if (entry.billable) {
          acc.billableMinutes += minutes;
        }

        return acc;
      },
      { totalMinutes: 0, billableMinutes: 0 },
    );

    return {
      total: formatDuration(totalMinutes, "dashboard"),
      billable: formatDuration(billableMinutes, "dashboard"),
    };
  }, [data, isLoading]);
  const greeting = useMemo(() => {
    const hour = getHours(new Date());
    if (hour >= 5 && hour < 12) return "Dobré ráno.";
    if (hour >= 12 && hour < 13) return "Dobré poledne.";
    if (hour >= 13 && hour < 18) return "Dobrý den.";
    if (hour >= 18 && hour < 22) return "Dobrý večer.";
    return "Ještě pracuješ?";
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <header className="flex justify-between items-center border-b pb-2 animate-in fade-in slide-in-from-top-4 duration-500 delay-100">
        <div>
          <h2 className="text-muted-foreground text-xs">PŘEHLED</h2>
          <h1 className="text-3xl uppercase font-black">{greeting}</h1>
        </div>
        <div>
          <ul className="flex gap-2 items-center animate-in fade-in slide-in-from-top-4 duration-500 delay-75">
            <li className="flex flex-col items-end border-r pr-2 animate-in fade-in slide-in-from-left-3 duration-300 delay-150">
              <span className="text-xs text-muted-foreground">TENTO MĚSÍC</span>
              <time className="text-primary text-2xl font-black">{total}</time>
            </li>

            <li className="flex flex-col items-end animate-in fade-in slide-in-from-right-3 duration-300 delay-150">
              <span className="text-xs text-muted-foreground">ZPOPLATNĚNÉ</span>
              <time className="text-2xl font-black">{billable}</time>
            </li>
          </ul>
        </div>
      </header>
      <main className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">
        <NewEntry />
        <TimeEntryCalendar />
      </main>
    </div>
  );
}
