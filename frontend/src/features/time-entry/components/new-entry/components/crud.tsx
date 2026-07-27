import type { components } from "@/lib/api.d";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
        const payload: components["schemas"]["TimeEntryPartial"] = {
          description: null,
          project_id: null,
          start_time: null,
          end_time: null,
        };

        switch (type) {
          case "client":
            // not-implemented!
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
  const startTime = data?.start_time
    ? new Date(data.start_time).getTime()
    : null;
  const endTime = data?.end_time ? new Date(data.end_time).getTime() : null;
  const elapsedTimeMs = startTime === null ? 0 : (endTime ?? now) - startTime;

  return (
    <div className="flex items-center gap-2 grow">
      <Input
        disabled={isDisabled}
        className="flex-1"
        type="text"
        placeholder="Zadejte popis úlohy"
        defaultValue={data?.description ?? ""}
        onChange={(e) => debouncedUpdate("description", e.target.value)}
      />
      <time
        className="tabular-nums text-xs text-muted-foreground"
        aria-label="Elapsed time"
      >
        {formatElapsedTime(elapsedTimeMs)}
      </time>
      <ul className="flex items-center gap-2">
        <Button disabled={isDisabled}>
          <User2 />
        </Button>
        <Button disabled={isDisabled}>
          <Tag />
        </Button>
      </ul>
    </div>
  );
}
