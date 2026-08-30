import { useState } from "react";
import { Pencil } from "lucide-react";

import { Button } from "@tempo/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@tempo/ui/components/dialog";
import { ClientEditForm } from "../client-update-form";
import type { ClientWithBilling } from "../client-types";

type Props = {
  client: ClientWithBilling;
  onUpdated?: () => void;
  trigger?: React.ReactElement;
};

export function ClientUpdateDialog({ client, onUpdated, trigger }: Props) {
  const [open, setOpen] = useState(false);

  const handleUpdated = () => {
    setOpen(false);
    onUpdated?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          trigger ?? (
            <Button type="button" variant="ghost" size="sm">
              <Pencil className="size-3.5" />
              Upravit klienta
            </Button>
          )
        }
      />

      <DialogContent className="max-h-[min(90vh,820px)] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upravit klienta</DialogTitle>
          <DialogDescription>
            Upravte kontaktní, fakturační a cenové údaje klienta.
          </DialogDescription>
        </DialogHeader>

        <ClientEditForm client={client} onUpdated={handleUpdated} />
      </DialogContent>
    </Dialog>
  );
}
