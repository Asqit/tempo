import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ProjectDetail } from "@/features/projects/components/project-detail";
import { Link, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/projects/$id")({
  component: ProjectDetailPage,
});

function ProjectDetailPage() {
  const { id } = Route.useParams();
  const numericId = Number(id);

  if (!Number.isFinite(numericId)) {
    return (
      <p className="text-sm text-destructive">
        Tohle není validní ID projektu.
      </p>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<Link to="/app/projects" />}
        >
          <ArrowLeft className="size-4" />
          Zpet na projekty
        </Button>
      </div>

      <section className="space-y-1">
        <p className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
          Delivery
        </p>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Projekt
        </h1>
        <p className="text-sm text-muted-foreground">
          Rychlý kontext k projektu a tomu, kam v práci patří.
        </p>
      </section>

      <ProjectDetail key={numericId} id={numericId} />
    </div>
  );
}
