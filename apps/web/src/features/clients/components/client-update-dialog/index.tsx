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
import { ClientEditForm } from "../client-update-form";

type Props = {
  client: {
    id: number;
    name: string;
    hourly_rate: number | string | null;
    currency: string | null;
  };
  onUpdated?: () => void;
  trigger?: React.ReactNode;
};

export function ClientUpdateDialog({ client, onUpdated, trigger }: Props) {
  const [open, setOpen] = useState(false);

  const handleUpdated = () => {
    setOpen(false);
    onUpdated?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button type="button" variant="ghost" size="sm">
            <Pencil className="size-3.5" />
            Upravit klienta
          </Button>
        )}
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upravit klienta</DialogTitle>
          <DialogDescription>
            Upravte údaje a výchozí hodinovou sazbu klienta.
          </DialogDescription>
        </DialogHeader>

        <ClientEditForm client={client} onUpdated={handleUpdated} />
      </DialogContent>
    </Dialog>
  );
}
