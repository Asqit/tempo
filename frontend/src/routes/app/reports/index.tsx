import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ReportDetail } from "@/features/reports/components/report-details/";
import { ReportsToolbar } from "@/features/reports/components/reports-toolbar";
import { useWorkspaceStore } from "@/features/workspaces/store";
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
    <div className="space-y-6">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-muted-foreground text-xs uppercase">Správa</h2>
          <h1 className="text-3xl font-black uppercase">Reporty</h1>
        </div>
        <div>
          <Button onClick={() => handleSave()}>
            <Save /> Uložit
          </Button>
        </div>
      </header>
      <Separator />
      <ReportsToolbar
        setStartTime={setPeriodStart}
        setEndTime={setPeriodEnd}
        setClientId={setClientId}
        setProjectId={setProjectId}
        setBillable={setBillable}
      />
      {isLoading ? null : <ReportDetail data={data} />}
    </div>
  );
}
