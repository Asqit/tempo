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

type ClientOption = {
  id: number;
  name: string;
};

type ClientPage = {
  options: ClientOption[];
  page: number;
  pages: number;
  total: number;
  size: number;
};

type ClientPickerTriggerProps = {
  selected: ClientOption | null;
  disabled: boolean;
  isLoading: boolean;
  hasOptions: boolean;
  isOpen: boolean;
  placeholder: string;
  onClick: () => void;
};

type ClientPickerProps = {
  value: number | null;
  onChange: (nextValue: number) => void;
  disabled?: boolean;
  placeholder?: string;
  asChild?: boolean;
  trigger?: ReactNode | ((props: ClientPickerTriggerProps) => ReactNode);
};

function normalizeClients(data: unknown): ClientOption[] {
  const visit = (value: unknown): ClientOption[] => {
    if (Array.isArray(value)) {
      const directMatches = value
        .map((item) => {
          if (!item || typeof item !== "object") {
            return null;
          }

          const raw = item as {
            id?: unknown;
            name?: unknown;
          };

          const normalizedId =
            typeof raw.id === "number"
              ? raw.id
              : typeof raw.id === "string" && /^\d+$/.test(raw.id)
                ? Number(raw.id)
                : null;

          if (normalizedId === null || typeof raw.name !== "string") {
            return null;
          }

          return {
            id: normalizedId,
            name: raw.name,
          } satisfies ClientOption;
        })
        .filter((client): client is ClientOption => client !== null);

      if (directMatches.length > 0) {
        return directMatches;
      }

      return value.flatMap((item) => visit(item));
    }

    if (value && typeof value === "object") {
      return Object.values(value as Record<string, unknown>).flatMap((entry) =>
        visit(entry),
      );
    }

    return [];
  };

  return visit(data);
}

function normalizeClientsPage(data: unknown): ClientPage {
  if (data && typeof data === "object") {
    const payload = data as {
      items?: unknown[];
      page?: unknown;
      pages?: unknown;
      total?: unknown;
      size?: unknown;
    };

    const options = normalizeClients(payload.items ?? data);
    const page = typeof payload.page === "number" ? payload.page : 1;
    const pages = typeof payload.pages === "number" ? payload.pages : 1;
    const total =
      typeof payload.total === "number" ? payload.total : options.length;
    const size =
      typeof payload.size === "number" ? payload.size : options.length;

    return {
      options,
      page,
      pages,
      total,
      size,
    };
  }

  return {
    options: [],
    page: 1,
    pages: 1,
    total: 0,
    size: 0,
  };
}

function renderDefaultTrigger({
  selected,
  disabled,
  isLoading,
  hasOptions,
  isOpen,
  placeholder,
  onClick,
}: ClientPickerTriggerProps) {
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
            ? "Nacitam klienty..."
            : hasOptions
              ? placeholder
              : "Klienti nenalezeni")}
      </span>
      <ChevronsUpDownIcon className="size-4" />
    </Button>
  );
}

export function ClientPicker({
  value,
  onChange,
  disabled,
  placeholder = "Vyber klienta",
  asChild = false,
  trigger,
}: ClientPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [loadedPages, setLoadedPages] = useState<Record<number, ClientPage>>(
    {},
  );

  const { data, isLoading, isFetching } = $api.useQuery(
    "get",
    "/api/v1/clients/",
    {
      params: {
        query: {
          page,
          size: 10,
        },
      },
    },
  );

  useEffect(() => {
    if (!data) {
      return;
    }

    const pageData = normalizeClientsPage(data);
    setLoadedPages((current) => ({
      ...current,
      [pageData.page]: pageData,
    }));
  }, [data, page]);

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

  const currentPageData = useMemo(() => {
    if (data) {
      return normalizeClientsPage(data);
    }

    return (
      loadedPages[page] ?? {
        options: [],
        page,
        pages: 1,
        total: 0,
        size: 10,
      }
    );
  }, [data, loadedPages, page]);

  const options = useMemo(() => {
    return Object.values(loadedPages)
      .sort((left, right) => left.page - right.page)
      .flatMap((pageData) => pageData.options);
  }, [loadedPages]);

  const selected = useMemo(
    () => options.find((option) => option.id === value) ?? null,
    [options, value],
  );
  const hasOptions = options.length > 0;
  const isDisabled = disabled || isLoading || !hasOptions;
  const hasMore = currentPageData.pages > currentPageData.page;

  const triggerProps: ClientPickerTriggerProps = {
    selected,
    disabled: isDisabled,
    isLoading,
    hasOptions,
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
      : (trigger ?? renderDefaultTrigger(triggerProps));

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

  const handleShowMore = () => {
    if (!hasMore || isFetching) {
      return;
    }

    setPage((current) => current + 1);
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
                {isLoading ? "Načítám klienty..." : "Klienti nenalezeni"}
              </div>
            )}
          </div>
          {hasMore ? (
            <div className="border-t border-border p-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full justify-center"
                onClick={handleShowMore}
                disabled={isFetching}
              >
                {isFetching ? "Načítám další..." : "Zobrazit další"}
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
