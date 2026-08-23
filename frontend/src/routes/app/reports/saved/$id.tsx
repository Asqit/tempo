import { SavedReportDetails } from "@/features/reports/components/saved-report-details";
import { useWorkspaceStore } from "@/features/workspaces/store";
import { $api } from "@/lib/api";
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/share/page-header";

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
        id: numericId,
      },
      header: {
        "X-Workspace-Id": activeWorkspace!,
      },
    },
  });

  if (isLoading) return null;

  if (!data) {
    return (
      <p className="text-sm text-destructive">
        Report se nepodařilo načíst.
      </p>
    );
  }

  return (
    <div className="print-report space-y-6 animate-in fade-in duration-300 ease-out fill-mode-both">
      <PageHeader
        className="print-report-page-header"
        eyebrow="Uložený report"
        title={
          <>
            Report <span className="text-primary">{data.name}</span>
          </>
        }
      />
      <div className="print-report-content animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out delay-100 fill-mode-both">
        <SavedReportDetails report={data} data={data.snapshots} />
      </div>
    </div>
  );
}
