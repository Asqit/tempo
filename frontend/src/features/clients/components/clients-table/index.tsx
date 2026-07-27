import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";

import { $api } from "@/lib/api";
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

  const { data, isLoading, isError, isFetching } = $api.useQuery(
    "get",
    "/api/v1/clients/",
    {
      params: {
        query: {
          page,
          size: PAGE_SIZE,
        },
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
              <TableCell colSpan={4} className="text-muted-foreground">
                Nacitam klienty...
              </TableCell>
            </TableRow>
          ) : null}

          {!isLoading && isError ? (
            <TableRow>
              <TableCell colSpan={4} className="text-destructive">
                Klienty se nepodarilo nacist.
              </TableCell>
            </TableRow>
          ) : null}

          {!isLoading && !isError && clients.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-muted-foreground">
                Zatim nemas zadne klienty.
              </TableCell>
            </TableRow>
          ) : null}

          {!isLoading && !isError
            ? clients.map((client) => {
                const clientId = (client as { id?: unknown }).id;
                const hasClientId = typeof clientId === "number";

                return (
                  <TableRow key={`${client.name}-${client.created_at}`}>
                    <TableCell className="font-medium">
                      {hasClientId ? (
                        <Link
                          to="/app/clients/$id"
                          params={{ id: String(clientId) }}
                          className="underline-offset-4 hover:underline"
                        >
                          {client.name}
                        </Link>
                      ) : (
                        <span>{client.name}</span>
                      )}
                    </TableCell>
                    <TableCell>{client.user.name}</TableCell>
                    <TableCell>{formatDateTime(client.created_at)}</TableCell>
                    <TableCell>{formatDateTime(client.updated_at)}</TableCell>
                  </TableRow>
                );
              })
            : null}
        </TableBody>
      </Table>

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
