import { useState } from "react";
import { Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { ProjectUpdateForm } from "../project-update-form";

type ProjectUpdateDialogProps = {
  project: {
    id: number;
    name: string;
    client_id: number | null;
    start_time: string | null;
    end_time: string | null;
  };
  onUpdated?: (nextName: string, nextClientId: number) => void;
  trigger?: React.ReactNode;
};

export function ProjectUpdateDialog({
  project,
  onUpdated,
  trigger,
}: ProjectUpdateDialogProps) {
  const [open, setOpen] = useState(false);

  const handleUpdated = (nextName: string, nextClientId: number) => {
    setOpen(false);
    onUpdated?.(nextName, nextClientId);
  };

  if (trigger) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upravit projekt #{project.id}</DialogTitle>
            <DialogDescription>
              Aktualizujte název a klienta projektu.
            </DialogDescription>
          </DialogHeader>

          <ProjectUpdateForm
            id={project.id}
            initialName={project.name}
            initialClientId={project.client_id}
            initialStartTime={project.start_time}
            initialEndTime={project.end_time}
            onUpdated={handleUpdated}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="ghost" size="sm">
          <Pencil className="size-3.5" />
          Upravit
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upravit projekt #{project.id}</DialogTitle>
          <DialogDescription>
            Aktualizujte název a klienta projektu.
          </DialogDescription>
        </DialogHeader>

        <ProjectUpdateForm
          id={project.id}
          initialName={project.name}
          initialClientId={project.client_id}
          initialStartTime={project.start_time}
          initialEndTime={project.end_time}
          onUpdated={handleUpdated}
        />
      </DialogContent>
    </Dialog>
  );
}
