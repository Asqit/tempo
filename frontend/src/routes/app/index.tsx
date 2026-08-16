import { NewEntry } from "@/features/time-entry/components/new-entry";
import { createFileRoute } from "@tanstack/react-router";
import { ClientCreateDialog } from "@/features/clients/components/client-create-dialog";
import { ProjectCreate } from "@/features/projects/components/project-create";
import { EntriesTable } from "@/features/time-entry/components/entries-table";
import { $api } from "@/lib/api";
import { useWorkspaceStore } from "@/features/workspaces/store";
import {
  endOfWeek,
  startOfWeek,
  differenceInMinutes,
  parseISO,
  getHours,
} from "date-fns";
import { useMemo } from "react";
import { Plus, PlusCircle, UserRoundPlus } from "lucide-react";
import { TimeEntryCalendar } from "@/features/time-entry/components/calendar";

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
          start_time: startOfWeek(new Date()).toISOString(),
          end_time: endOfWeek(new Date()).toISOString(),
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

        const minutes = differenceInMinutes(
          parseISO(entry.end_time),
          parseISO(entry.start_time),
        );

        acc.totalMinutes += minutes;

        if (entry.billable) {
          acc.billableMinutes += minutes;
        }

        return acc;
      },
      { totalMinutes: 0, billableMinutes: 0 },
    );

    const formatDuration = (minutes: number) => {
      const h = Math.floor(minutes / 60);
      const m = minutes % 60;

      return `${h}h:${String(m).padStart(2, "0")}m`;
    };

    return {
      total: formatDuration(totalMinutes),
      billable: formatDuration(billableMinutes),
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
    <div className="space-y-6">
      <header className="flex justify-between items-center border-b pb-2">
        <div>
          <h2 className="text-muted-foreground text-xs">PŘEHLED</h2>
          <h1 className="text-3xl uppercase font-black">{greeting}</h1>
        </div>
        <div>
          <ul className="flex gap-2 items-center">
            <li className="flex flex-col items-end border-r pr-2">
              <span className="text-xs text-muted-foreground">TENTO TÝDEN</span>
              <time className="text-primary text-2xl font-black">{total}</time>
            </li>

            <li className="flex flex-col items-end">
              <span className="text-xs text-muted-foreground">ZPOPLATNĚNÉ</span>
              <time className="text-2xl font-black">{billable}</time>
            </li>
          </ul>
        </div>
      </header>
      <main className="space-y-4">
        <NewEntry />
        <TimeEntryCalendar />
      </main>
    </div>
  );
}
