import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { $api } from "@/lib/api";
import type { components } from "@/lib/api.d";

type ClientCreateFormProps = {
  onCreated?: (client: components["schemas"]["ClientRead"]) => void;
};

export function ClientCreateForm({ onCreated }: ClientCreateFormProps) {
  const [name, setName] = useState("");
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
      const createdClient = await mutateAsync({
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
    <form className="flex items-center gap-2" onSubmit={handleSubmit}>
      <Input
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="Nazev klienta"
        disabled={isPending}
      />
      <Button type="submit" disabled={isPending}>
        {isPending ? "Vytvarim..." : "Vytvorit klienta"}
      </Button>
    </form>
  );
}
