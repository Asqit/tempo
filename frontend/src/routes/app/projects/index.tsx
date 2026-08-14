import { useState } from "react";

import { ProjectsTable } from "@/features/projects/components/projects-table";
import { ProjectCreate } from "@/features/projects/components/project-create";
import { ClientPicker } from "@/features/clients/components/client-picker";
import { createFileRoute } from "@tanstack/react-router";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/app/projects/")({
  component: ProjectsPage,
});

function ProjectsPage() {
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-muted-foreground text-xs uppercase">dodávka</h2>
          <h1 className="text-3xl uppercase font-black">Projekty</h1>
        </div>
        <ProjectCreate />
      </header>
      <Separator />
      <main>
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

        <ProjectsTable clientId={selectedClientId} />
      </main>
    </div>
  );
}
