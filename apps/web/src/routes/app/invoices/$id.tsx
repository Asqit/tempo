import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/invoices/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/app/invoices/$id"!</div>;
}
