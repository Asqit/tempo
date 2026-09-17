import type { CreateInvoice } from "./types";
import { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ClientSection } from "./sections/client-section";
import { ItemsSection } from "./sections/items-section";
import { InvoiceDetailsSection } from "./sections/invoice-details-section";
import { $api, getWorkspaceHeader } from "@/lib/api";
import { Button } from "@tempo/ui/components/button";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import * as z from "zod";

interface Props {
  invoiceId?: number;
  defaultValues?: Partial<CreateInvoice>;
}

const invoiceItem = z.object({
  name: z.string(),
  unit_price: z.union([z.number(), z.string()]),
  amount: z.union([z.number(), z.string()]),
  vat_rate: z.union([z.number(), z.string()]),
});

const formSchema = z.object({
  client_id: z.number(),
  number_series_id: z.number().optional(),
  date_issue: z.string(),
  date_taxing: z.string(),
  date_maturity: z.string(),
  items: z.array(invoiceItem),
}) satisfies z.ZodType<CreateInvoice>;

export function IssueInvoice({ invoiceId, defaultValues }: Props) {
  const navigate = useNavigate();
  const workspaceHeader = getWorkspaceHeader();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      client_id: defaultValues?.client_id ?? 0,
      number_series_id: defaultValues?.number_series_id ?? undefined,
      date_issue: defaultValues?.date_issue ?? "",
      date_taxing: defaultValues?.date_taxing ?? "",
      date_maturity: defaultValues?.date_maturity ?? "",
      items: defaultValues?.items ?? [],
    },
  });

  const { data: invoice, isLoading: isInvoiceLoading } = $api.useQuery(
    "get",
    "/api/v1/invoices/{invoice_id}",
    {
      params: {
        path: { invoice_id: invoiceId ?? 0 },
        header: workspaceHeader ?? { "X-Workspace-Id": 0 },
      },
    },
    { enabled: Boolean(invoiceId && workspaceHeader) },
  );
  const { mutateAsync: createInvoice, isPending: isCreating } =
    $api.useMutation("post", "/api/v1/invoices");
  const { mutateAsync: updateInvoice, isPending: isUpdating } =
    $api.useMutation("put", "/api/v1/invoices/{invoice_id}");

  useEffect(() => {
    if (!invoice) return;

    form.reset({
      client_id: invoice.client_id,
      number_series_id: undefined,
      date_issue: invoice.date_issue,
      date_taxing: invoice.date_taxing,
      date_maturity: invoice.date_maturity,
      items: invoice.items,
    });
  }, [form, invoice]);

  const isPending = isCreating || isUpdating;
  const isUpdate = Boolean(invoiceId);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!workspaceHeader) {
      toast.error("Nejdřív vyberte workspace.");
      return;
    }

    try {
      if (invoiceId) {
        await updateInvoice({
          params: { path: { invoice_id: invoiceId }, header: workspaceHeader },
          body: data,
        });
      } else {
        await createInvoice({
          params: { header: workspaceHeader },
          body: data,
        });
      }

      toast.success(
        isUpdate ? "Faktura byla aktualizována." : "Faktura byla vytvořena.",
      );
      await navigate({ to: "/app/invoices" });
    } catch {
      toast.error(
        isUpdate
          ? "Aktualizace faktury se nezdařila."
          : "Vytvoření faktury se nezdařilo.",
      );
    }
  };

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mx-auto flex w-full flex-col gap-5 px-4 py-6 sm:px-8 sm:py-8"
      >
        <header className="flex flex-wrap items-end justify-between gap-5 pb-2">
          <div className="min-w-0">
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <h1 className="font-heading text-4xl font-black tracking-[-0.04em] sm:text-5xl">
                {isUpdate
                  ? (invoice?.document_number ?? "Koncept")
                  : "Nová faktura"}
              </h1>
              <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-semibold text-muted-foreground">
                Koncept
              </span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {isUpdate
                ? "Upravujete rozpracovaný doklad."
                : "Vyplňte údaje a připravte doklad k vystavení."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="submit"
              disabled={isPending || isInvoiceLoading}
              size={"lg"}
            >
              <Save data-icon="inline-start" />
              {isPending
                ? "Ukládám..."
                : isUpdate
                  ? "Uložit fakturu"
                  : "Vystavit fakturu"}
            </Button>
          </div>
        </header>
        <InvoiceDetailsSection />
        <ClientSection />
        <ItemsSection />
      </form>
    </FormProvider>
  );
}
