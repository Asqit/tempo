import { NewEntry } from "@/features/time-entry/components/new-entry";
import { createFileRoute } from "@tanstack/react-router";
import { TimeEntryCalendar } from "@/features/time-entry/components/calendar";

export const Route = createFileRoute("/app/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <main className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">
        <NewEntry />
        <TimeEntryCalendar />
      </main>
    </div>
  );
}
