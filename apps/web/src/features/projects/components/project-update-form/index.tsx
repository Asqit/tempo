import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { $api, getWorkspaceHeader } from "@/lib/api";
import { ClientPicker } from "@/features/clients/components/client-picker";
import { DatePicker } from "@/components/share/date-picker";

function toDateTimeLocalInput(value: string | null): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function fromDateTimeLocalInput(value: string): string | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

type ProjectUpdateFormProps = {
  id: number;
  initialName: string;
  initialClientId: number | null;
  initialStartTime: string | null;
  initialEndTime: string | null;
  onUpdated?: (nextName: string, nextClientId: number) => void;
};

export function ProjectUpdateForm({
  id,
  initialName,
  initialClientId,
  initialStartTime,
  initialEndTime,
  onUpdated,
}: ProjectUpdateFormProps) {
  const [name, setName] = useState(initialName);
  const [clientId, setClientId] = useState<number | null>(initialClientId);
  const [startTime, setStartTime] = useState(
    toDateTimeLocalInput(initialStartTime),
  );
  const [endTime, setEndTime] = useState(toDateTimeLocalInput(initialEndTime));
  const workspaceHeader = getWorkspaceHeader();
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

    if (clientId === null || !workspaceHeader) {
      toast.error("Vyber klienta a workspace");
      return;
    }

    const nextStartTime = startTime ? fromDateTimeLocalInput(startTime) : null;
    const nextEndTime = endTime ? fromDateTimeLocalInput(endTime) : null;

    if (startTime && !nextStartTime) {
      toast.error("Začátek musí být platný datum a čas.");
      return;
    }

    if (endTime && !nextEndTime) {
      toast.error("Konec musí být platný datum a čas.");
      return;
    }

    try {
      await mutateAsync({
        params: {
          path: {
            id,
          },
          query: {
            client_id: clientId,
          },
          header: workspaceHeader,
        },
        body: {
          name: trimmedName,
          start_time: nextStartTime,
          end_time: nextEndTime,
        },
      });

      onUpdated?.(trimmedName, clientId);
      toast.success("Projekt byl aktualizovan");
    } catch {
      toast.error("Aktualizace projektu se nezdarila");
    }
  };

  return (
    <form className="grid gap-3" onSubmit={handleSubmit}>
      <Input
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="Nazev projektu"
        disabled={isPending}
      />
      <ClientPicker
        value={clientId}
        onChange={setClientId}
        disabled={isPending}
        placeholder="Vyber klienta"
      />
      <DatePicker
        value={new Date(startTime)}
        setValue={(d) => setStartTime(d.toISOString())}
        withTime
      />
      <DatePicker
        value={new Date(endTime)}
        setValue={(d) => setEndTime(d.toISOString())}
        withTime
      />
      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Ukladam..." : "Ulozit zmeny"}
        </Button>
      </div>
    </form>
  );
}
