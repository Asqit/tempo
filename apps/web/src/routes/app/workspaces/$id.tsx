import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/workspaces/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/app/workspaces/$id"!</div>;
}
