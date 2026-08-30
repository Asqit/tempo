import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react";
import {
  Building2,
  Landmark,
  MapPin,
  WalletCards,
} from "lucide-react";

import { Checkbox } from "@tempo/ui/components/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "@tempo/ui/components/field";
import { Input } from "@tempo/ui/components/input";
import { $api } from "@/lib/api";

export type ClientFormValues = {
  name: string;
  is_company: boolean;
  street: string;
  city: string;
  postal_code: string;
  country: string;
  ico: string;
  dic: string;
  vat_payer: boolean;
  bank_account: string;
  iban: string;
  hourly_rate: string;
  currency: string;
  discount_percentage: string;
};

export type ClientFormSetState = Dispatch<SetStateAction<ClientFormValues>>;

type Props = {
  values: ClientFormValues;
  setValues: ClientFormSetState;
  disabled?: boolean;
};

function setText(
  setValues: ClientFormSetState,
  key: keyof ClientFormValues,
  value: string,
) {
  setValues((current) => ({ ...current, [key]: value }));
}

type JusticeResult = {
  subjektId: number;
  name: string;
  ico: string;
};

function parseJusticeResults(data: unknown): JusticeResult[] {
  if (!data || typeof data !== "object") {
    return [];
  }
  const payload = data as { data?: unknown };
  if (!Array.isArray(payload.data)) return [];

  return payload.data.flatMap((item: unknown) => {
    if (!item || typeof item !== "object") return [];
    const result = item as {
      subjektId?: unknown;
      nazev?: { value?: unknown };
      ico?: { value?: unknown };
    };

    return typeof result.subjektId === "number" &&
      typeof result.nazev?.value === "string" &&
      typeof result.ico?.value === "string"
      ? [
          {
            subjektId: result.subjektId,
            name: result.nazev.value,
            ico: result.ico.value,
          },
        ]
      : [];
  });
}

