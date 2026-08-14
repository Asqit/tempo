import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { $api, getWorkspaceHeader } from "@/lib/api";
import type { components } from "@/lib/api.d";

type ClientUpdateFormProps = {
  id: number;
  initialName: string;
  onUpdated?: (client: components["schemas"]["ClientRead"]) => void;
};

export function ClientUpdateForm({
  id,
  initialName,
  onUpdated,
}: ClientUpdateFormProps) {
  const [name, setName] = useState(initialName);
  const workspaceHeader = getWorkspaceHeader();
  const { mutateAsync, isPending } = $api.useMutation(
    "put",
    "/api/v1/clients/{id}",
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      toast.error("Nazev klienta je povinny");
      return;
    }

    if (!workspaceHeader) {
      toast.error("Vyber workspace");
      return;
    }

    try {
      const updatedClient = await mutateAsync({
        params: {
          path: {
            id,
          },
          header: workspaceHeader,
        },
        body: {
          name: trimmedName,
        },
      });

      onUpdated?.(updatedClient);
      toast.success("Klient byl aktualizovan");
    } catch {
      toast.error("Aktualizace klienta se nezdarila");
    }
  };

  return (
    <form className="grid gap-3" onSubmit={handleSubmit}>
      <Input
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="Nazev klienta"
        disabled={isPending}
      />
      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Ukladam..." : "Ulozit zmeny"}
        </Button>
      </div>
    </form>
  );
}
