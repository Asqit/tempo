import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/invoices/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div></div>;
}
