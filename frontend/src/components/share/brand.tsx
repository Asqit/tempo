import { Link } from "@tanstack/react-router";

export function Brand() {
  return (
    <Link to="/" className="group/brand inline-flex">
      <h1 className="flex select-none items-center gap-1 text-2xl font-extrabold tracking-tight text-sidebar-foreground">
        <span className="flex w-[22px] flex-col items-end justify-center gap-[4px]">
          <span className="h-[2px] translate-x-[1px] w-[8px] -skew-x-12 bg-primary group-hover/brand:animate-[tempo-wind_600ms_ease-out]" />
          <span className="h-[2px] translate-x-[2px] w-[18px] -skew-x-12 bg-primary group-hover/brand:animate-[tempo-wind_600ms_ease-out_80ms]" />
          <span className="h-[2px] w-[11px] -skew-x-12 bg-primary group-hover/brand:animate-[tempo-wind_600ms_ease-out_160ms]" />
        </span>

        <span className="-skew-x-12 uppercase">Tempo</span>
      </h1>
    </Link>
  );
}
