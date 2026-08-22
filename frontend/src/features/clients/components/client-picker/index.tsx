import { useMemo, useState, type ReactElement } from "react";
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { $api, getWorkspaceHeader } from "@/lib/api";

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

type ClientPickerProps = {
  value: number | null;
  onChange: (nextValue: number) => void;
  disabled?: boolean;
  placeholder?: string;
  id?: string;
  trigger?: (props: {
    selected: ClientOption | null;
    disabled: boolean;
    isLoading: boolean;
    placeholder: string;
    id?: string;
  }) => ReactElement;
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

    return {
      options,
      page: typeof payload.page === "number" ? payload.page : 1,
      pages: typeof payload.pages === "number" ? payload.pages : 1,
      total: typeof payload.total === "number" ? payload.total : options.length,
      size: typeof payload.size === "number" ? payload.size : options.length,
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

export function ClientPicker({
  value,
  onChange,
  disabled = false,
  placeholder = "Vyber klienta",
  id,
  trigger,
}: ClientPickerProps) {
  const workspaceHeader = getWorkspaceHeader();
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading, isFetching } = $api.useQuery(
    "get",
    "/api/v1/clients/",
    {
      params: {
        query: {
          page: 1,
          size: pageSize,
        },
        header: workspaceHeader,
      },
      enabled: !!workspaceHeader,
    },
  );

  const currentPageData = useMemo(() => {
    return data
      ? normalizeClientsPage(data)
      : { options: [], page: 1, pages: 1, total: 0, size: pageSize };
  }, [data, pageSize]);

  const options = currentPageData.options;

  const selected = useMemo(
    () => options.find((option) => option.id === value) ?? null,
    [options, value],
  );

  const hasMore = pageSize < 100 && currentPageData.total > options.length;
  const isDisabled = disabled || isLoading || !options.length;

  const handleSelect = (nextValue: number) => {
    onChange(nextValue);
  };

  const handleShowMore = () => {
    if (!hasMore || isFetching) {
      return;
    }

    setPageSize((current) => Math.min(100, current + 10));
  };

  if (!workspaceHeader) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          trigger ? (
            trigger({
              selected,
              disabled: isDisabled,
              isLoading,
              placeholder,
              id,
            })
          ) : (
            <Button
              type="button"
              variant="outline"
              id={id}
              disabled={isDisabled}
              className="min-w-48 justify-between"
            />
          )
        }
      >
        {!trigger ? (
          <>
            <span className="truncate">
              {selected?.name ??
                (isLoading
                  ? "Načítám klienty..."
                  : options.length
                    ? placeholder
                    : "Klienti nenalezeni")}
            </span>

            <ChevronsUpDownIcon className="size-4" />
          </>
        ) : null}
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-64">
        {options.length > 0 ? (
          options.map((option) => (
            <DropdownMenuItem
              key={option.id}
              onClick={() => handleSelect(option.id)}
              className="justify-between"
            >
              <span className="truncate">{option.name}</span>

              {value === option.id ? <CheckIcon className="size-4" /> : null}
            </DropdownMenuItem>
          ))
        ) : (
          <div className="px-2 py-1.5 text-sm text-muted-foreground">
            {isLoading ? "Načítám klienty..." : "Klienti nenalezeni"}
          </div>
        )}

        {hasMore ? (
          <>
            <DropdownMenuSeparator />

            <DropdownMenuItem
              disabled={isFetching}
              onSelect={(event) => {
                event.preventDefault();
                handleShowMore();
              }}
              className="justify-center"
            >
              {isFetching ? "Načítám další..." : "Zobrazit další"}
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
