import { IssueInvoice } from "@/features/invoices/components/issue-invoice";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/invoices/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();

  return <IssueInvoice invoiceId={Number(id)} />;
}
