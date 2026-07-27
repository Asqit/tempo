import { Button } from "@/components/ui/button";
import { Pause, Play } from "lucide-react";

interface Props {
  callback(): Promise<void> | void;
  state: "playing" | "stopped";
}

export function TimerStart({ state, callback }: Props) {
  return (
    <Button className={"rounded-full size-10"} onClick={() => callback()}>
      {state === "playing" ? <Pause /> : <Play />}
    </Button>
  );
}
