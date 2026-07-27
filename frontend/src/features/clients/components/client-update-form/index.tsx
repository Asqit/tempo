import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { $api } from "@/lib/api";

type ClientUpdateFormProps = {
  id: number;
  initialName: string;
  onUpdated?: (nextName: string) => void;
};

export function ClientUpdateForm({
  id,
  initialName,
  onUpdated,
}: ClientUpdateFormProps) {
  const [name, setName] = useState(initialName);
  const { mutateAsync, isPending } = $api.useMutation(
    "put",
    "/api/v1/clients/{id}",
  );

  useEffect(() => {
    setName(initialName);
  }, [initialName]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error("Nazev klienta je povinny");
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

      onUpdated?.(trimmedName);
      toast.success("Klient byl aktualizovan");
    } catch {
      toast.error("Aktualizace klienta se nezdarila");
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
      <Button type="submit" variant="outline" disabled={isPending}>
        {isPending ? "Ukladam..." : "Ulozit zmeny"}
      </Button>
    </form>
  );
}
