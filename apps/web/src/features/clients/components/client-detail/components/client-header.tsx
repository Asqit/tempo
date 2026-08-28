import type { components } from "@/lib/api.d";
import { Button } from "@/components/ui/button";
import { TimeEntryCreateDialog } from "@/features/time-entry/components/time-entry-create-dialog";
import { PlayCircle } from "lucide-react";
import { ClientUpdateDialog } from "../../client-update-dialog";

type ClientHeaderProps = {
  client: components["schemas"]["ClientRead"];
};

export function ClientHeader({ client }: ClientHeaderProps) {
  return (
    <header className="flex items-center justify-between">
      <div>
        <div className="mb-3 flex w-fit items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-2 py-1 text-xs uppercase text-primary">
          <div className="size-2 rounded-full bg-primary" />
          <span>Vybraný klient</span>
        </div>
        <h1 className="text-3xl uppercase font-black">{client.name}</h1>
      </div>
      <div className="flex gap-2 items-center">
        <ClientUpdateDialog
          trigger={<Button variant="outline">Upravit klienta</Button>}
          client={client}
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
