import { ClientsTable } from "@/features/clients/components/clients-table";
import { ClientCreateDialog } from "@/features/clients/components/client-create-dialog";
import { createFileRoute } from "@tanstack/react-router";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/app/clients/")({
  component: ClientsPage,
});

function ClientsPage() {
  return (
    <div className="space-y-6">
      <header className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-muted-foreground text-xs">CRM</h2>
          <h1 className="text-3xl font-black uppercase">Klienti</h1>
          <p className="text-muted-foreground text-sm">
            Spravujte své klientské portfólio na jednom místě.
          </p>
        </div>
        <ClientCreateDialog />
      </header>
      <Separator />
      <ClientsTable />
    </div>
  );
}
