import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { $api, getWorkspaceHeader } from "@/lib/api";
import { useAuthStore } from "@/features/auth";

export function useLiveTimeEntry() {
  const [id, setId] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0); // seconds
  const userId = useAuthStore((state) => state.user?.id);
  const hydratedFromLastEntry = useRef(false);
  const workspaceHeader = getWorkspaceHeader();

  const { data, isLoading } = $api.useQuery(
    "get",
    "/api/v1/time-entries/last",
    {
      params: { header: workspaceHeader ?? { "X-Workspace-Id": 0 } },
      enabled: !!workspaceHeader,
    },
  );

  const isPlaying = id !== null;
  const entry = isPlaying ? data : null; // metadata jen když opravdu běží

  useEffect(() => {
    if (hydratedFromLastEntry.current || isLoading) return;
    setId(data && data.end_time === null ? data.id : null);
    hydratedFromLastEntry.current = true;
  }, [data, isLoading]);

  // živý tikající čas
  useEffect(() => {
    if (!isPlaying || !entry?.start_time) {
      setElapsed(0);
      return;
    }
    const startedAt = new Date(entry.start_time).getTime();
    const tick = () => setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, entry?.start_time]);

  const { mutateAsync: createTimeEntry } = $api.useMutation(
    "post",
    "/api/v1/time-entries/",
  );
  const { mutateAsync: updateTimeEntry } = $api.useMutation(
    "put",
    "/api/v1/time-entries/{id}",
  );

  const start = useCallback(async () => {
    if (!userId) {
      toast.error("Missing user context");
      return;
    }
    if (!workspaceHeader) {
      toast.error("Vyber workspace");
      return;
    }
    try {
      const created = await createTimeEntry({
        params: { header: workspaceHeader },
        body: {
          description: "New entry",
          project_id: null,
          start_time: new Date().toISOString(),
          end_time: null,
        },
      });
      setId(created.id);
    } catch {
      toast.error("Could not create time entry");
    }
  }, [createTimeEntry, userId, workspaceHeader]);

  const stop = useCallback(async () => {
    if (id === null || !workspaceHeader) return;
    try {
      await updateTimeEntry({
        params: { path: { id }, header: workspaceHeader },
        body: { end_time: new Date().toISOString() },
      });
      setId(null);
    } catch {
      toast.error("Could not stop time entry");
    }
  }, [id, updateTimeEntry, workspaceHeader]);

  return {
    id,
    entry,
    isPlaying,
    isLoading,
    elapsed,
    start,
    stop,
  };
}
