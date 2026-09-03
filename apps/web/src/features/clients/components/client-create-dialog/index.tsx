import { useState } from "react";
import { UserPlus2 } from "lucide-react";

import { Button } from "@tempo/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@tempo/ui/components/dialog";
import { ClientCreateForm } from "../client-create-form";
import type { components } from "@tempo/api-types";

type ClientCreateDialogProps = {
  onCreated?: (client: components["schemas"]["ClientRead"]) => void;
  trigger?: React.ReactElement;
};

export function ClientCreateDialog({
  onCreated,
  trigger,
}: ClientCreateDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          trigger ?? (
            <Button type="button">
              <UserPlus2 data-icon="inline-start" />
              Nový klient
            </Button>
          )
        }
      />
      <DialogContent className="max-h-[min(90vh,820px)] overflow-y-auto border-border/80 sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nový klient</DialogTitle>
          <DialogDescription>
            Zadej kontaktní, fakturační a cenové údaje klienta.
          </DialogDescription>
        </DialogHeader>
        <ClientCreateForm
          onCreated={(client) => {
            setOpen(false);
            onCreated?.(client);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
