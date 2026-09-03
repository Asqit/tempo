import { InvoicesTable } from "@/features/invoices/components/invoices-table";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/invoices/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <InvoicesTable />
    </div>
  );
}
