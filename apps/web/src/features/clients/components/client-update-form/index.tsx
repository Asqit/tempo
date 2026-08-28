import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { $api, getWorkspaceHeader } from "@/lib/api";

type Client = {
  id: number;
  name: string;
  hourly_rate: number | string | null;
  currency: string | null;
};

type ClientEditFormProps = {
  client: Client;
  onUpdated?: () => void;
};

export function ClientEditForm({ client, onUpdated }: ClientEditFormProps) {
  const [name, setName] = useState(client.name);
  const [hourlyRate, setHourlyRate] = useState(
    client.hourly_rate?.toString() ?? "",
  );
  const [currency, setCurrency] = useState(client.currency ?? "CZK");

  const workspaceHeader = getWorkspaceHeader();

  useEffect(() => {
    setName(client.name);
    setHourlyRate(client.hourly_rate?.toString() ?? "");
    setCurrency(client.currency ?? "CZK");
  }, [client]);

  const { mutateAsync, isPending } = $api.useMutation(
    "put",
    "/api/v1/clients/{id}",
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      toast.error("Název klienta je povinný.");
      return;
    }

    const parsedHourlyRate = hourlyRate
      ? Number(hourlyRate.replace(",", "."))
      : null;

    if (
      parsedHourlyRate !== null &&
      (!Number.isFinite(parsedHourlyRate) || parsedHourlyRate < 0)
    ) {
      toast.error("Hodinová sazba musí být platné nezáporné číslo.");
      return;
    }

    if (!workspaceHeader) {
      toast.error("Není vybrán workspace.");
      return;
    }

    try {
      await mutateAsync({
        params: {
          path: {
            id: client.id,
          },
          header: workspaceHeader,
        },
        body: {
          name: trimmedName,
          hourly_rate: parsedHourlyRate,
          currency: currency.trim().toUpperCase() || null,
        },
      });

      toast.success("Klient byl upraven.");
      onUpdated?.();
    } catch {
      toast.error("Úprava klienta se nezdařila.");
    }
  };

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <div className="grid gap-2">
        <label htmlFor="client-name" className="text-sm font-medium">
          Název klienta
        </label>

        <Input
          id="client-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Např. Acme s.r.o."
          disabled={isPending}
          autoFocus
        />
      </div>

      <div className="grid gap-2">
        <label htmlFor="client-hourly-rate" className="text-sm font-medium">
          Hodinová sazba
        </label>

        <div className="flex gap-2">
          <Input
            id="client-hourly-rate"
            type="number"
            min="0"
            step="0.01"
            value={hourlyRate}
            onChange={(event) => setHourlyRate(event.target.value)}
            placeholder="Např. 1500"
            disabled={isPending}
          />

          <Input
            value={currency}
            onChange={(event) => setCurrency(event.target.value.toUpperCase())}
            placeholder="CZK"
            maxLength={3}
            className="w-20"
            disabled={isPending}
          />
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Ukládám..." : "Uložit změny"}
        </Button>
      </div>
    </form>
  );
}
