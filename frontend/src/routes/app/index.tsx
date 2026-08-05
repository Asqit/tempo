import { EntriesTable } from "@/features/time-entry/components/entries-table";
import { NewEntry } from "@/features/time-entry/components/new-entry";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <section className="space-y-1">
        <p className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
          Workspace
        </p>
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Přehled času
        </h2>
        <p className="text-sm text-muted-foreground">
          Spusť záznam práce a měj přehled o všech posledních aktivitách.
        </p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Rychlý záznam</CardTitle>
          <CardDescription>
            Jedním klikem spustíš nebo zastavíš aktuální měření času.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NewEntry />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Poslední záznamy</CardTitle>
          <CardDescription>
            Přehled nejnovějších položek včetně délky a stavu.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EntriesTable />
        </CardContent>
      </Card>
    </div>
  );
}
