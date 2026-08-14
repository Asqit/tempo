import { Button } from "@/components/ui/button";
import { TimeEntryCreateDialog } from "@/features/time-entry/components/time-entry-create-dialog";

import { PlayCircle } from "lucide-react";
import type { components } from "@/lib/api.d";

type ClientHeaderProps = {
  client: components["schemas"]["ClientRead"];
};

export function ClientHeader({ client }: ClientHeaderProps) {
  return (
    <header className="flex items-center justify-between">
      <div>
        <h2 className="text-muted-foreground text-xs uppercase">Klient</h2>
        <h1 className="text-3xl uppercase font-black">{client.name}</h1>
      </div>
      <div className="flex gap-2 items-center">
        {/* <ClientUpdateDialog
          trigger={<Button variant="outline">Upravit klienta</Button>}
          client={{
            id: client.id,
            name: client.name,
          }}
        /> */}
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
