import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ClientPicker } from "@/features/clients/components/client-picker";
import { ProjectPicker } from "@/features/projects/components/project-picker";
import { DatePicker } from "@/components/share/date-picker";
import { $api, getWorkspaceHeader } from "@/lib/api";
import { Switch } from "@/components/ui/switch";

type TimeEntryUpdateFormProps = {
  id: number;
  initialDescription: string | null;
  initialProjectId: number | null;
  initialStartTime: string;
  initialBillable: boolean | null;
  initialEndTime: string | null;
  onUpdated?: () => void;
};

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
  initialBillable,
  onUpdated,
}: TimeEntryUpdateFormProps) {
  const [billable, setBillable] = useState<boolean>(initialBillable ?? false);
  const [description, setDescription] = useState(initialDescription ?? "");
  const [projectId, setProjectId] = useState<number | null>(initialProjectId);
  const [clientId, setClientId] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<Date>(new Date(initialStartTime));
  const [endTime, setEndTime] = useState<Date | null>(
    initialEndTime ? new Date(initialEndTime) : null,
  );
  const workspaceHeader = getWorkspaceHeader();

  const { data: projectData } = $api.useQuery("get", "/api/v1/projects/{id}", {
    params: {
      path: {
        id: projectId ?? 0,
      },
      query: {
        client_id: 0,
      },
      header: workspaceHeader ?? { "X-Workspace-Id": 0 },
    },
    enabled: !!workspaceHeader && projectId !== null,
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

    if (!startTime || Number.isNaN(startTime.getTime())) {
      toast.error("Start je povinný a musí být platný.");
      return;
    }

    if (endTime && Number.isNaN(endTime.getTime())) {
      toast.error("Konec musí být platný datum a čas.");
      return;
    }

    try {
      await mutateAsync({
        params: {
          path: {
            id,
          },
          header: workspaceHeader ?? { "X-Workspace-Id": 0 },
        },
        body: {
          description: description.trim() || null,
          project_id: projectId,
          client_id: clientId,
          start_time: startTime.toISOString(),
          end_time: endTime ? endTime.toISOString() : null,
          billable: false,
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

      <DatePicker
        value={startTime}
        setValue={setStartTime}
        withTime
        label="Začátek"
      />

      <DatePicker
        value={endTime ?? new Date()}
        setValue={setEndTime}
        withTime
        label="Konec"
      />

      <Switch checked={billable} onCheckedChange={(b) => setBillable(b)} />

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Ukládám..." : "Uložit změny"}
        </Button>
      </div>
    </form>
  );
}
