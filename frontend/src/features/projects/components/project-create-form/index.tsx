import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { $api } from "@/lib/api";
import { ClientPicker } from "@/features/clients/components/client-picker";

type ProjectCreateFormProps = {
  onCreated?: () => void;
};

export function ProjectCreateForm({ onCreated }: ProjectCreateFormProps) {
  const [name, setName] = useState("");
  const [clientId, setClientId] = useState<number | null>(null);
  const { mutateAsync, isPending } = $api.useMutation(
    "post",
    "/api/v1/projects/",
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      toast.error("Nazev projektu je povinny");
      return;
    }

    if (clientId === null) {
      toast.error("Vyber klienta");
      return;
    }

    try {
      await mutateAsync({
        body: {
          name: trimmedName,
          client_id: clientId,
        },
      });

      setName("");
      setClientId(null);
      onCreated?.();
      toast.success("Projekt byl vytvoren");
    } catch {
      toast.error("Vytvoreni projektu se nezdarilo");
    }
  };

  return (
    <form className="flex flex-wrap items-center gap-2" onSubmit={handleSubmit}>
      <Input
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="Nazev projektu"
        disabled={isPending}
        className="min-w-48 flex-1"
      />
      <ClientPicker
        value={clientId}
        onChange={setClientId}
        disabled={isPending}
      />
      <Button type="submit" disabled={isPending}>
        {isPending ? "Vytvarim..." : "Vytvorit projekt"}
      </Button>
    </form>
  );
}
