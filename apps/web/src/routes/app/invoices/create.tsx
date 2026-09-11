import { IssueInvoice } from "@/features/invoices/components/issue-invoice";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/invoices/create")({
  component: RouteComponent,
});

function RouteComponent() {
  return <IssueInvoice />;
}
