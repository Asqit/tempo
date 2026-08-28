import { useLiveTimeEntry } from "../../hooks/use-live-time-entry";
import { TimerCRUD } from "./components/crud";
import { cn } from "@/lib/utils";

export function NewEntry() {
  const { id, isPlaying, start, stop } = useLiveTimeEntry();

  return (
    <div
      className={cn(
        "relative rounded-lg z-10 flex flex-col gap-3 overflow-visible border bg-muted/25 px-5 py-8 md:flex-row md:items-center",
        isPlaying && "border-2 border-primary bg-primary/10",
      )}
    >
      <TimerCRUD
        key={id ?? 0}
        id={id}
        state={isPlaying ? "playing" : "stopped"}
        callback={isPlaying ? stop : start}
      />
    </div>
  );
}
