import { useState, type ReactNode } from "react";
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

import { TimeEntryUpdateForm } from "../time-entry-update-form";

type TimeEntryUpdateDialogProps = {
  entry: {
    id: number;
    description: string | null;
    project_id: number | null;
    start_time: string;
    end_time: string | null;
    billable: boolean;
  };
  onUpdated?: () => void;
  children?: ReactNode;
};

export function TimeEntryUpdateDialog({
  entry,
  onUpdated,
  children,
}: TimeEntryUpdateDialogProps) {
  const [open, setOpen] = useState(false);

  const handleUpdated = () => {
    setOpen(false);
    onUpdated?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          children ?? (
            <Button type="button" variant="ghost" size="sm">
              <Pencil className="size-3.5" />
              Upravit
            </Button>
          )
        }
      />

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upravit výkaz #{entry.id}</DialogTitle>
          <DialogDescription>
            Aktualizujte popis, projekt nebo časové údaje výkazu.
          </DialogDescription>
        </DialogHeader>

        <TimeEntryUpdateForm
          id={entry.id}
          initialDescription={entry.description}
          initialProjectId={entry.project_id}
          initialStartTime={entry.start_time}
          initialEndTime={entry.end_time}
          initialBillable={entry.billable}
          onUpdated={handleUpdated}
        />
      </DialogContent>
    </Dialog>
  );
}
