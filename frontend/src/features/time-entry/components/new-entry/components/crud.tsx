import type { components } from "@/lib/api.d";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ClientPicker } from "@/features/clients/components/client-picker";
import { ProjectPicker } from "@/features/projects/components/project-picker";
import { $api } from "@/lib/api";
import { Tag, User2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useDebounceCallback } from "usehooks-ts";
import { toast } from "sonner";

interface Props {
  id?: number | null;
}

function formatElapsedTime(durationMs: number) {
  const totalSeconds = Math.max(0, Math.floor(durationMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function TimerCRUD({ id }: Props) {
  const hasId = id !== null && id !== undefined;
  const queryId = id ?? 0;
  const [now, setNow] = useState(() => Date.now());
  const [clientId, setClientId] = useState<number | null>(null);
  const [projectId, setProjectId] = useState<number | null>(null);

  const { data, isLoading, isError } = $api.useQuery(
    "get",
    "/api/v1/time-entries/{id}",
    {
      params: {
        path: {
          id: queryId,
        },
      },
      enabled: hasId,
    },
  );
  const { mutateAsync } = $api.useMutation("put", "/api/v1/time-entries/{id}");

  useEffect(() => {
    if (!data?.start_time || data.end_time) {
      return;
    }

    const syncTimeout = window.setTimeout(() => {
      setNow(Date.now());
    }, 0);

    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      window.clearTimeout(syncTimeout);
      window.clearInterval(interval);
    };
  }, [data?.end_time, data?.start_time]);

  type ActionType = "description" | "client" | "project";
  const handleUpdate = useCallback(
    async (type: ActionType, value: string | number) => {
      if (!hasId) {
        return;
      }

      try {
        const payload: components["schemas"]["TimeEntryUpdate"] = {};

        switch (type) {
          case "client":
            payload.client_id = Number(value);
            break;
          case "description":
            payload.description = String(value);
            break;
          case "project":
            payload.project_id = Number(value);
            break;
        }

        await mutateAsync({
          params: {
            path: {
              id,
            },
          },
          body: payload,
        });
      } catch (error) {
        toast.error("Nešlo aktualizovat", {
          description: JSON.stringify(error),
        });
      }
    },
    [hasId, id, mutateAsync],
  );
  const debouncedUpdate = useDebounceCallback(handleUpdate, 500);

  const isDisabled = !hasId || isLoading || isError;
  const resolvedProjectId =
    projectId ??
    (typeof data?.project_id === "number" ? data.project_id : null);
  const startTime = data?.start_time
    ? new Date(data.start_time).getTime()
    : null;
  const endTime = data?.end_time ? new Date(data.end_time).getTime() : null;
  const elapsedTimeMs = startTime === null ? 0 : (endTime ?? now) - startTime;

  const handleClientChange = (nextClientId: number) => {
    setClientId(nextClientId);
    void handleUpdate("client", nextClientId);
  };

  const handleProjectChange = (nextProjectId: number) => {
    setProjectId(nextProjectId);
    void handleUpdate("project", nextProjectId);
  };

  return (
    <div className="flex grow flex-wrap items-center gap-2 md:flex-nowrap">
      <Input
        disabled={isDisabled}
        className="min-w-56 flex-1"
        type="text"
        placeholder="Zadejte popis úlohy"
        defaultValue={data?.description ?? ""}
        onChange={(e) => debouncedUpdate("description", e.target.value)}
      />
      <time
        className="rounded-none border border-border/70 bg-background px-2.5 py-1.5 text-xs font-semibold tabular-nums text-foreground"
        aria-label="Elapsed time"
      >
        {formatElapsedTime(elapsedTimeMs)}
      </time>
      <div className="flex items-center gap-1.5">
        <ClientPicker
          value={clientId}
          onChange={handleClientChange}
          disabled={isDisabled}
          placeholder="Vyber klienta"
          trigger={({ selected, disabled, placeholder }) => (
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              disabled={disabled}
              aria-label={selected?.name ?? placeholder}
            >
              <User2 />
            </Button>
          )}
        />
        <ProjectPicker
          value={resolvedProjectId}
          onChange={handleProjectChange}
          disabled={isDisabled}
          placeholder="Vyber projekt"
          trigger={({ selected, disabled, placeholder }) => (
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              disabled={disabled}
              aria-label={selected?.name ?? placeholder}
            >
              <Tag />
            </Button>
          )}
        />
      </div>
    </div>
  );
}
