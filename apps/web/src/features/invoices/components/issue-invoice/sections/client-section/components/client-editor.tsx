import type { components } from "@tempo/api-types";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { Button } from "@tempo/ui/components/button";
import { Checkbox } from "@tempo/ui/components/checkbox";
import { Input } from "@tempo/ui/components/input";
import { $api, getWorkspaceHeader } from "@/lib/api";
import {
  clientPayload,
  type ClientFormValues,
} from "@/features/clients/components/client-types";
import { emptyClientFormValues } from "@/features/clients/components/client-form-fields";

export type ClientEditorValues = Partial<ClientFormValues>;

type ClientEditorProps = {
  clientId?: number;
  initialValues?: ClientEditorValues;
  onSaved: (client: components["schemas"]["ClientRead"]) => void;
  onCancel: () => void;
};

type TextFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

function TextField({
  label,
  value,
  onChange,
  placeholder,
  className,
}: TextFieldProps) {
  return (
    <label className={`grid gap-1.5 ${className ?? ""}`}>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}

function toValues(initialValues?: ClientEditorValues): ClientFormValues {
  const defaults = emptyClientFormValues();
  return {
    ...defaults,
    ...initialValues,
    name: initialValues?.name ?? defaults.name,
    street: initialValues?.street ?? defaults.street,
    city: initialValues?.city ?? defaults.city,
    postal_code: initialValues?.postal_code ?? defaults.postal_code,
    country: initialValues?.country ?? defaults.country,
    ico: initialValues?.ico ?? defaults.ico,
    dic: initialValues?.dic ?? defaults.dic,
    bank_account: initialValues?.bank_account ?? defaults.bank_account,
    iban: initialValues?.iban ?? defaults.iban,
    hourly_rate: initialValues?.hourly_rate ?? defaults.hourly_rate,
    currency: initialValues?.currency ?? defaults.currency,
    discount_percentage:
      initialValues?.discount_percentage ?? defaults.discount_percentage,
  };
}

export function ClientEditor({
  clientId,
  initialValues,
  onSaved,
  onCancel,
}: ClientEditorProps) {
  const [values, setValues] = useState(() => toValues(initialValues));
  const workspaceHeader = getWorkspaceHeader();
  const { mutateAsync: createClient, isPending: isCreating } = $api.useMutation(
    "post",
    "/api/v1/clients/",
  );
  const { mutateAsync: updateClient, isPending: isUpdating } = $api.useMutation(
    "put",
    "/api/v1/clients/{id}",
  );
  const isPending = isCreating || isUpdating;

  const setValue = <Key extends keyof ClientFormValues>(
    key: Key,
    value: ClientFormValues[Key],
  ) => setValues((current) => ({ ...current, [key]: value }));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (values.name.trim().length < 3) {
      toast.error("Název klienta musí mít alespoň 3 znaky.");
      return;
    }
    if (!workspaceHeader) {
      toast.error("Vyber workspace.");
      return;
    }

    try {
      const body = clientPayload(values);
      const savedClient = clientId
        ? await updateClient({
            params: { path: { id: clientId }, header: workspaceHeader },
            body,
          })
        : await createClient({
            params: { header: workspaceHeader },
            body,
          });

      toast.success(
        clientId ? "Údaje klienta byly aktualizovány." : "Klient byl vytvořen.",
      );
      onSaved(savedClient);
    } catch {
      toast.error(
        clientId
          ? "Aktualizace klienta se nezdařila."
          : "Vytvoření klienta se nezdařilo.",
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <div className="grid gap-3 sm:grid-cols-[1fr_8rem_8rem]">
        <TextField
          label="Název klienta"
          value={values.name}
          onChange={(value) => setValue("name", value)}
          placeholder="Acme s.r.o."
        />
        <TextField
          label="IČO"
          value={values.ico}
          onChange={(value) => setValue("ico", value)}
          placeholder="12345678"
        />
        <TextField
          label="DIČ"
          value={values.dic}
          onChange={(value) => setValue("dic", value)}
          placeholder="CZ12345678"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_7rem]">
        <TextField
          label="Ulice a číslo"
          value={values.street}
          onChange={(value) => setValue("street", value)}
          placeholder="Na Příkopě 12"
        />
        <TextField
          label="Město"
          value={values.city}
          onChange={(value) => setValue("city", value)}
          placeholder="Praha"
        />
        <TextField
          label="PSČ"
          value={values.postal_code}
          onChange={(value) => setValue("postal_code", value)}
          placeholder="110 00"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-[8rem_1fr_8rem]">
        <TextField
          label="Země"
          value={values.country}
          onChange={(value) => setValue("country", value.toUpperCase())}
          placeholder="CZ"
        />
        <TextField
          label="Bankovní účet"
          value={values.bank_account}
          onChange={(value) => setValue("bank_account", value)}
          placeholder="19-2000145399/0800"
        />
        <TextField
          label="Měna"
          value={values.currency}
          onChange={(value) => setValue("currency", value.toUpperCase())}
          placeholder="CZK"
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <Checkbox
          checked={values.vat_payer}
          onCheckedChange={(checked) => setValue("vat_payer", checked === true)}
        />
        Klient je plátce DPH
      </label>

      <div className="flex items-center justify-end gap-2 border-t border-border/70 pt-4">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={isPending}
        >
          Zrušit
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending
            ? "Ukládám..."
            : clientId
              ? "Uložit změny"
              : "Vytvořit klienta"}
        </Button>
      </div>
    </form>
  );
}
