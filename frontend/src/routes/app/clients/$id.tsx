import { ClientDetail } from "@/features/clients/components/client-detail";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link, createFileRoute } from "@tanstack/react-router";

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

  return (
    <div className="mx-auto flex w-full flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<Link to="/app/clients" />}
        >
          <ArrowLeft className="size-4" />
          Zpet na klienty
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Klient</CardTitle>
          <CardDescription>
            Přehled klienta a projektů, které pod něj patří.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ClientDetail key={numericId} id={numericId} />
        </CardContent>
      </Card>
    </div>
  );
}
