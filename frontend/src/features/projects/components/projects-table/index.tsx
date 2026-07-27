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

type ProjectRow = {
  id: number;
  name: string;
  clientName: string;
  ownerName: string;
};

const PAGE_SIZE = 10;

function normalizeProjects(data: unknown): ProjectRow[] {
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

      const row = item as {
        id?: unknown;
        name?: unknown;
        client?: { name?: unknown } | null;
        user?: { name?: unknown } | null;
      };

      if (typeof row.id !== "number" || typeof row.name !== "string") {
        return null;
      }

      return {
        id: row.id,
        name: row.name,
        clientName:
          row.client && typeof row.client.name === "string"
            ? row.client.name
            : "-",
        ownerName:
          row.user && typeof row.user.name === "string" ? row.user.name : "-",
      } satisfies ProjectRow;
    })
    .filter((row): row is ProjectRow => row !== null);
}

export function ProjectsTable() {
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, isFetching } = $api.useQuery(
    "get",
    "/api/v1/projects/",
    {
      params: {
        query: {
          page,
          size: PAGE_SIZE,
        },
      },
    } as unknown as never,
  );

  const projects = useMemo(() => normalizeProjects(data), [data]);
  const totalPages =
    data && typeof data === "object" && "pages" in data
      ? Math.max(1, Number((data as { pages?: unknown }).pages) || 1)
      : 1;
  const canGoPrevious = page > 1;
  const canGoNext = page < totalPages;

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

  return (
    <div className="space-y-3">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Projekt</TableHead>
            <TableHead>Klient</TableHead>
            <TableHead>Vlastnik</TableHead>
            <TableHead>ID</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={4} className="text-muted-foreground">
                Nacitam projekty...
              </TableCell>
            </TableRow>
          ) : null}

          {!isLoading && isError ? (
            <TableRow>
              <TableCell colSpan={4} className="text-destructive">
                Projekty se nepodarilo nacist.
              </TableCell>
            </TableRow>
          ) : null}

          {!isLoading && !isError && projects.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-muted-foreground">
                Zatim nemas zadne projekty.
              </TableCell>
            </TableRow>
          ) : null}

          {!isLoading && !isError
            ? projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">
                    <Link
                      to="/app/projects/$id"
                      params={{ id: String(project.id) }}
                      className="underline-offset-4 hover:underline"
                    >
                      {project.name}
                    </Link>
                  </TableCell>
                  <TableCell>{project.clientName}</TableCell>
                  <TableCell>{project.ownerName}</TableCell>
                  <TableCell>#{project.id}</TableCell>
                </TableRow>
              ))
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
