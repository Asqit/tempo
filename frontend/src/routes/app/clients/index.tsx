import { ClientsTable } from "@/features/clients/components/clients-table";
import { ClientCreateDialog } from "@/features/clients/components/client-create-dialog";
import { createFileRoute } from "@tanstack/react-router";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/app/clients/")({
  component: ClientsPage,
});

function ClientsPage() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <header className="mb-4 flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-500 delay-100">
        <div>
          <h2 className="text-muted-foreground text-xs animate-in fade-in slide-in-from-right-3 duration-300 delay-150">
            CRM
          </h2>
          <h1 className="text-3xl font-black uppercase animate-in fade-in slide-in-from-left-3 duration-300 delay-150">
            Klienti
          </h1>
          <p className="text-muted-foreground text-sm animate-in fade-in slide-in-from-top-4 duration-500 delay-75">
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
