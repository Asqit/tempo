import { Button } from "@/components/ui/button";
import { ReportDetail } from "@/features/reports/components/report-details/";
import { ReportsToolbar } from "@/features/reports/components/reports-toolbar";
import { useWorkspaceStore } from "@/features/workspaces/store";
import { PageHeader } from "@/components/share/page-header";
import { $api } from "@/lib/api";
import { createFileRoute } from "@tanstack/react-router";
import { Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/reports/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { activeWorkspace } = useWorkspaceStore();
  const [periodStart, setPeriodStart] = useState<string>(
    new Date().toISOString(),
  );
  const [periodEnd, setPeriodEnd] = useState<string>(new Date().toISOString());
  const [clientId, setClientId] = useState<number | null>(null);
  const [projectId, setProjectId] = useState<number | null>(null);
  const [billable, setBillable] = useState<boolean | null>(null);
  const { data, isLoading } = $api.useQuery("get", "/api/v1/reports/live", {
    params: {
      query: {
        period_start: periodStart,
        period_end: periodEnd,
        client_id: clientId,
        project_id: projectId,
        billable,
      },
      header: {
        "X-Workspace-Id": activeWorkspace!,
      },
    },
  });

  const { mutateAsync } = $api.useMutation("post", "/api/v1/reports/");
  const handleSave = async () => {
    try {
      await mutateAsync({
        params: {
          header: {
            "X-Workspace-Id": activeWorkspace!,
          },
        },
        body: {
          name: "test",
          description: "test",
          period_start: periodStart,
          period_end: periodEnd,
          client_id: clientId,
          project_id: projectId,
          billable: billable,
        },
      });
    } catch {
      toast.error("error");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 ease-out fill-mode-both">
      <PageHeader
        eyebrow="Správa"
        title="Reporty"
        actions={
          <Button onClick={() => handleSave()}>
            <Save /> Uložit
          </Button>
        }
      />
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out delay-100 fill-mode-both">
        <ReportsToolbar
          setStartTime={setPeriodStart}
          setEndTime={setPeriodEnd}
          setClientId={setClientId}
          setProjectId={setProjectId}
          setBillable={setBillable}
        />
        {isLoading ? null : <ReportDetail data={data} />}
      </div>
    </div>
  );
}
