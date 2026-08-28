import type { ElementType, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Props {
  icon: ElementType;
  label: string;
  active: boolean;
  onClear?(): void;
  children: ReactNode;
}

export function FilterPill(props: Props) {
  const { icon: Icon, label, active, onClear, children } = props;
  return (
    <Popover>
      <div
        className={cn(
          "flex shrink-0 items-center rounded-md",
          active ? "bg-accent text-accent-foreground" : "text-muted-foreground",
        )}
      >
        <PopoverTrigger
          render={
            <Button variant="ghost" size="sm" className="gap-1.5 px-2.5" />
          }
        >
          <Icon className="size-4" />
          {label}
        </PopoverTrigger>
        {active && onClear && (
          <Button
            variant="ghost"
            size="icon"
            className="size-6 mr-1"
            onClick={onClear}
          >
            <X className="size-3" />
          </Button>
        )}
      </div>
      <PopoverContent className="min-w-64 w-fit p-2" align="start">
        {children}
      </PopoverContent>
    </Popover>
  );
}
