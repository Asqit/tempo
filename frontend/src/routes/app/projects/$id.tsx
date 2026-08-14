import { ProjectDetail } from "@/features/projects/components/project-detail";
import { createFileRoute } from "@tanstack/react-router";

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

  return <ProjectDetail id={numericId} />;
}
