import type { CreateInvoice } from "../../types";
import { useFormContext, useWatch } from "react-hook-form";
import { Button } from "@tempo/ui/components/button";
import {
  ClientEditor,
  type ClientEditorValues,
} from "./components/client-editor";
import {
  Building2,
  Check,
  ChevronsUpDown,
  MapPin,
  Search,
  UserRound,
  X,
} from "lucide-react";
import { $api, getWorkspaceHeader } from "@/lib/api";
import { useState } from "react";
import { useDebounceCallback } from "usehooks-ts";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@tempo/ui/components/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@tempo/ui/components/popover";

export function ClientSection() {
  const { control, setValue } = useFormContext<CreateInvoice>();
  const clientId = useWatch({ control, name: "client_id" });
  const [selectedClient, setSelectedClient] = useState<{
    id: number;
    name: string;
    ico?: string | null;
  } | null>(null);
  const [clientEditor, setClientEditor] = useState<{
    clientId?: number;
    initialValues?: ClientEditorValues;
  } | null>(null);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const dSetQuery = useDebounceCallback(setQuery, 500);
  const workspaceHeader = getWorkspaceHeader();
  const { data, isLoading } = $api.useQuery("get", "/api/v1/clients/search", {
    params: {
      query: {
        query: query,
      },
      header: workspaceHeader ?? { "X-Workspace-Id": 0 },
    },
    enabled: Boolean(workspaceHeader && query.trim()),
  });
  const { data: clientDetails } = $api.useQuery(
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

  const clientResults =
    data?.filter((client) => client.source === "client") ?? [];
  const registryResults =
    data?.filter((client) => client.source === "registry") ?? [];

  const selectClient = (client: {
    id: number;
    name: string;
    ico?: string | null;
  }) => {
    setValue("client_id", client.id, { shouldValidate: true });
    setSelectedClient(client);
    setClientEditor(null);
    setSearchOpen(false);
  };

  const selectRegistryClient = (client: {
    id: number;
    name: string;
    ico?: string | null;
  }) => {
    setClientEditor({
      initialValues: {
        name: client.name,
        ico: client.ico ?? "",
        is_company: true,
      },
    });
    setSearchOpen(false);
  };

  const clearClient = () => {
    setValue("client_id", 0, { shouldValidate: true });
    setSelectedClient(null);
    setClientEditor(null);
  };

  const selectedName = clientDetails?.name ?? selectedClient?.name;
  const selectedIco = clientDetails?.ico ?? selectedClient?.ico;
  const selectedAddress = [
    clientDetails?.street,
    clientDetails?.city,
    clientDetails?.postal_code,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <section className="flex flex-col gap-4 rounded-xl border border-border/70 p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <UserRound className="size-5" />
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Kdo vám platí
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight">
            Odběratel
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Vyberte existujícího klienta, nebo ho najděte v registru firem.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Popover open={searchOpen} onOpenChange={setSearchOpen}>
          <PopoverTrigger
            render={
              <Button
                type="button"
                role="combobox"
                aria-expanded={searchOpen}
                variant="outline"
                className="h-10 min-w-0 flex-1 justify-between rounded-md bg-muted/30 px-3 font-normal"
              />
            }
          >
            <span className="flex min-w-0 items-center gap-3">
              <Search className="size-4 shrink-0 text-muted-foreground" />
              <span className="truncate">
                {selectedName ?? "Hledat klienta podle názvu nebo IČO"}
              </span>
            </span>
            {selectedName ? (
              <span
                role="button"
                tabIndex={0}
                aria-label="Zrušit výběr klienta"
                className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={(event) => {
                  event.stopPropagation();
                  clearClient();
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") clearClient();
                }}
              >
                <X className="size-4" />
              </span>
            ) : (
              <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
            )}
          </PopoverTrigger>

          <PopoverContent
            className="w-[min(32rem,calc(100vw-2rem))] p-0"
            align="start"
          >
            <Command shouldFilter={false}>
              <CommandInput
                placeholder="Hledat podle názvu nebo IČO..."
                onValueChange={dSetQuery}
              />
              <CommandList>
                <CommandEmpty>
                  {isLoading
                    ? "Hledám klienty..."
                    : query.trim()
                      ? "Žádný klient nenalezen."
                      : "Začni psát název nebo IČO."}
                </CommandEmpty>

                {clientResults.length > 0 ? (
                  <CommandGroup heading="Moji klienti">
                    {clientResults.map((client) => (
                      <CommandItem
                        key={`${client.source}-${client.id}`}
                        value={client.name}
                        onSelect={() => selectClient(client)}
                      >
                        <Check
                          className={`mr-2 size-4 ${client.id === clientId ? "opacity-100" : "opacity-0"}`}
                        />
                        <span className="min-w-0 flex-1 truncate">
                          {client.name}
                        </span>
                        {client.ico ? (
                          <span className="text-xs text-muted-foreground">
                            {client.ico}
                          </span>
                        ) : null}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ) : null}

                {registryResults.length > 0 ? (
                  <CommandGroup heading="Výsledky z justice.cz">
                    {registryResults.map((client) => (
                      <CommandItem
                        key={`${client.source}-${client.id}`}
                        value={client.name}
                        onSelect={() => selectRegistryClient(client)}
                      >
                        <Building2 className="mr-2 size-4 shrink-0" />
                        <span className="min-w-0 flex-1 truncate">
                          {client.name}
                        </span>
                        {client.ico ? (
                          <span className="text-xs text-muted-foreground">
                            {client.ico}
                          </span>
                        ) : null}
                        <span className="ml-2 text-[10px] text-primary">
                          Přidat
                        </span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ) : null}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <Button
          type="button"
          variant="default"
          className="h-10 shrink-0 rounded-md px-3"
          onClick={() => setClientEditor({})}
        >
          Nový klient
        </Button>
      </div>

      {clientEditor ? (
        <div className="rounded-lg border border-primary/30 bg-primary/4 p-4">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">Přidat nového klienta</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Doplňte údaje a uložte firmu do workspace.
              </p>
            </div>
            <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-primary">
              {clientEditor.clientId ? "Úprava údajů" : "Nový záznam"}
            </span>
          </div>
          <ClientEditor
            key={`${clientEditor.clientId ?? "new"}-${clientEditor.initialValues?.name ?? "blank"}`}
            clientId={clientEditor.clientId}
            initialValues={clientEditor.initialValues}
            onSaved={(client) => selectClient(client)}
            onCancel={() => setClientEditor(null)}
          />
        </div>
      ) : null}

      {selectedName ? (
        <div className="grid gap-4 rounded-lg border border-border/70 border-l-2 border-l-primary bg-muted/20 p-4 sm:grid-cols-[1.4fr_1fr_auto] sm:items-center">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Vybraný odběratel
            </p>
            <p className="mt-2 truncate text-sm font-semibold">
              {selectedName}
            </p>
            {selectedAddress ? (
              <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="size-3.5 shrink-0" />
                {selectedAddress}
              </p>
            ) : null}
          </div>
          <div className="grid gap-1 text-sm">
            <span className="text-sm font-semibold">
              IČO {selectedIco ?? "neuvedeno"}
            </span>
            <span className="text-xs text-muted-foreground">
              DIČ {clientDetails?.dic ?? "neuvedeno"}
            </span>
          </div>
          <Button
            type="button"
            variant="ghost"
            className="justify-self-start text-primary sm:justify-self-end"
            onClick={() =>
              setClientEditor({
                clientId: clientId,
                initialValues: clientDetails
                  ? {
                      name: clientDetails.name,
                      is_company: clientDetails.is_company ?? false,
                      street: clientDetails.street ?? "",
                      city: clientDetails.city ?? "",
                      postal_code: clientDetails.postal_code ?? "",
                      country: clientDetails.country ?? "CZ",
                      ico: clientDetails.ico ?? "",
                      dic: clientDetails.dic ?? "",
                      vat_payer: clientDetails.vat_payer ?? false,
                      currency: clientDetails.currency ?? "CZK",
                      hourly_rate: clientDetails.hourly_rate ?? "",
                      discount_percentage:
                        clientDetails.discount_percentage ?? "",
                    }
                  : undefined,
              })
            }
          >
            Upravit údaje
          </Button>
        </div>
      ) : null}
    </section>
  );
}
