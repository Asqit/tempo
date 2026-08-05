import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { $api } from "@/lib/api";
import { ClientPicker } from "@/features/clients/components/client-picker";

type ProjectUpdateFormProps = {
  id: number;
  initialName: string;
  initialClientId: number | null;
  onUpdated?: (nextName: string, nextClientId: number) => void;
};

export function ProjectUpdateForm({
  id,
  initialName,
  initialClientId,
  onUpdated,
}: ProjectUpdateFormProps) {
  const [name, setName] = useState(initialName);
  const [clientId, setClientId] = useState<number | null>(initialClientId);
  const { mutateAsync, isPending } = $api.useMutation(
    "put",
    "/api/v1/projects/{id}",
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
        params: {
          path: {
            id,
          },
        },
        body: {
          name: trimmedName,
        },
      });

      onUpdated?.(trimmedName, clientId);
      toast.success("Projekt byl aktualizovan");
    } catch {
      toast.error("Aktualizace projektu se nezdarila");
    }
  };

  return (
    <form
      className="flex flex-col items-stretch gap-3 md:flex-row md:flex-wrap md:items-center"
      onSubmit={handleSubmit}
    >
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
        {isPending ? "Ukladam..." : "Ulozit zmeny"}
      </Button>
    </form>
  );
}
