import { PublicLayout } from "@/layouts/public";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_public")({
  component() {
    return <PublicLayout />;
  },
});
