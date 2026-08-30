import type { components } from "@/lib/api.d";
import { Button } from "@tempo/ui/components/button";
import { ClientPicker } from "@/features/clients/components/client-picker";
import { ProjectPicker } from "@/features/projects/components/project-picker";
import { $api, getWorkspaceHeader } from "@/lib/api";
import { Pause, Play, Tag, User2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDebounceCallback } from "usehooks-ts";
import { toast } from "sonner";
import { Separator } from "@tempo/ui/components/separator";
import { cn } from "@/lib/utils";
import { formatElapsed } from "@/lib/time";

type ActionType = "description" | "client" | "project";

interface Props {
  id?: number | null;
  callback(): Promise<void> | void;
  state: "playing" | "stopped";
}

export function TimerCRUD({ id, state, callback }: Props) {
  const hasId = id !== null && id !== undefined;
  const workspaceHeader = useMemo(
    () => getWorkspaceHeader() ?? { "X-Workspace-Id": 0 },
    [],
  );
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
  const currentBillable = data?.billable ?? null;

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

      const payload: components["schemas"]["TimeEntryUpdate"] = {
        billable: currentBillable,
      };
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
    [currentBillable, hasId, id, mutateAsync, workspaceHeader],
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
              <div className="size-2 rounded-full bg-primary" /> AKTIVNÍ MĚŘENÍ
            </div>
          )}
          <label htmlFor="active-time-entry-description" className="sr-only">
            Popis úkolu
          </label>
          <input
            id="active-time-entry-description"
            disabled={isDisabled}
            className="min-w-56 flex-1 rounded-md bg-transparent px-2 py-1 text-3xl font-black outline-none transition-colors placeholder:text-muted-foreground/70 focus-visible:ring-2 focus-visible:ring-ring"
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
          aria-label="Uplynulý čas"
        >
          {formatElapsed(elapsedTimeMs / 1000, true)}
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
          {state === "playing" ? "Zastavit" : "Spustit"}
        </Button>
      </div>
    </div>
  );
}
