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
    <div className="mx-auto flex w-full flex-col gap-5">
      <section className="space-y-1 flex items-center gap-2">
        <div>
          <p className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            Delivery
          </p>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Projekt
          </h1>
          <p className="text-sm text-muted-foreground">
            Rychlý kontext k projektu a tomu, kam v práci patří.
          </p>
        </div>
      </section>

      <ProjectDetail key={numericId} id={numericId} />
    </div>
  );
}
