import {
  cloneElement,
  isValidElement,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { $api } from "@/lib/api";

type ProjectOption = {
  id: number;
  name: string;
};

type ProjectPickerProps = {
  value: number | null;
  onChange: (nextValue: number) => void;
  disabled?: boolean;
  placeholder?: string;
  asChild?: boolean;
  trigger?: (props: ProjectPickerTriggerProps) => ReactNode;
};

type ProjectPickerTriggerProps = {
  selected: ProjectOption | null;
  disabled: boolean;
  isLoading: boolean;
  hasOptions: boolean;
  isOpen: boolean;
  placeholder: string;
  onClick: () => void;
};

function renderDefaultTrigger({
  selected,
  disabled,
  isLoading,
  hasOptions,
  isOpen,
  placeholder,
  onClick,
}: ProjectPickerTriggerProps) {
  return (
    <Button
      type="button"
      variant="outline"
      disabled={disabled}
      onClick={onClick}
      className="min-w-48 justify-between"
      aria-expanded={isOpen}
      aria-haspopup="listbox"
    >
      <span className="truncate">
        {selected?.name ??
          (isLoading
            ? "Nacitam projekty..."
            : hasOptions
              ? placeholder
              : "Projekty nenalezeny")}
      </span>
      <ChevronsUpDownIcon className="size-4" />
    </Button>
  );
}

function normalizeProjects(data: unknown): ProjectOption[] {
  const source =
    data &&
    typeof data === "object" &&
    "items" in data &&
    Array.isArray((data as { items?: unknown[] }).items)
      ? (data as { items: unknown[] }).items
      : Array.isArray(data)
        ? data
        : [];

  return source
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const raw = item as {
        id?: unknown;
        name?: unknown;
      };

      if (typeof raw.id !== "number" || typeof raw.name !== "string") {
        return null;
      }

      return {
        id: raw.id,
        name: raw.name,
      } satisfies ProjectOption;
    })
    .filter((project): project is ProjectOption => project !== null);
}

export function ProjectPicker({
  value,
  onChange,
  disabled,
  placeholder = "Vyber projekt",
  asChild = false,
  trigger,
}: ProjectPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const { data, isLoading } = $api.useQuery("get", "/api/v1/projects/", {
    params: {
      query: {
        page: 1,
        size: 100,
      },
    },
  } as unknown as never);

  const options = normalizeProjects(data);
  const selected = useMemo(
    () => options.find((option) => option.id === value) ?? null,
    [options, value],
  );
  const isDisabled = disabled || isLoading;

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [isOpen]);

  const triggerProps: ProjectPickerTriggerProps = {
    selected,
    disabled: isDisabled,
    isLoading,
    hasOptions: options.length > 0,
    isOpen,
    placeholder,
    onClick: () => {
      if (!isDisabled) {
        setIsOpen((current) => !current);
      }
    },
  };

  const triggerContent =
    typeof trigger === "function"
      ? trigger(triggerProps)
      : renderDefaultTrigger(triggerProps);

  const resolvedTrigger = isValidElement(triggerContent)
    ? (() => {
        const child = triggerContent as ReactElement<{
          onClick?: (event: React.MouseEvent<HTMLElement>) => void;
          disabled?: boolean;
          [key: string]: unknown;
        }>;

        if (!asChild && typeof trigger !== "function") {
          return child;
        }

        return cloneElement(child, {
          ...child.props,
          onClick: (event: React.MouseEvent<HTMLElement>) => {
            child.props.onClick?.(event);
            triggerProps.onClick();
          },
          "aria-expanded": isOpen,
          "aria-haspopup": "listbox",
          disabled: triggerProps.disabled,
        });
      })()
    : triggerContent;

  const handleSelect = (nextValue: number) => {
    onChange(nextValue);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      {resolvedTrigger}
      {isOpen ? (
        <div className="absolute z-50 mt-2 w-64 border border-border bg-popover text-popover-foreground shadow-md">
          <div className="max-h-72 overflow-y-auto">
            {options.length > 0 ? (
              options.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleSelect(option.id)}
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
                >
                  <span className="truncate">{option.name}</span>
                  {value === option.id ? (
                    <CheckIcon className="size-4" />
                  ) : null}
                </button>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                {isLoading ? "Nacitam projekty..." : "Projekty nenalezeny"}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
