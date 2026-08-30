import { useState, type ChangeEvent } from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { createFileRoute } from "@tanstack/react-router";

import { Button } from "@tempo/ui/components/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@tempo/ui/components/dialog";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@tempo/ui/components/field";
import { Input } from "@tempo/ui/components/input";
import { Textarea } from "@tempo/ui/components/textarea";
import { PageHeader } from "@/components/share/page-header";
import { ReportDetail } from "@/features/reports/components/report-details/";
import { ReportsToolbar } from "@/features/reports/components/reports-toolbar";
import { useWorkspaceStore } from "@/features/workspaces/store";
import { $api } from "@/lib/api";

export const Route = createFileRoute("/app/reports/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { activeWorkspace } = useWorkspaceStore();
  const [periodStart, setPeriodStart] = useState(new Date().toISOString());
  const [periodEnd, setPeriodEnd] = useState(new Date().toISOString());
  const [clientIds, setClientIds] = useState<Array<number> | null>(null);
  const [projectIds, setProjectIds] = useState<Array<number> | null>(null);
  const [billable, setBillable] = useState<boolean | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

  const { data, isLoading } = $api.useQuery("get", "/api/v1/reports/live", {
    params: {
      query: {
        period_start: periodStart,
        period_end: periodEnd,
        client_ids: clientIds,
        project_ids: projectIds,
        billable,
      },
      header: { "X-Workspace-Id": activeWorkspace! },
    },
  });
  const { mutateAsync, isPending } = $api.useMutation(
    "post",
    "/api/v1/reports/",
  );

  const handleSave = async (event: ChangeEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      await mutateAsync({
        params: {
          header: { "X-Workspace-Id": activeWorkspace! },
        },
        body: {
          name: name.trim(),
          description: description.trim(),
          period_start: periodStart,
          period_end: periodEnd,
          client_ids: clientIds,
          project_ids: projectIds,
          billable,
        },
      });
      setSaveDialogOpen(false);
      toast.success("Report byl uložen.");
    } catch (error) {
      console.error(error);
      toast.error("Report se nepodařilo uložit.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 ease-out fill-mode-both">
      <PageHeader
        eyebrow="Správa"
        title="Reporty"
        actions={
          <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
            <DialogTrigger
              render={
                <Button>
                  <Save /> Uložit report
                </Button>
              }
            />
            <DialogContent className="sm:max-w-lg">
              <form onSubmit={handleSave} className="contents">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Save className="size-4" />
                    </span>
                    Uložit report
                  </DialogTitle>
                  <DialogDescription>
                    Přidejte název a krátký popis, abyste report později snadno
                    našli.
                  </DialogDescription>
                </DialogHeader>

                <FieldGroup className="gap-5">
                  <Field>
                    <FieldLabel htmlFor="report-name">Název reportu</FieldLabel>
                    <FieldContent>
                      <Input
                        id="report-name"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        placeholder="Např. Výkaz za tento týden"
                        className="h-11 px-3 text-base font-medium"
                        autoComplete="off"
                        autoFocus
                        required
                      />
                      <FieldDescription>
                        Povinné. Zvolte krátký a rozpoznatelný název.
                      </FieldDescription>
                    </FieldContent>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="report-description">
                      Popis reportu
                    </FieldLabel>
                    <FieldContent>
                      <Textarea
                        id="report-description"
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        placeholder="Např. Podklady pro pondělní fakturaci klienta"
                        className="min-h-24 resize-none px-3 py-2.5"
                        rows={3}
                      />
                      <FieldDescription>
                        Volitelné. Přidejte kontext, období nebo účel reportu.
                      </FieldDescription>
                    </FieldContent>
                  </Field>
                </FieldGroup>

                <DialogFooter>
                  <DialogClose
                    render={<Button type="button" variant="outline" />}
                  >
                    Zrušit
                  </DialogClose>
                  <Button type="submit" disabled={isPending || !name.trim()}>
                    <Save /> {isPending ? "Ukládám..." : "Uložit report"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out delay-100 fill-mode-both">
        <ReportsToolbar
          setStartTime={setPeriodStart}
          setEndTime={setPeriodEnd}
          setClientIds={setClientIds}
          setProjectIds={setProjectIds}
          setBillable={setBillable}
          clientIds={clientIds ?? undefined}
          projectIds={projectIds ?? undefined}
        />
        {isLoading ? null : <ReportDetail data={data ?? []} />}
      </div>
    </div>
  );
}
