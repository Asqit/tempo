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
      <p className="text-sm text-destructive animate-in fade-in slide-in-from-bottom-2 duration-300 ease-out fill-mode-both">
        Tohle není validní ID klienta.
      </p>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out fill-mode-both">
      <ClientDetail id={numericId} />
    </div>
  );
}
