import { Play, Square } from "lucide-react";
import { useLiveTimeEntry } from "../../hooks/use-live-time-entry";
import { formatElapsed } from "../../utils/format-elapsed";

export function SidebarTimer() {
  const { isPlaying, isLoading, entry, elapsed, start, stop } =
    useLiveTimeEntry();

  if (isLoading) return null;

  if (!isPlaying) {
    return (
      <button
        type="button"
        onClick={start}
        className="flex h-9 w-full items-center gap-2 rounded-md border border-sidebar-border/70 bg-sidebar-accent/35 px-2 text-sm font-medium hover:bg-sidebar-accent"
      >
        <Play className="size-3.5 fill-current" />
        Spustit timer
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={stop}
      className="flex w-full flex-col gap-1 rounded-md border-2 border-primary bg-primary/10 px-2 py-1.5 text-left hover:bg-primary/15"
    >
      <div className="flex items-center gap-2">
        <span className="size-2 shrink-0 animate-pulse rounded-full bg-primary" />
        <span className="min-w-0 flex-1 truncate text-sm font-medium">
          {entry?.description || "Bez popisu"}
        </span>
        <Square className="size-3 shrink-0 fill-current text-primary" />
      </div>
      <div className="flex items-center justify-between pl-4 text-xs text-muted-foreground">
        <span className="truncate">{entry?.project?.name ?? "—"}</span>
        <span className="font-mono tabular-nums text-primary">
          {formatElapsed(elapsed)}
        </span>
      </div>
    </button>
  );
}
