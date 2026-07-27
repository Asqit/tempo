import { ClientDetail } from "@/features/clients/components/client-detail";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/clients/$id")({
  component: () => {
    const { id } = Route.useParams();
    const numericId = Number(id);

    if (!Number.isFinite(numericId)) {
      return <p className="text-sm text-destructive">Neplatne ID klienta.</p>;
    }

    return (
      <div className="space-y-4">
        <div>
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link to="/app/clients" />}
          >
            Zpet na klienty
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Detail klienta</CardTitle>
            <CardDescription>
              Nahled a uprava vybraneho klienta.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ClientDetail id={numericId} />
          </CardContent>
        </Card>
      </div>
    );
  },
});
