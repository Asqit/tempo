import { Button } from "@tempo/ui/components/button";
import { Checkbox } from "@tempo/ui/components/checkbox";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@tempo/ui/components/table";
import { useWorkspaceStore } from "@/features/workspaces/store";
import { $api } from "@/lib/api";
import { useMemo, useState } from "react";
import { StateRow } from "./components/state-row";
import { ProjectRow } from "./components/project-row";

interface Props {
  clientId: number | null;
  hideHeader?: boolean;
  title?: string;
  description?: string;
  compact?: boolean;
}

export function ProjectsTable(props: Props) {
  const { clientId, hideHeader, title, description, compact } = props;
  const { activeWorkspace } = useWorkspaceStore();
  const [selectedProjectIds, setSelectedProjectIds] = useState<number[]>([]);

  const workspaceHeader = { "X-Workspace-Id": activeWorkspace! };

  const { data, isLoading, isError, isFetching, hasNextPage, fetchNextPage } =
    $api.useInfiniteQuery(
      "get",
      "/api/v1/projects/",
      {
        params: {
          query: { client_id: clientId! },
          header: workspaceHeader,
        },
      },
      {
        pageParamName: "page",
        initialPageParam: 1,
        getNextPageParam: (last) =>
          last.page >= last.pages ? undefined : last.page + 1,
      },
    );

  const projects = useMemo(
    () => data?.pages?.flatMap((p) => p.items ?? []) ?? [],
    [data],
  );

  const { mutateAsync: bulkDelete } = $api.useMutation(
    "delete",
    "/api/v1/projects/",
  );

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
        projects.forEach((p) => next.add(p.id));
      } else {
        projects.forEach((p) => next.delete(p.id));
      }
      return Array.from(next);
    });
  };

  const areAllVisibleSelected =
    projects.length > 0 &&
    projects.every((p) => selectedProjectIds.includes(p.id));

  const hasSelection = selectedProjectIds.length > 0;

  const handleBulkDelete = async () => {
    if (!hasSelection) return;

    await bulkDelete({
      params: {
        query: { client_id: clientId! },
        header: workspaceHeader,
      },
      body: { ids: selectedProjectIds },
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
        <div className="flex items-center gap-2 rounded-lg border border-border/70 bg-card px-3 py-2">
          <p className="text-sm text-foreground">
            Vybráno {selectedProjectIds.length} projektů
          </p>
          <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
            Smazat vybrané
          </Button>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-border/70 bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10 px-2">
                <Checkbox
                  checked={areAllVisibleSelected}
                  onCheckedChange={(checked) =>
                    handleToggleAllVisibleSelection(checked === true)
                  }
                  aria-label="Vybrat všechny načtené projekty"
                />
              </TableHead>
              <TableHead>Projekt</TableHead>
              {!compact ? <TableHead>Klient</TableHead> : null}
              <TableHead>Vlastník</TableHead>
              {!compact ? <TableHead>ID</TableHead> : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <StateRow
                colSpan={compact ? 4 : 5}
                message="Načítám projekty..."
              />
            ) : null}

            {!isLoading && isError ? (
              <StateRow
                colSpan={compact ? 4 : 5}
                message="Projekty se nepodařilo načíst."
                tone="danger"
              />
            ) : null}

            {!isLoading && !isError && projects.length === 0 ? (
              <StateRow
                colSpan={compact ? 4 : 5}
                message="Zatím nemáš žádné projekty."
              />
            ) : null}

            {!isLoading && !isError
              ? projects.map((project) => (
                  <ProjectRow
                    key={project.id}
                    project={project}
                    compact={Boolean(compact)}
                    isSelected={selectedProjectIds.includes(project.id)}
                    onToggleSelection={handleToggleProjectSelection}
                  />
                ))
              : null}
          </TableBody>
        </Table>
      </div>

      {hasNextPage ? (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => fetchNextPage()}
          disabled={isFetching}
        >
          {isFetching ? "Načítám..." : "Načíst další"}
        </Button>
      ) : null}
    </div>
  );
}
