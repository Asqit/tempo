import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProjectDetail } from "@/features/projects/components/project-detail";
import { Link, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/projects/$id")({
  component: () => {
    const { id } = Route.useParams();
    const numericId = Number(id);

    if (!Number.isFinite(numericId)) {
      return <p className="text-sm text-destructive">Neplatne ID projektu.</p>;
    }

    return (
      <div className="space-y-4">
        <div>
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link to="/app/projects" />}
          >
            Zpet na projekty
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Detail projektu</CardTitle>
            <CardDescription>
              Nahled a uprava vybraneho projektu.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProjectDetail id={numericId} />
          </CardContent>
        </Card>
      </div>
    );
  },
});
