import { Link } from "@tanstack/react-router";
import { Clock } from "lucide-react";

export function Brand() {
  return (
    <Link to="/">
      <div className="flex items-center gap-3 px-2.5 py-2">
        <div className="flex size-8 items-center justify-center rounded-none bg-primary/90 text-primary-foreground shadow-sm">
          <Clock className="size-4" />
        </div>
        <h1 className="select-none text-sm font-extrabold tracking-tight text-sidebar-foreground">
          Tempo
        </h1>
      </div>
    </Link>
  );
}
