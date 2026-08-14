import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { TimeEntryCreateForm } from "../time-entry-create-form";

type TimeEntryCreateDialogProps = {
  onCreated?: () => void;
  trigger?: React.ReactNode;
};

export function TimeEntryCreateDialog({
  onCreated,
  trigger,
}: TimeEntryCreateDialogProps) {
  const [open, setOpen] = useState(false);

  const handleCreated = () => {
    setOpen(false);
    onCreated?.();
  };

  if (trigger) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Vytvořit nový výkaz</DialogTitle>
            <DialogDescription>
              Přidejte popis, projekt a časové údaje pro nový výkaz.
            </DialogDescription>
          </DialogHeader>

          <TimeEntryCreateForm onCreated={handleCreated} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="ghost" size="sm">
          <Plus className="size-3.5" />
          Nový výkaz
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Vytvořit nový výkaz</DialogTitle>
          <DialogDescription>
            Přidejte popis, projekt a časové údaje pro nový výkaz.
          </DialogDescription>
        </DialogHeader>

        <TimeEntryCreateForm onCreated={handleCreated} />
      </DialogContent>
    </Dialog>
  );
}
