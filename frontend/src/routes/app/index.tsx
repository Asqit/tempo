import { useAuthStore } from "@/features/auth";
import { EntriesTable } from "@/features/time-entry/components/entries-table";
import { NewEntry } from "@/features/time-entry/components/new-entry";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { user } = useAuthStore.getState();

  return (
    <div>
      <NewEntry />
      <EntriesTable />
    </div>
  );
}
