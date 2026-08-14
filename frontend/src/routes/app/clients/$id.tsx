import { ClientDetail } from "@/features/clients/components/client-detail";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/clients/$id")({
  component: ClientDetailPage,
});

function ClientDetailPage() {
  const { id } = Route.useParams();
  const numericId = Number(id);

  if (!Number.isFinite(numericId)) {
    return (
      <p className="text-sm text-destructive">Tohle není validní ID klienta.</p>
    );
  }

  return <ClientDetail id={numericId} />;
}
