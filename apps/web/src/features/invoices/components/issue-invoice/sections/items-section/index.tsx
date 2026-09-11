import type { CreateInvoice } from "../../types";
import { useEffect } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { FileText, Plus, Trash2 } from "lucide-react";

import { Button } from "@tempo/ui/components/button";
import { Input } from "@tempo/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@tempo/ui/components/select";
import { formatMoney } from "@/lib/money";
import { $api, getWorkspaceHeader } from "@/lib/api";

function emptyItem(hourlyRate?: number | string | null, vatRate = "21") {
  return {
    name: "",
    unit_price: hourlyRate ?? "0",
    amount: "1",
    vat_rate: vatRate,
  };
}

function numberValue(value: number | string | undefined) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function ItemsSection() {
  const { control, register, setValue } = useFormContext<CreateInvoice>();
  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const clientId = useWatch({ control, name: "client_id" });
  const items = useWatch({ control, name: "items" }) ?? [];
  const workspaceHeader = getWorkspaceHeader();
  const { data: client } = $api.useQuery(
    "get",
    "/api/v1/clients/{id}",
    {
      params: {
        path: { id: clientId },
        header: workspaceHeader ?? { "X-Workspace-Id": 0 },
      },
    },
    { enabled: Boolean(workspaceHeader && clientId) },
  );

  useEffect(() => {
    if (fields.length === 0) {
      append(emptyItem(client?.hourly_rate, client?.vat_payer ? "21" : "0"));
      return;
    }

    if (!client) return;

    fields.forEach((_, index) => {
      const item = items[index];
      if (!item || item.name.trim() || numberValue(item.unit_price) !== 0) {
        return;
      }

      const unitPrice = client.hourly_rate ?? "0";
      const vatRate = client.vat_payer ? "21" : "0";

      if (String(item.unit_price ?? "0") !== String(unitPrice)) {
        setValue(`items.${index}.unit_price`, unitPrice, {
          shouldDirty: false,
        });
      }
      if (String(item.vat_rate ?? "21") !== vatRate) {
        setValue(`items.${index}.vat_rate`, vatRate, {
          shouldDirty: false,
        });
      }
    });
  }, [append, client, fields, items, setValue]);

  const subtotal = items.reduce(
    (total, item) =>
      total + numberValue(item.unit_price) * numberValue(item.amount),
    0,
  );
  const vat = items.reduce((total, item) => {
    const lineTotal = numberValue(item.unit_price) * numberValue(item.amount);
    return total + lineTotal * (numberValue(item.vat_rate) / 100);
  }, 0);
  const currency = client?.currency ?? "CZK";

  return (
    <section className="flex flex-col gap-4 rounded-xl border border-border/70 p-4 sm:p-5">
      <header className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <FileText className="size-4" />
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Co jste dodali
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight">
            Rozpis práce
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Přidejte položky, které se mají objevit na faktuře.
          </p>
        </div>
      </header>

      <div className="hidden grid-cols-[minmax(0,1fr)_7rem_8rem_7rem_7rem_2rem] gap-2 px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground md:grid">
        <span>Položka</span>
        <span>Množství</span>
        <span>Cena / hod.</span>
        <span>DPH</span>
        <span className="text-right">Celkem</span>
        <span />
      </div>

      <div className="grid gap-2">
        {fields.map((field, index) => {
          const item = items[index];
          const lineTotal =
            numberValue(item?.unit_price) * numberValue(item?.amount);

          return (
            <div
              key={field.id}
              className="grid gap-2 rounded-lg border border-border/70 bg-muted/15 p-2 md:grid-cols-[minmax(0,1fr)_7rem_8rem_7rem_7rem_2rem] md:items-center md:border-0 md:bg-transparent md:p-0"
            >
              <Input
                {...register(`items.${index}.name`)}
                placeholder="Popis práce nebo služby"
                aria-label="Popis položky"
                className="h-9"
              />
              <Input
                {...register(`items.${index}.amount`)}
                type="number"
                min="0"
                step="0.01"
                aria-label="Množství"
                className="h-9"
              />
              <Input
                {...register(`items.${index}.unit_price`)}
                type="number"
                min="0"
                step="0.01"
                aria-label="Cena za jednotku"
                className="h-9"
              />
              <Select
                value={String(item?.vat_rate ?? 21)}
                onValueChange={(value) =>
                  setValue(`items.${index}.vat_rate`, value, {
                    shouldDirty: true,
                  })
                }
              >
                <SelectTrigger className="h-9 w-full" aria-label="Sazba DPH">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0 %</SelectItem>
                  <SelectItem value="12">12 %</SelectItem>
                  <SelectItem value="21">21 %</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex h-9 items-center justify-end px-2 text-sm font-semibold tabular-nums">
                {formatMoney(lineTotal)}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-9 text-muted-foreground hover:text-destructive"
                onClick={() => remove(index)}
                disabled={fields.length === 1}
                aria-label="Odstranit položku"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          );
        })}
      </div>

      <Button
        type="button"
        variant="outline"
        className="h-9 w-fit rounded-md px-3"
        onClick={() =>
          append(emptyItem(client?.hourly_rate, client?.vat_payer ? "21" : "0"))
        }
      >
        <Plus data-icon="inline-start" />
        Nový řádek
      </Button>

      <div className="flex justify-end border-t border-border/70 pt-4">
        <dl className="grid w-full max-w-xs grid-cols-[1fr_auto] gap-x-8 gap-y-1 text-sm">
          <dt className="text-muted-foreground">Základ</dt>
          <dd className="text-right font-medium tabular-nums">
            {formatMoney(subtotal, currency)}
          </dd>
          <dt className="text-muted-foreground">DPH</dt>
          <dd className="text-right font-medium tabular-nums">
            {formatMoney(vat, currency)}
          </dd>
          <dt className="mt-2 text-base font-semibold">Celkem k úhradě</dt>
          <dd className="mt-2 text-right text-xl font-bold text-primary tabular-nums">
            {formatMoney(subtotal + vat, currency)}
          </dd>
        </dl>
      </div>
    </section>
  );
}
