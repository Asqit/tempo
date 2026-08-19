import { Separator } from "@/components/ui/separator";
import { ReportsList } from "@/features/reports/components/reports-list";
import { useWorkspaceStore } from "@/features/workspaces/store";
import { $api } from "@/lib/api";
import { createFileRoute } from "@tanstack/react-router";

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
    <div className="space-y-6">
      <header>
        <h2 className="text-muted-foreground text-xs uppercase">Správa</h2>
        <h1 className="text-3xl font-black uppercase">ULOŽENÉ REPORTY</h1>
      </header>
      <Separator />
      {data ? <ReportsList reports={data.items} /> : null}
    </div>
  );
}
