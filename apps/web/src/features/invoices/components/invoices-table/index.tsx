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
} from "@tempo/ui/components/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@tempo/ui/components/table";
import { Badge } from "@tempo/ui/components/badge";

const PAGE_SIZE = 10;

function formatDateTime(value: string | null) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString("cs-CZ");
}

function formatCurrency(value: number | null, currency: string = "CZK") {
  if (value === null) {
    return "-";
  }

  return new Intl.NumberFormat("cs-CZ", {
    style: "currency",
    currency,
  }).format(value);
}

function getStatusBadge(status: string) {
  const statusMap: Record<
    string,
    {
      label: string;
      variant: "default" | "secondary" | "outline" | "destructive";
    }
  > = {
    draft: { label: "Koncept", variant: "outline" },
    issued: { label: "Vydáno", variant: "default" },
    paid: { label: "Zaplaceno", variant: "secondary" },
    overdue: { label: "Prošlé splatnosti", variant: "destructive" },
  };

  const config = statusMap[status] || { label: status, variant: "outline" };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export function InvoicesTable() {
  const [page, setPage] = useState(1);
  const workspaceHeader = getWorkspaceHeader();

  if (!workspaceHeader) {
    return null;
  }

  const { data, isLoading, isError, isFetching } = $api.useQuery(
    "get",
    "/api/v1/invoices",
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

  const invoices = data?.items ?? [];
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
      <div className="overflow-hidden rounded-xl border border-border/70 bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Číslo faktury</TableHead>
              <TableHead>Klient</TableHead>
              <TableHead>Stav</TableHead>
              <TableHead>Částka</TableHead>
              <TableHead>Datum vystavení</TableHead>
              <TableHead>Datum splatnosti</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-6 text-center text-muted-foreground"
                >
                  Načítám faktury...
                </TableCell>
              </TableRow>
            ) : null}

            {!isLoading && isError ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-6 text-center text-destructive"
                >
                  Faktury se nepodařilo načíst.
                </TableCell>
              </TableRow>
            ) : null}

            {!isLoading && !isError && invoices.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-6 text-center text-muted-foreground"
                >
                  Zatím nemáš žádné faktury.
                </TableCell>
              </TableRow>
            ) : null}

            {!isLoading && !isError
              ? invoices.map((invoice) => {
                  const invoiceId = (invoice as { id?: unknown }).id;
                  const hasInvoiceId = typeof invoiceId === "number";

                  return (
                    <TableRow
                      key={`${invoice.id ?? "draft"}-${invoice.created_at}`}
                    >
                      <TableCell className="py-3">
                        <div className="flex items-center gap-3">
                          {hasInvoiceId ? (
                            <Link
                              to="/app/invoices/$id"
                              params={{ id: String(invoiceId) }}
                              className="font-semibold underline-offset-4 hover:underline"
                            >
                              {(invoice as { number?: string }).number ??
                                "Koncept"}
                            </Link>
                          ) : (
                            <span className="font-semibold">
                              {(invoice as { number?: string }).number ??
                                "Koncept"}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <ColorAvatar
                            name={
                              (invoice as { client_name?: string })
                                .client_name ?? "Neznámý"
                            }
                            className="size-8 text-xs"
                          />
                          <span className="truncate">
                            {(invoice as { client_name?: string })
                              .client_name ?? "-"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(
                          (invoice as { status?: string }).status ?? "draft",
                        )}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(
                          (invoice as { total_amount?: number }).total_amount ??
                            0,
                          (invoice as { currency?: string }).currency,
                        )}
                      </TableCell>
                      <TableCell>
                        {formatDateTime(
                          (invoice as { issued_at?: string | null })
                            .issued_at ?? null,
                        )}
                      </TableCell>
                      <TableCell>
                        {formatDateTime(
                          (invoice as { due_date?: string | null }).due_date ??
                            null,
                        )}
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
                text="Předchozí"
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
                text="Další"
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
