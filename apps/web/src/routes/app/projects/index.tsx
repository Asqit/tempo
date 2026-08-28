import { useState } from "react";

import { ProjectsTable } from "@/features/projects/components/projects-table";
import { ProjectCreate } from "@/features/projects/components/project-create";
import { ClientPicker } from "@/features/clients/components/client-picker";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/share/page-header";

export const Route = createFileRoute("/app/projects/")({
  component: ProjectsPage,
});

function ProjectsPage() {
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 ease-out fill-mode-both">
      <PageHeader
        eyebrow="Dodávka"
        title="Projekty"
        actions={<ProjectCreate />}
      />
      <main className="animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out delay-100 fill-mode-both">
        <div className="flex flex-col gap-3 rounded-lg border border-border/70 bg-muted/25 p-3 md:flex-row md:items-center md:justify-between">
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
