import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ProjectsTable } from "@/features/projects/components/projects-table";
import { ProjectCreate } from "@/features/projects/components/project-create";
import { ClientPicker } from "@/features/clients/components/client-picker";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/projects/")({
  component: ProjectsPage,
});

function ProjectsPage() {
  const [refreshToken, setRefreshToken] = useState(0);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <section className="space-y-1">
        <p className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
          Delivery
        </p>
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Projekty
        </h2>
        <p className="text-sm text-muted-foreground">
          Spravuj projekty, přiřazení ke klientům a měj čistý přehled o práci.
        </p>
      </section>

      <Card>
        <CardHeader className="flex flex-col gap-3 border-b md:flex-row md:items-start md:justify-between">
          <div>
            <CardTitle>Projekty</CardTitle>
            <CardDescription>
              Vytvoř nový projekt a upravuj existující položky.
            </CardDescription>
          </div>
          <ProjectCreate
            onCreated={() => setRefreshToken((value) => value + 1)}
          />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 rounded-none border border-border/70 bg-muted/25 p-3 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                Filtrovat podle klienta
              </p>
              <p className="text-xs text-muted-foreground">
                Zobrazí se jen projekty pro vybraného klienta.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <ClientPicker
                value={selectedClientId}
                onChange={setSelectedClientId}
                placeholder="Všechny klienty"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedClientId(null)}
                disabled={selectedClientId === null}
              >
                Zrušit filtr
              </Button>
            </div>
          </div>

          <ProjectsTable key={refreshToken} clientId={selectedClientId} />
        </CardContent>
      </Card>
    </div>
  );
}
