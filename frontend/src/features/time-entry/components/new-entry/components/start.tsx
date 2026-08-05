import { Button } from "@/components/ui/button";
import { Pause, Play } from "lucide-react";

interface Props {
  callback(): Promise<void> | void;
  state: "playing" | "stopped";
}

export function TimerStart({ state, callback }: Props) {
  return (
    <Button
      className="group size-10 rounded-none border border-primary/40 shadow-sm transition-all hover:scale-[1.02]"
      onClick={() => callback()}
    >
      {state === "playing" ? (
        <Pause className="group-hover:fill-current group-hover:stroke-none" />
      ) : (
        <Play className="ml-0.5 group-hover:fill-current group-hover:stroke-none" />
      )}
    </Button>
  );
}
