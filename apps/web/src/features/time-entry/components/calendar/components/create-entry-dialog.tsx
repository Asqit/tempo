import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@tempo/ui/components/dialog";
import { TimeEntryCreateForm } from "../../time-entry-create-form";

type CreateEntryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedSlot: { start: Date; end: Date } | null;
};

export function CreateEntryDialog({
  open,
  onOpenChange,
  selectedSlot,
}: CreateEntryDialogProps) {
  if (!selectedSlot) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nový výkaz</DialogTitle>
        </DialogHeader>
        <TimeEntryCreateForm
          initialStartTime={selectedSlot.start}
          initialEndTime={selectedSlot.end}
          onCreated={() => {
            onOpenChange(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
