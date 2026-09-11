import type { CreateInvoice } from "../../types";
import { useFormContext, useWatch } from "react-hook-form";
import { CalendarDays, Info } from "lucide-react";
import { useState } from "react";

import { Input } from "@tempo/ui/components/input";
import { $api, getWorkspaceHeader } from "@/lib/api";

function toInputDate(value: string | undefined) {
  return value ? value.slice(0, 10) : "";
}

function toApiDate(value: string) {
  return value ? `${value}T00:00:00` : "";
}

export function InvoiceDetailsSection() {
  const { control, setValue } = useFormContext<CreateInvoice>();
  const dateIssue = useWatch({ control, name: "date_issue" });
  const dateTaxing = useWatch({ control, name: "date_taxing" });
  const dateMaturity = useWatch({ control, name: "date_maturity" });
  const [previewDate] = useState(() => new Date().toISOString());
  const workspaceHeader = getWorkspaceHeader();
  const { data: numberPreview, isLoading: isPreviewLoading } = $api.useQuery(
    "get",
    "/api/v1/invoices/number-series/next",
    {
      params: {
        query: { issued_date: dateIssue || previewDate },
        header: workspaceHeader ?? { "X-Workspace-Id": 0 },
      },
    },
    { enabled: Boolean(workspaceHeader) },
  );

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-card/20 p-4 shadow-sm sm:p-5">
      <header className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <CalendarDays className="size-4" />
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Nastavení dokladu
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight">
            Údaje faktury
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Termíny, způsob úhrady a číslo dokladu.
          </p>
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="grid gap-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            Datum vystavení
          </span>
          <Input
            type="date"
            value={toInputDate(dateIssue)}
            onChange={(event) =>
              setValue("date_issue", toApiDate(event.target.value), {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
            className="h-9"
          />
        </label>

        <label className="grid gap-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            Datum zdanitelného plnění
          </span>
          <Input
            type="date"
            value={toInputDate(dateTaxing)}
            onChange={(event) =>
              setValue("date_taxing", toApiDate(event.target.value), {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
            className="h-9"
          />
        </label>

        <label className="grid gap-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            Datum splatnosti
          </span>
          <Input
            type="date"
            value={toInputDate(dateMaturity)}
            onChange={(event) =>
              setValue("date_maturity", toApiDate(event.target.value), {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
            className="h-9"
          />
        </label>
      </div>

      <div className="flex items-center gap-2 rounded-md border border-border/70 bg-muted/20 px-3 py-2 text-xs">
        <Info className="size-3.5 shrink-0 text-primary" />
        <span className="text-muted-foreground">Číslo faktury:</span>
        <span className="font-semibold">
          {isPreviewLoading
            ? "Načítám..."
            : (numberPreview?.document_number ?? "preview není dostupné")}
        </span>
        {numberPreview?.document_number ? (
          <span className="ml-auto text-muted-foreground">
            orientační náhled · přidělí se při uložení
          </span>
        ) : null}
      </div>
    </section>
  );
}
