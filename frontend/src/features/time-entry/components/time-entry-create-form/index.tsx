import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ClientPicker } from "@/features/clients/components/client-picker";
import { ProjectPicker } from "@/features/projects/components/project-picker";
import { $api, getWorkspaceHeader } from "@/lib/api";

type TimeEntryCreateFormProps = {
  onCreated?: () => void;
};

function toDateTimeLocalInput(value: Date): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  const hours = String(value.getHours()).padStart(2, "0");
  const minutes = String(value.getMinutes()).padStart(2, "0");

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

export function TimeEntryCreateForm({ onCreated }: TimeEntryCreateFormProps) {
  const now = new Date();
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState<number | null>(null);
  const [clientId, setClientId] = useState<number | null>(null);
  const [startTime, setStartTime] = useState(toDateTimeLocalInput(now));
  const [endTime, setEndTime] = useState("");
  const workspaceHeader = getWorkspaceHeader();

  const { mutateAsync, isPending } = $api.useMutation(
    "post",
    "/api/v1/time-entries/",
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
          header: workspaceHeader ?? { "X-Workspace-Id": 0 },
        },
        body: {
          description: description.trim() || null,
          project_id: projectId,
          client_id: clientId,
          start_time: nextStartTime,
          end_time: nextEndTime,
        },
      });

      toast.success("Výkaz byl vytvořen.");
      onCreated?.();
    } catch {
      toast.error("Vytvoření výkazu se nezdařilo.");
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
          {isPending ? "Vytvářím..." : "Vytvořit výkaz"}
        </Button>
      </div>
    </form>
  );
}
