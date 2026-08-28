import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { $api, getWorkspaceHeader } from "@/lib/api";
import type { components } from "@/lib/api.d";

type ClientCreateFormProps = {
  onCreated?: (client: components["schemas"]["ClientRead"]) => void;
};

export function ClientCreateForm({ onCreated }: ClientCreateFormProps) {
  const [name, setName] = useState("");
  const workspaceHeader = getWorkspaceHeader();
  const { mutateAsync, isPending } = $api.useMutation(
    "post",
    "/api/v1/clients/",
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error("Nazev klienta je povinny");
      return;
    }

    try {
      if (!workspaceHeader) {
        toast.error("Vyber workspace");
        return;
      }

      const createdClient = await mutateAsync({
        params: {
          header: workspaceHeader,
        },
        body: {
          name: trimmedName,
        },
      });

      setName("");
      onCreated?.(createdClient);
      toast.success("Klient byl vytvoren");
    } catch {
      toast.error("Vytvoreni klienta se nezdarilo");
    }
  };

  return (
    <form
      className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center"
      onSubmit={handleSubmit}
    >
      <Input
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="Nazev klienta"
        disabled={isPending}
        className="sm:flex-1"
      />
      <Button type="submit" disabled={isPending}>
        {isPending ? "Vytvarim..." : "Vytvorit klienta"}
      </Button>
    </form>
  );
}
