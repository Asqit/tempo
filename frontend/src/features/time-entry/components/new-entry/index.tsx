import { $api, getWorkspaceHeader } from "@/lib/api";
import { TimerCRUD } from "./components/crud";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/features/auth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function NewEntry() {
  const [id, setId] = useState<number | null>(null);
  const userId = useAuthStore((state) => state.user?.id);
  const hydratedFromLastEntry = useRef(false);
  const workspaceHeader = getWorkspaceHeader();

  const { data, isLoading } = $api.useQuery(
    "get",
    "/api/v1/time-entries/last",
    {
      params: {
        header: workspaceHeader ?? { "X-Workspace-Id": 0 },
      },
      enabled: !!workspaceHeader,
    },
  );

  useEffect(() => {
    if (hydratedFromLastEntry.current || isLoading) {
      return;
    }

    setId(data?.end_time === null ? data.id : null);
    hydratedFromLastEntry.current = true;
  }, [data, isLoading]);

  const { mutateAsync: createTimeEntry } = $api.useMutation(
    "post",
    "/api/v1/time-entries/",
  );
  const { mutateAsync: updateTimeEntry } = $api.useMutation(
    "put",
    "/api/v1/time-entries/{id}",
  );

  const handleCreateEntry = useCallback(async () => {
    if (!userId) {
      toast.error("Missing user context");
      return;
    }

    try {
      if (!workspaceHeader) {
        toast.error("Vyber workspace");
        return;
      }

      const now = new Date().toISOString();
      const entry = await createTimeEntry({
        params: {
          header: workspaceHeader,
        },
        body: {
          description: "New entry",
          project_id: null,
          start_time: now,
          end_time: null,
        },
      });

      setId(entry.id);
    } catch {
      toast.error("Could not create time entry");
    }
  }, [createTimeEntry, userId, workspaceHeader]);

  const handleStopEntry = useCallback(async () => {
    if (id === null) {
      return;
    }

    try {
      if (!workspaceHeader) {
        return;
      }

      await updateTimeEntry({
        params: {
          path: {
            id,
          },
          header: workspaceHeader,
        },
        body: {
          end_time: new Date().toISOString(),
        },
      });

      setId(null);
    } catch {
      toast.error("Could not stop time entry");
    }
  }, [id, updateTimeEntry, workspaceHeader]);

  return (
    <div
      className={cn(
        "relative z-10 flex flex-col bg-muted/25 gap-3 overflow-visible border px-5 py-8 md:flex-row md:items-center",
        id !== null && "border-primary bg-primary/10 border-2",
      )}
    >
      <TimerCRUD
        key={id ?? 0} // Reset animation when ID changes
        id={id}
        state={id === null ? "stopped" : "playing"}
        callback={id === null ? handleCreateEntry : handleStopEntry}
      />
    </div>
  );
}
