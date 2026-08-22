import { ClientsTable } from "@/features/clients/components/clients-table";
import { ClientCreateDialog } from "@/features/clients/components/client-create-dialog";
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/share/page-header";

export const Route = createFileRoute("/app/clients/")({
  component: ClientsPage,
});

function ClientsPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300 ease-out fill-mode-both">
      <PageHeader
        eyebrow="CRM"
        title="Klienti"
        description="Spravujte své klientské portfolio na jednom místě."
        actions={<ClientCreateDialog />}
      />
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out delay-100 fill-mode-both">
        <ClientsTable />
      </div>
    </div>
  );
}
