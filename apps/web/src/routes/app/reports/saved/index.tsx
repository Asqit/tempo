import { ReportsList } from "@/features/reports/components/reports-list";
import { useWorkspaceStore } from "@/features/workspaces/store";
import { $api } from "@/lib/api";
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/share/page-header";

export const Route = createFileRoute("/app/reports/saved/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { activeWorkspace } = useWorkspaceStore();
  const { data } = $api.useQuery("get", "/api/v1/reports/", {
    params: {
      header: {
        "X-Workspace-Id": activeWorkspace!,
      },
    },
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300 ease-out fill-mode-both">
      <PageHeader eyebrow="Správa" title="Uložené reporty" />
      {data ? (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out delay-100 fill-mode-both">
          <ReportsList reports={data.items} />
        </div>
      ) : null}
    </div>
  );
}
