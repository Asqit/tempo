import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ClientPicker } from "@/features/clients/components/client-picker";
import { ProjectPicker } from "@/features/projects/components/project-picker";
import { $api } from "@/lib/api";

type TimeEntryUpdateFormProps = {
  id: number;
  initialDescription: string | null;
  initialProjectId: number | null;
  initialStartTime: string;
  initialEndTime: string | null;
  onUpdated?: () => void;
};

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

function getProjectClientId(data: unknown): number | null {
  if (!data || typeof data !== "object") {
    return null;
  }

  const raw = data as {
    client?: { id?: unknown } | null;
  };

  if (!raw.client || typeof raw.client.id !== "number") {
    return null;
  }

  return raw.client.id;
}

export function TimeEntryUpdateForm({
  id,
  initialDescription,
  initialProjectId,
  initialStartTime,
  initialEndTime,
  onUpdated,
}: TimeEntryUpdateFormProps) {
  const [description, setDescription] = useState(initialDescription ?? "");
  const [projectId, setProjectId] = useState<number | null>(initialProjectId);
  const [clientId, setClientId] = useState<number | null>(null);
  const [startTime, setStartTime] = useState(
    toDateTimeLocalInput(initialStartTime),
  );
  const [endTime, setEndTime] = useState(toDateTimeLocalInput(initialEndTime));

  const { data: projectData } = $api.useQuery("get", "/api/v1/projects/{id}", {
    params: {
      path: {
        id: projectId ?? 0,
      },
    },
    enabled: projectId !== null,
  } as unknown as never);

  const projectClientId = useMemo(
    () => getProjectClientId(projectData),
    [projectData],
  );

  useEffect(() => {
    if (projectId === null) {
      setClientId(null);
      return;
    }

    setClientId(projectClientId);
  }, [projectClientId, projectId]);

  const { mutateAsync, isPending } = $api.useMutation(
    "put",
    "/api/v1/time-entries/{id}",
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextStartTime = fromDateTimeLocalInput(startTime);
    if (!nextStartTime) {
      toast.error("Start je povinný a musí být platný.");
      return;
    }

    const nextEndTime = endTime ? fromDateTimeLocalInput(endTime) : null;
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
        },
        body: {
          description: description.trim() || null,
          project_id: projectId,
          client_id: clientId,
          start_time: nextStartTime,
          end_time: nextEndTime,
        },
      });

      toast.success("Výkaz byl aktualizován.");
      onUpdated?.();
    } catch {
      toast.error("Aktualizace výkazu se nezdařila.");
    }
  };

  return (
    <form className="grid gap-3" onSubmit={handleSubmit}>
      <Input
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        placeholder="Popis výkazu"
        disabled={isPending}
      />

      <ProjectPicker
        value={projectId}
        onChange={setProjectId}
        disabled={isPending}
        placeholder="Vyber projekt"
      />

      <ClientPicker
        value={clientId}
        onChange={setClientId}
        disabled={isPending}
        placeholder="Vyber klienta"
      />

      <Input
        type="datetime-local"
        value={startTime}
        onChange={(event) => setStartTime(event.target.value)}
        disabled={isPending}
      />

      <Input
        type="datetime-local"
        value={endTime}
        onChange={(event) => setEndTime(event.target.value)}
        disabled={isPending}
      />

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Ukládám..." : "Uložit změny"}
        </Button>
      </div>
    </form>
  );
}
