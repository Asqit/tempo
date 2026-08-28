import { Button } from "@/components/ui/button";
import { TimeEntryCreateDialog } from "@/features/time-entry/components/time-entry-create-dialog";
import { ProjectUpdateDialog } from "../../project-update-dialog";
import { PlayCircle } from "lucide-react";
import type { components } from "@/lib/api.d";

type ProjectHeaderProps = {
  project: components["schemas"]["ProjectRead"];
};

export function ProjectHeader({ project }: ProjectHeaderProps) {
  return (
    <header className="flex items-center justify-between">
      <div>
        <h2 className="text-muted-foreground text-xs uppercase">PROJEKT</h2>
        <h1 className="text-3xl uppercase font-black">{project.name}</h1>
      </div>
      <div className="flex gap-2 items-center">
        <ProjectUpdateDialog
          trigger={<Button variant="outline">upravit projekt</Button>}
          project={{
            id: project.id,
            name: project.name,
            client_id: project.client?.id,
            start_time: project.start_time,
            end_time: project.end_time,
          }}
        />
        <TimeEntryCreateDialog
          trigger={
            <Button
              className="gap-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
              type="button"
            >
              <PlayCircle className="size-4" />
              Spustit čas
            </Button>
          }
        />
      </div>
    </header>
  );
}
