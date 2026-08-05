import { useMemo, useState } from "react";

import { $api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { PaginationFooter } from "./components/pagination-footer";
import { ProjectRow } from "./components/project-row";
import { StateRow } from "./components/state-row";
import type { ProjectsResponse, ProjectsTableProps } from "./types";

const PAGE_SIZE = 5;

function getPageNumbers(page: number, totalPages: number) {
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
}

export function ProjectsTable({
  clientId = null,
  hideHeader = false,
  title,
  description,
  compact = false,
}: ProjectsTableProps) {
  const queryKey = clientId ?? "all";
  const [pageByFilter, setPageByFilter] = useState<Record<string, number>>({
    all: 1,
  });
  const [selectedProjectIds, setSelectedProjectIds] = useState<number[]>([]);

  const currentPage = pageByFilter[queryKey] ?? 1;

  const { mutateAsync: bulkDelete } = $api.useMutation(
    "delete",
    "/api/v1/projects/",
  );

  const { data, isLoading, isError, isFetching } = $api.useQuery(
    "get",
    "/api/v1/projects/",
    {
      params: {
        query: {
          page: currentPage,
          size: PAGE_SIZE,
          ...(clientId !== null ? { client_id: clientId } : {}),
        },
      },
    },
  );

  const response = data as ProjectsResponse | undefined;
  const projects = response?.items ?? [];
  const totalPages = Math.max(1, Number(response?.pages ?? 1));
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  const pageNumbers = useMemo(
    () => getPageNumbers(currentPage, totalPages),
    [currentPage, totalPages],
  );

  const handlePageChange = (nextPage: number) => {
    setPageByFilter((prev) => ({
      ...prev,
      [queryKey]: nextPage,
    }));
  };

  const handleToggleProjectSelection = (
    projectId: number,
    checked: boolean,
  ) => {
    setSelectedProjectIds((prev) =>
      checked
        ? prev.includes(projectId)
          ? prev
          : [...prev, projectId]
        : prev.filter((id) => id !== projectId),
    );
  };

  const handleToggleAllVisibleSelection = (checked: boolean) => {
    setSelectedProjectIds((prev) => {
      const next = new Set(prev);

      if (checked) {
        projects.forEach((project) => next.add(project.id));
      } else {
        projects.forEach((project) => next.delete(project.id));
      }

      return Array.from(next);
    });
  };

  const areAllVisibleSelected =
    projects.length > 0 &&
    projects.every((project) => selectedProjectIds.includes(project.id));

  const hasSelection = selectedProjectIds.length > 0;

  const handleBulkDelete = async () => {
    if (!hasSelection) {
      return;
    }

    await bulkDelete({
      body: {
        ids: selectedProjectIds,
      },
    });

    setSelectedProjectIds([]);
  };

  return (
    <div className="space-y-3">
      {!hideHeader ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            {title ? (
              <p className="text-sm font-medium text-foreground">{title}</p>
            ) : null}
            {description ? (
              <p className="text-xs text-muted-foreground">{description}</p>
            ) : null}
          </div>
        </div>
      ) : null}

      {hasSelection ? (
        <div className="flex items-center gap-2 rounded-none border border-border/70 bg-card px-3 py-2">
          <p className="text-sm text-foreground">
            Vybráno {selectedProjectIds.length} projektů
          </p>
          <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
            Smazat vybrané
          </Button>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-none border border-border/70 bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10 px-2">
                <Checkbox
                  checked={areAllVisibleSelected}
                  onCheckedChange={(checked) =>
                    handleToggleAllVisibleSelection(checked === true)
                  }
                  aria-label="Vybrat všechny projekty na stránce"
                />
              </TableHead>
              <TableHead>Projekt</TableHead>
              {!compact ? <TableHead>Klient</TableHead> : null}
              <TableHead>Vlastnik</TableHead>
              {!compact ? <TableHead>ID</TableHead> : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <StateRow
                colSpan={compact ? 4 : 5}
                message="Nacitam projekty..."
              />
            ) : null}

            {!isLoading && isError ? (
              <StateRow
                colSpan={compact ? 4 : 5}
                message="Projekty se nepodarilo nacist."
                tone="danger"
              />
            ) : null}

            {!isLoading && !isError && projects.length === 0 ? (
              <StateRow
                colSpan={compact ? 4 : 5}
                message="Zatim nemas zadne projekty."
              />
            ) : null}

            {!isLoading && !isError
              ? projects.map((project) => (
                  <ProjectRow
                    key={project.id}
                    project={project}
                    compact={compact}
                    isSelected={selectedProjectIds.includes(project.id)}
                    onToggleSelection={handleToggleProjectSelection}
                  />
                ))
              : null}
          </TableBody>
        </Table>
      </div>

      <PaginationFooter
        page={currentPage}
        totalPages={totalPages}
        isFetching={isFetching}
        isLoading={isLoading}
        canGoPrevious={canGoPrevious}
        canGoNext={canGoNext}
        pageNumbers={pageNumbers}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
