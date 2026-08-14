import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";

import { $api, getWorkspaceHeader } from "@/lib/api";
import { ColorAvatar } from "@/components/share/color-avatar";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const PAGE_SIZE = 10;

function formatDateTime(value: string | null) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString("cs-CZ");
}

export function ClientsTable() {
  const [page, setPage] = useState(1);
  const workspaceHeader = getWorkspaceHeader();

  if (!workspaceHeader) {
    return null;
  }

  const { data, isLoading, isError, isFetching } = $api.useQuery(
    "get",
    "/api/v1/clients/",
    {
      params: {
        query: {
          page,
          size: PAGE_SIZE,
        },
        header: workspaceHeader,
      },
    },
  );

  const clients = data?.items ?? [];
  const totalPages = data?.pages ?? 1;

  const pageNumbers = useMemo(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    if (page <= 3) {
      return [1, 2, 3, 4, 5];
    }

    if (page >= totalPages - 2) {
      return [
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [page - 2, page - 1, page, page + 1, page + 2];
  }, [page, totalPages]);

  const canGoPrevious = page > 1;
  const canGoNext = page < totalPages;

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-none border border-border/70 bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Jmeno klienta</TableHead>
              <TableHead>Vlastnik</TableHead>
              <TableHead>Vytvoreno</TableHead>
              <TableHead>Aktualizovano</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="py-6 text-center text-muted-foreground"
                >
                  Nacitam klienty...
                </TableCell>
              </TableRow>
            ) : null}

            {!isLoading && isError ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="py-6 text-center text-destructive"
                >
                  Klienty se nepodarilo nacist.
                </TableCell>
              </TableRow>
            ) : null}

            {!isLoading && !isError && clients.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="py-6 text-center text-muted-foreground"
                >
                  Zatim nemas zadne klienty.
                </TableCell>
              </TableRow>
            ) : null}

            {!isLoading && !isError
              ? clients.map((client) => {
                  const clientId = (client as { id?: unknown }).id;
                  const hasClientId = typeof clientId === "number";
                  const ownerName = "-";
                  const ownerEmail = null;

                  return (
                    <TableRow key={`${client.name}-${client.created_at}`}>
                      <TableCell className="py-3">
                        <div className="flex items-center gap-3">
                          <ColorAvatar
                            name={client.name}
                            className="size-9 text-sm"
                          />
                          <div className="min-w-0">
                            {hasClientId ? (
                              <Link
                                to="/app/clients/$id"
                                params={{ id: String(clientId) }}
                                className="block truncate font-semibold underline-offset-4 hover:underline"
                              >
                                {client.name}
                              </Link>
                            ) : (
                              <span className="block truncate font-semibold">
                                {client.name}
                              </span>
                            )}
                            <p className="truncate text-xs text-muted-foreground">
                              {ownerEmail ?? "Bez emailu"}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-0.5">
                          <p className="font-medium text-foreground">
                            {ownerName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Vlastník
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-0.5 text-sm">
                          <p>{formatDateTime(client.created_at)}</p>
                          <p className="text-xs text-muted-foreground">
                            Vytvořeno
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-0.5 text-sm">
                          <p>{formatDateTime(client.updated_at)}</p>
                          <p className="text-xs text-muted-foreground">
                            Aktualizováno
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              : null}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>
          Strana {page} z {totalPages}
          {isFetching && !isLoading ? " • aktualizuji..." : ""}
        </span>

        <Pagination className="mx-0 w-auto justify-end">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                text="Predchozi"
                href="#"
                aria-disabled={!canGoPrevious}
                className={
                  !canGoPrevious ? "pointer-events-none opacity-50" : undefined
                }
                onClick={(event) => {
                  event.preventDefault();
                  if (canGoPrevious) {
                    setPage((value) => value - 1);
                  }
                }}
              />
            </PaginationItem>

            {pageNumbers.map((pageNumber) => (
              <PaginationItem key={pageNumber}>
                <PaginationLink
                  href="#"
                  isActive={pageNumber === page}
                  onClick={(event) => {
                    event.preventDefault();
                    setPage(pageNumber);
                  }}
                >
                  {pageNumber}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                text="Dalsi"
                href="#"
                aria-disabled={!canGoNext}
                className={
                  !canGoNext ? "pointer-events-none opacity-50" : undefined
                }
                onClick={(event) => {
                  event.preventDefault();
                  if (canGoNext) {
                    setPage((value) => value + 1);
                  }
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
