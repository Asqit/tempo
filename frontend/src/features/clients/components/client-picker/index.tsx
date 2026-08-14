import { useEffect, useMemo, useState } from "react";
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
}: ClientPickerProps) {
  const workspaceHeader = getWorkspaceHeader();
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
        header: workspaceHeader ?? { "X-Workspace-Id": 0 },
      },
      enabled: !!workspaceHeader,
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
  }, [data]);

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

  const hasMore = currentPageData.pages > currentPageData.page;
  const isDisabled = disabled || isLoading || !options.length;

  const handleSelect = (nextValue: number) => {
    onChange(nextValue);
  };

  const handleShowMore = () => {
    if (!hasMore || isFetching) {
      return;
    }

    setPage((current) => current + 1);
  };

  if (!workspaceHeader) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="outline"
            disabled={isDisabled}
            className="min-w-48 justify-between"
          />
        }
      >
        <span className="truncate">
          {selected?.name ??
            (isLoading
              ? "Načítám klienty..."
              : options.length
                ? placeholder
                : "Klienti nenalezeni")}
        </span>

        <ChevronsUpDownIcon className="size-4" />
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-64">
        {options.length > 0 ? (
          options.map((option) => (
            <DropdownMenuItem
              key={option.id}
              onSelect={() => handleSelect(option.id)}
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
