import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@tempo/ui/components/button";
import { $api, getWorkspaceHeader } from "@/lib/api";
import {
  ClientFormFields,
  type ClientFormValues,
} from "../client-form-fields";
import { clientPayload, type ClientWithBilling } from "../client-types";

type ClientEditFormProps = {
  client: ClientWithBilling;
  onUpdated?: () => void;
};

function valuesFromClient(client: ClientWithBilling): ClientFormValues {
  return {
    name: client.name,
    is_company: client.is_company ?? false,
    street: client.street ?? "",
    city: client.city ?? "",
    postal_code: client.postal_code ?? "",
    country: client.country ?? "CZ",
    ico: client.ico ?? "",
    dic: client.dic ?? "",
    vat_payer: client.vat_payer ?? false,
    bank_account: client.bank_account ?? "",
    iban: client.iban ?? "",
    hourly_rate: client.hourly_rate?.toString() ?? "",
    currency: client.currency ?? "CZK",
    discount_percentage: client.discount_percentage?.toString() ?? "",
  };
}

export function ClientEditForm({ client, onUpdated }: ClientEditFormProps) {
  const [values, setValues] = useState(() => valuesFromClient(client));
  const workspaceHeader = getWorkspaceHeader();
  const { mutateAsync, isPending } = $api.useMutation(
    "put",
    "/api/v1/clients/{id}",
  );

  useEffect(() => {
    setValues(valuesFromClient(client));
  }, [client]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!values.name.trim()) {
      toast.error("Název klienta je povinný.");
      return;
    }
    if (!workspaceHeader) {
      toast.error("Není vybrán workspace.");
      return;
    }

    try {
      await mutateAsync({
        params: {
          path: { id: client.id },
          header: workspaceHeader,
        },
        body: clientPayload(values),
      });
      toast.success("Klient byl upraven.");
      onUpdated?.();
    } catch {
      toast.error("Úprava klienta se nezdařila.");
    }
  };

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
      <ClientFormFields
        values={values}
        setValues={setValues}
        disabled={isPending}
      />
      <div className="flex justify-end border-t border-border/70 pt-4">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Ukládám..." : "Uložit změny"}
        </Button>
      </div>
    </form>
  );
}
