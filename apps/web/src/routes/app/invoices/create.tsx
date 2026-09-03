import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/invoices/create")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>create</div>;
}
