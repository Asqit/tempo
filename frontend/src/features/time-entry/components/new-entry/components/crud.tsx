import type { components } from "@/lib/api.d";
import { Button } from "@/components/ui/button";
import { ClientPicker } from "@/features/clients/components/client-picker";
import { ProjectPicker } from "@/features/projects/components/project-picker";
import { $api, getWorkspaceHeader } from "@/lib/api";
import { Pause, Play, Tag, User2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useDebounceCallback } from "usehooks-ts";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type ActionType = "description" | "client" | "project";

interface Props {
  id?: number | null;
  callback(): Promise<void> | void;
  state: "playing" | "stopped";
}

function formatElapsedTime(durationMs: number) {
  const totalSeconds = Math.max(0, Math.floor(durationMs / 1000));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

export function TimerCRUD({ id, state, callback }: Props) {
  const hasId = id !== null && id !== undefined;
  const workspaceHeader = getWorkspaceHeader() ?? { "X-Workspace-Id": 0 };
  const [now, setNow] = useState(() => Date.now());
  const [clientId, setClientId] = useState<number | null>(null);
  const [projectId, setProjectId] = useState<number | null>(null);

  const { data, isLoading, isError } = $api.useQuery(
    "get",
    "/api/v1/time-entries/{id}",
    {
      params: {
        path: { id: id ?? 0 },
        header: workspaceHeader,
      },
      enabled: !!getWorkspaceHeader() && hasId,
    },
  );

  const { mutateAsync } = $api.useMutation("put", "/api/v1/time-entries/{id}");

  useEffect(() => {
    if (!data?.start_time || data.end_time) return;

    const syncTimeout = window.setTimeout(() => setNow(Date.now()), 0);
    const interval = window.setInterval(() => setNow(Date.now()), 1000);

    return () => {
      window.clearTimeout(syncTimeout);
      window.clearInterval(interval);
    };
  }, [data?.start_time, data?.end_time]);

  const handleUpdate = useCallback(
    async (type: ActionType, value: string | number) => {
      if (!hasId) return;

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

      try {
        await mutateAsync({
          params: { path: { id: id! }, header: workspaceHeader },
          body: payload,
        });
      } catch (error) {
        toast.error("Nešlo aktualizovat", {
          description: JSON.stringify(error),
        });
      }
    },
    [hasId, id, mutateAsync, workspaceHeader],
  );

  const debouncedUpdate = useDebounceCallback(handleUpdate, 500);

  const isDisabled = !hasId || isLoading || isError;
  const resolvedClientId =
    clientId ?? (typeof data?.client_id === "number" ? data.client_id : null);
  const resolvedProjectId =
    projectId ??
    (typeof data?.project_id === "number" ? data.project_id : null);
  const startTime = data?.start_time
    ? new Date(data.start_time).getTime()
    : null;
  const endTime = data?.end_time ? new Date(data.end_time).getTime() : null;
  const elapsedTimeMs = startTime === null ? 0 : (endTime ?? now) - startTime;

  return (
    <div className="flex grow flex-wrap items-center gap-2 md:flex-nowrap animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div className="flex-1">
        <div>
          {state === "playing" && (
            <div className="flex items-center gap-2 text-xs text-primary">
              <div className="size-2 bg-primary" /> AKTIVNÍ SESSION
            </div>
          )}
          <input
            disabled={isDisabled}
            className="min-w-56 flex-1 bg-transparent text-3xl font-black p-1 focus:outline-none focus:border-b border-primary"
            type="text"
            placeholder="Zadejte popis úlohy"
            defaultValue={data?.description ?? ""}
            onChange={(e) => debouncedUpdate("description", e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1.5">
          <ClientPicker
            value={resolvedClientId}
            onChange={(nextId) => {
              setClientId(nextId);
              void handleUpdate("client", nextId);
            }}
            disabled={isDisabled}
            placeholder="Vyber klienta"
            trigger={({ selected, disabled, placeholder }) => (
              <Button
                type="button"
                variant="ghost"
                disabled={disabled}
                aria-label={selected?.name ?? placeholder}
              >
                <User2 /> {selected?.name ?? placeholder}
              </Button>
            )}
          />
          <Separator orientation="vertical" />
          <ProjectPicker
            value={resolvedProjectId}
            onChange={(nextId) => {
              setProjectId(nextId);
              void handleUpdate("project", nextId);
            }}
            disabled={isDisabled}
            placeholder="Vyber projekt"
            trigger={({ selected, disabled, placeholder }) => (
              <Button
                type="button"
                variant="ghost"
                disabled={disabled}
                aria-label={selected?.name ?? placeholder}
              >
                <Tag /> {selected?.name ?? placeholder}
              </Button>
            )}
          />
        </div>
      </div>

      <div className="flex flex-col">
        <time
          className={cn(
            "text-3xl font-black tabular-nums",
            state === "playing" && "text-primary",
          )}
          aria-label="Elapsed time"
        >
          {formatElapsedTime(elapsedTimeMs)}
        </time>
        <Button
          className="group shadow-sm transition-all"
          onClick={() => callback()}
        >
          {state === "playing" ? (
            <Pause className="group-hover:fill-current group-hover:stroke-none" />
          ) : (
            <Play className="ml-0.5 group-hover:fill-current group-hover:stroke-none" />
          )}
          {state === "playing" ? "STOP" : "START"}
        </Button>
      </div>
    </div>
  );
}
