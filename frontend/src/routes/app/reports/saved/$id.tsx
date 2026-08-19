import { Separator } from "@/components/ui/separator";
import { SavedReportDetails } from "@/features/reports/components/saved-report-details";
import { useWorkspaceStore } from "@/features/workspaces/store";
import { $api } from "@/lib/api";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/reports/saved/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const { activeWorkspace } = useWorkspaceStore();
  const { id } = Route.useParams();
  const numericId = Number(id);

  if (!Number.isFinite(numericId)) {
    return (
      <p className="text-sm text-destructive">
        Tohle není validní ID projektu.
      </p>
    );
  }

  const { data, isLoading } = $api.useQuery("get", "/api/v1/reports/{id}", {
    params: {
      path: {
        id,
      },
      header: {
        "X-Workspace-Id": activeWorkspace!,
      },
    },
  });

  if (isLoading) return null;

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-muted-foreground text-xs uppercase">
          Uložený report
        </h2>
        <h1 className="text-3xl font-black uppercase">
          Report <span className="text-primary">{data.name}</span>
        </h1>
      </header>
      <Separator />
      <SavedReportDetails report={data} data={data.snapshots} />
    </div>
  );
}
