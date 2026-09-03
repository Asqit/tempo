import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@tempo/ui/components/button";
import { $api, getWorkspaceHeader } from "@/lib/api";
import type { components } from "@tempo/api-types";
import {
  ClientFormFields,
  emptyClientFormValues,
  type ClientFormValues,
} from "../client-form-fields";
import { clientPayload } from "../client-types";

type ClientCreateFormProps = {
  onCreated?: (client: components["schemas"]["ClientRead"]) => void;
};

export function ClientCreateForm({ onCreated }: ClientCreateFormProps) {
  const [values, setValues] = useState<ClientFormValues>(emptyClientFormValues);
  const workspaceHeader = getWorkspaceHeader();
  const { mutateAsync, isPending } = $api.useMutation(
    "post",
    "/api/v1/clients/",
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!values.name.trim()) {
      toast.error("Název klienta je povinný.");
      return;
    }
    if (!workspaceHeader) {
      toast.error("Vyber workspace.");
      return;
    }

    try {
      const createdClient = await mutateAsync({
        params: { header: workspaceHeader },
        body: clientPayload(values),
      });
      setValues(emptyClientFormValues());
      onCreated?.(createdClient);
      toast.success("Klient byl vytvořen.");
    } catch {
      toast.error("Vytvoření klienta se nezdařilo.");
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
          {isPending ? "Vytvářím..." : "Vytvořit klienta"}
        </Button>
      </div>
    </form>
  );
}
