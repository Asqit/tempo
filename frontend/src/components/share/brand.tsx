import { Link } from "@tanstack/react-router";
import { Clock } from "lucide-react";

export function Brand() {
  return (
    <Link to="/">
      <div className="flex items-center gap-3 px-2.5 py-2">
        <div className="flex size-8 items-center justify-center rounded-none bg-primary/90 text-black shadow-sm">
          <Clock className="size-6 fill-black stroke-primary" />
        </div>
        <h1 className="select-none -skew-x-12 uppercase text-2xl font-extrabold tracking-tight text-sidebar-foreground">
          Tempo
        </h1>
      </div>
    </Link>
  );
}
