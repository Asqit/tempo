import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type PageHeaderProps = {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "flex flex-col gap-4 border-b border-border/70 pb-4 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0 space-y-1">
        <p className="text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase animate-in fade-in slide-in-from-top-1 duration-300 ease-out fill-mode-both">
          {eyebrow}
        </p>
        <h1 className="font-heading truncate text-3xl font-black tracking-tight uppercase animate-in fade-in slide-in-from-top-1 duration-300 ease-out delay-75 fill-mode-both">
          {title}
        </h1>
        {description ? (
          <p className="max-w-2xl text-sm text-muted-foreground animate-in fade-in slide-in-from-top-1 duration-300 ease-out delay-100 fill-mode-both">
            {description}
          </p>
        ) : null}
      </div>

      {actions ? (
        <div className="flex shrink-0 items-center gap-2 animate-in fade-in zoom-in-95 duration-300 ease-out delay-100 fill-mode-both">
          {actions}
        </div>
      ) : null}
    </header>
  );
}