function JusticeSearch({
  setValues,
  disabled,
}: Pick<Props, "setValues" | "disabled">) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const timeout = window.setTimeout(
      () => setDebouncedQuery(query.trim()),
      300,
    );
    return () => window.clearTimeout(timeout);
  }, [query]);

  const { data, isFetching } = $api.useQuery(
    "get",
    "/api/v1/clients/justice-search",
    { params: { query: { query: debouncedQuery } } },
    { enabled: debouncedQuery.length >= 2 },
  );
  const results = useMemo(() => parseJusticeResults(data), [data]);
  const showResults = query.trim().length >= 2;

  return (
    <div className="rounded-lg border border-dashed border-primary/40 bg-primary/[0.04] p-3">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold">Najít firmu v rejstříku</p>
          <p className="text-[11px] text-muted-foreground">
            Vyplní název a IČO z justice.cz.
          </p>
        </div>
        {isFetching && (
          <span className="text-[11px] text-muted-foreground">Hledám…</span>
        )}
      </div>
      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Začni psát název nebo IČO…"
        disabled={disabled}
        aria-label="Vyhledat firmu v obchodním rejstříku"
      />
      {showResults && !isFetching && (
        <div className="mt-2 overflow-hidden rounded-lg border border-border/70 bg-background">
          {results.length > 0 ? (
            <div className="max-h-48 overflow-y-auto p-1">
              {results.map((result) => (
                <button
                  key={result.subjektId}
                  type="button"
                  className="flex w-full items-center justify-between gap-3 rounded-md px-2.5 py-2 text-left text-sm transition-colors hover:bg-muted"
                  onClick={() => {
                    setValues((current) => ({
                      ...current,
                      name: result.name,
                      ico: result.ico,
                      is_company: true,
                    }));
                    setQuery("");
                    setDebouncedQuery("");
                  }}
                >
                  <span className="min-w-0 truncate font-medium">
                    {result.name}
                  </span>
                  <span className="shrink-0 font-mono text-xs text-muted-foreground">
                    IČO {result.ico}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <p className="px-3 py-2 text-xs text-muted-foreground">
              Nic jsme nenašli. Údaje můžeš vyplnit ručně.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function Section({
  icon: Icon,
  eyebrow,
  title,
  description,
  children,
}: {
  icon: typeof Building2;
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden rounded-xl border border-border/70 bg-card/70 p-4 sm:p-5">
      <div className="absolute inset-y-0 left-0 w-1 bg-primary/70" />
      <div className="mb-5 flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-4" />
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">
            {eyebrow}
          </p>
          <h3 className="font-heading text-base font-semibold">{title}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function ToggleField({
  id,
  label,
  description,
  checked,
  onChange,
  disabled,
}: {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <Field
      orientation="horizontal"
      className="rounded-lg border border-border/70 bg-background/70 p-3"
    >
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(value) => onChange(value === true)}
        disabled={disabled}
      />
      <FieldContent className="gap-0.5">
        <FieldLabel htmlFor={id}>{label}</FieldLabel>
        <FieldDescription>{description}</FieldDescription>
      </FieldContent>
    </Field>
  );
}

function TextField({
  id,
  label,
  value,
  onChange,
  placeholder,
  disabled,
  inputProps,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  inputProps?: React.ComponentProps<typeof Input>;
}) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        {...inputProps}
      />
    </Field>
  );
}

export function ClientFormFields({ values, setValues, disabled }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <Section
        icon={Building2}
        eyebrow="01 · Identita"
        title="Kdo je klient?"
        description="Základní údaje, podle kterých klienta poznáš."
      >
        <div className="flex flex-col gap-4">
          <JusticeSearch
            setValues={setValues}
            disabled={disabled}
          />
          <TextField
            id="client-name"
            label="Název klienta"
            value={values.name}
            onChange={(value) => setText(setValues, "name", value)}
            placeholder="Např. Acme s.r.o."
            disabled={disabled}
            inputProps={{ maxLength: 255, autoFocus: true }}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <ToggleField
              id="client-is-company"
              label="Firma"
              description="Právnická osoba nebo společnost"
              checked={values.is_company}
              onChange={(value) =>
                setValues((current) => ({ ...current, is_company: value }))
              }
              disabled={disabled}
            />
            <ToggleField
              id="client-vat-payer"
              label="Plátce DPH"
              description="Použít při fakturaci klienta"
              checked={values.vat_payer}
              onChange={(value) =>
                setValues((current) => ({ ...current, vat_payer: value }))
              }
              disabled={disabled}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              id="client-ico"
              label="IČO"
              value={values.ico}
              onChange={(value) => setText(setValues, "ico", value)}
              placeholder="12345678"
              disabled={disabled}
            />
            <TextField
              id="client-dic"
              label="DIČ"
              value={values.dic}
              onChange={(value) => setText(setValues, "dic", value.toUpperCase())}
              placeholder="CZ12345678"
              disabled={disabled}
            />
          </div>
        </div>
      </Section>

      <Section
        icon={MapPin}
        eyebrow="02 · Kontakt"
        title="Kde klienta najdeš?"
        description="Adresa a kontaktní údaje pro doklady."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            id="client-street"
            label="Ulice a číslo"
            value={values.street}
            onChange={(value) => setText(setValues, "street", value)}
            placeholder="Dlouhá 12"
            disabled={disabled}
          />
          <TextField
            id="client-city"
            label="Město"
            value={values.city}
            onChange={(value) => setText(setValues, "city", value)}
            placeholder="Praha"
            disabled={disabled}
          />
          <TextField
            id="client-postal-code"
            label="PSČ"
            value={values.postal_code}
            onChange={(value) => setText(setValues, "postal_code", value)}
            placeholder="110 00"
            disabled={disabled}
          />
          <TextField
            id="client-country"
            label="Země"
            value={values.country}
            onChange={(value) =>
              setText(setValues, "country", value.toUpperCase())
            }
            placeholder="CZ"
            disabled={disabled}
            inputProps={{ maxLength: 2 }}
          />
        </div>
      </Section>

      <Section
        icon={Landmark}
        eyebrow="04 · Fakturace"
        title="Jak účtovat práci?"
        description="Výchozí hodnoty pro nové časové záznamy a faktury."
      >
        <div className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_6rem_minmax(0,1fr)]">
            <TextField
              id="client-hourly-rate"
              label="Hodinová sazba"
              value={values.hourly_rate}
              onChange={(value) => setText(setValues, "hourly_rate", value)}
              placeholder="1 500"
              disabled={disabled}
              inputProps={{ type: "number", min: "0", step: "0.01" }}
            />
            <TextField
              id="client-currency"
              label="Měna"
              value={values.currency}
              onChange={(value) =>
                setText(setValues, "currency", value.toUpperCase())
              }
              disabled={disabled}
              inputProps={{ maxLength: 3 }}
            />
            <TextField
              id="client-discount"
              label="Sleva"
              value={values.discount_percentage}
              onChange={(value) =>
                setText(setValues, "discount_percentage", value)
              }
              placeholder="0"
              disabled={disabled}
              inputProps={{
                type: "number",
                min: "0",
                max: "100",
                step: "0.01",
              }}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              id="client-bank-account"
              label="Bankovní účet"
              value={values.bank_account}
              onChange={(value) => setText(setValues, "bank_account", value)}
              placeholder="19-123456789 / 0800"
              disabled={disabled}
            />
            <TextField
              id="client-iban"
              label="IBAN"
              value={values.iban}
              onChange={(value) =>
                setText(setValues, "iban", value.toUpperCase())
              }
              placeholder="CZ65 0800 0000 1920 0014 5399"
              disabled={disabled}
            />
          </div>
        </div>
      </Section>

      <div className="flex items-center gap-2 px-1 text-xs text-muted-foreground">
        <WalletCards className="size-3.5 text-primary" />
        Nevyplněné údaje můžeš doplnit kdykoli později.
      </div>
    </div>
  );
}

export function emptyClientFormValues(): ClientFormValues {
  return {
    name: "",
    is_company: false,
    street: "",
    city: "",
    postal_code: "",
    country: "CZ",
    ico: "",
    dic: "",
    vat_payer: false,
    bank_account: "",
    iban: "",
    hourly_rate: "",
    currency: "CZK",
    discount_percentage: "",
  };
}
