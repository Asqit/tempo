import { $api } from "@/lib/api";
import { TimerCRUD } from "./components/crud";
import { TimerStart } from "./components/start";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/features/auth";
import { toast } from "sonner";

export function NewEntry() {
  const [id, setId] = useState<number | null>(null);
  const userId = useAuthStore((state) => state.user?.id);
  const hydratedFromLastEntry = useRef(false);

  const { data, isLoading } = $api.useQuery("get", "/api/v1/time-entries/last");

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
      const now = new Date().toISOString();
      const entry = await createTimeEntry({
        body: {
          description: "New entry",
          user_id: userId,
          project_id: null,
          start_time: now,
          end_time: null,
        },
      });

      setId(entry.id);
    } catch {
      toast.error("Could not create time entry");
    }
  }, [createTimeEntry, userId]);

  const handleStopEntry = useCallback(async () => {
    if (id === null) {
      return;
    }

    try {
      await updateTimeEntry({
        params: {
          path: {
            id,
          },
        },
        body: {
          end_time: new Date().toISOString(),
        },
      });

      setId(null);
    } catch {
      toast.error("Could not stop time entry");
    }
  }, [id, updateTimeEntry]);

  return (
    <div className="relative z-10 flex flex-col gap-3 overflow-visible rounded-none border border-border/70 bg-muted/25 p-3 md:flex-row md:items-center">
      <TimerCRUD id={id} />
      <TimerStart
        state={id === null ? "stopped" : "playing"}
        callback={id === null ? handleCreateEntry : handleStopEntry}
      />
    </div>
  );
}
