import { useMemo, useState } from "react";

import { $api, getWorkspaceHeader } from "@/lib/api";
import { Link } from "@tanstack/react-router";
import { Clock3, FolderKanban, TimerReset, Timer, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { TimeEntryUpdateDialog } from "./time-entry-update-dialog";

import { queryClient } from "@/lib/api";
import { durationSecondsBetween, formatDuration } from "@/lib/time";

type EntriesTableProps = {
  projectId?: number | null;
  size?: number;
  showProjectColumn?: boolean;
  showSelection?: boolean;
  showQuickActions?: boolean;
};

type ProjectOption = {
  id: number;
  name: string;
};

function normalizeProjects(data: unknown): ProjectOption[] {
  const source =
    data &&
    typeof data === "object" &&
    "items" in data &&
    Array.isArray((data as { items?: unknown[] }).items)
      ? (data as { items: unknown[] }).items
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

function formatDateTime(value: string | null) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString("cs-CZ");
}

export function EntriesTable({
  projectId,
  size = 20,
  showProjectColumn = true,
  showSelection = false,
  showQuickActions = false,
}: EntriesTableProps) {
  const resolvedSize = Math.min(100, Math.max(1, size));
  const [selectedEntryIds, setSelectedEntryIds] = useState<number[]>([]);
  const workspaceHeader = getWorkspaceHeader();

  if (!workspaceHeader) {
    return null;
  }

  const { data, isLoading, isError } = $api.useQuery(
    "get",
    "/api/v1/time-entries/",
    {
      params: {
        query: {
          page: 1,
          size: resolvedSize,
          ...(typeof projectId === "number" ? { project_id: projectId } : {}),
        },
        header: workspaceHeader,
      },
    },
  );
  const { data: projectsData } = $api.useQuery("get", "/api/v1/projects/", {
    params: {
      query: {
        page: 1,
        size: 100,
        client_id: 0,
      },
      header: workspaceHeader,
    },
    enabled: showProjectColumn,
  } as unknown as never);
  const { mutateAsync: deleteTimeEntry, isPending: isDeleting } =
    $api.useMutation("delete", "/api/v1/time-entries/{id}");
  const { mutateAsync: bulkDeleteTimeEntries, isPending: isBulkDeleting } =
    $api.useMutation("delete", "/api/v1/time-entries/");

  const entries = useMemo(() => data?.items ?? [], [data]);
  const entryIds = useMemo(() => entries.map((entry) => entry.id), [entries]);
  const visibleIdSet = useMemo(() => new Set(entryIds), [entryIds]);
  const visibleSelectedIds = useMemo(
    () => selectedEntryIds.filter((id) => visibleIdSet.has(id)),
    [selectedEntryIds, visibleIdSet],
  );

  const projectOptions = normalizeProjects(projectsData);
  const projectNameById = new Map<number, string>(
    projectOptions.map((project) => [project.id, project.name]),
  );

  const selectedCount = visibleSelectedIds.length;
  const allVisibleSelected =
    entries.length > 0 && selectedCount === entries.length;

  const handleToggleOne = (entryId: number, checked: boolean) => {
    setSelectedEntryIds((current) => {
      if (checked) {
        if (current.includes(entryId)) {
          return current;
        }

        return [...current, entryId];
      }

      return current.filter((id) => id !== entryId);
    });
  };

  const handleToggleAll = (checked: boolean) => {
    if (checked) {
      setSelectedEntryIds(entryIds);
      return;
    }

    setSelectedEntryIds([]);
  };

  const invalidateEntries = async () => {
    await queryClient.invalidateQueries({
      queryKey: ["get", "/api/v1/time-entries/"],
    });
  };

  const handleDeleteSingle = async (entryId: number) => {
    const confirmed = window.confirm("Opravdu chcete smazat tento vykaz?");
    if (!confirmed) {
      return;
    }

    try {
      await deleteTimeEntry({
        params: {
          path: {
            id: entryId,
          },
          header: workspaceHeader,
        },
      });

      setSelectedEntryIds((current) => current.filter((id) => id !== entryId));
      await invalidateEntries();
      toast.success("Vykaz byl smazan.");
    } catch {
      toast.error("Nepodarilo se smazat vykaz.");
    }
  };

  const handleDeleteSelected = async () => {
    if (visibleSelectedIds.length === 0) {
      return;
    }

    const confirmed = window.confirm(
      `Opravdu chcete smazat ${visibleSelectedIds.length} vybranych vykazu?`,
    );
    if (!confirmed) {
      return;
    }

    try {
      await bulkDeleteTimeEntries({
        params: {
          header: workspaceHeader,
        },
        body: {
          ids: visibleSelectedIds,
        },
      });

      setSelectedEntryIds([]);
      await invalidateEntries();
      toast.success("Vybrane vykazy byly smazany.");
    } catch {
      toast.error("Mazani vybranych vykazu selhalo.");
    }
  };

  const totalColumns =
    (showSelection ? 1 : 0) +
    1 +
    (showProjectColumn ? 1 : 0) +
    1 +
    1 +
    1 +
    1 +
    (showQuickActions ? 1 : 0);

  return (
    <div className="space-y-2">
      {showSelection ? (
        <div className="flex items-center justify-between rounded-lg border border-border/70 bg-card px-3 py-2">
          <p className="text-xs text-muted-foreground">
            {selectedCount > 0
              ? `Vybrano: ${selectedCount}`
              : "Vyberte radky pro hromadnou akci"}
          </p>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            disabled={selectedCount === 0 || isDeleting || isBulkDeleting}
            onClick={() => void handleDeleteSelected()}
          >
            <Trash2 className="size-3.5" />
            Smazat vybrane
          </Button>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-border/70 bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              {showSelection ? (
                <TableHead className="w-10 px-2">
                  <Checkbox
                    checked={allVisibleSelected}
                    onCheckedChange={(checked) =>
                      handleToggleAll(checked === true)
                    }
                    aria-label="Vybrat vsechny vykazy"
                  />
                </TableHead>
              ) : null}
              <TableHead>Úkol</TableHead>
              {showProjectColumn ? <TableHead>Projekt</TableHead> : null}
              <TableHead>Start</TableHead>
              <TableHead>Konec</TableHead>
              <TableHead>Trvání</TableHead>
              <TableHead>Stav</TableHead>
              {showQuickActions ? (
                <TableHead className="w-24">Akce</TableHead>
              ) : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={totalColumns}
                  className="py-6 text-center text-muted-foreground"
                >
                  Načítám výkazy...
                </TableCell>
              </TableRow>
            ) : null}

            {!isLoading && isError ? (
              <TableRow>
                <TableCell
                  colSpan={totalColumns}
                  className="py-6 text-center text-destructive"
                >
                  Nepodařilo se načíst výkazy.
                </TableCell>
              </TableRow>
            ) : null}

            {!isLoading && !isError && entries.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={totalColumns}
                  className="py-6 text-center text-muted-foreground"
                >
                  Zatím tu nejsou žádné výkazy.
                </TableCell>
              </TableRow>
            ) : null}

            {!isLoading && !isError
              ? entries.map((entry) => (
                  <TableRow key={entry.id}>
                    {showSelection ? (
                      <TableCell className="w-10 px-2">
                        <Checkbox
                          checked={visibleSelectedIds.includes(entry.id)}
                          onCheckedChange={(checked) =>
                            handleToggleOne(entry.id, checked === true)
                          }
                          aria-label={`Vybrat vykaz ${entry.id}`}
                        />
                      </TableCell>
                    ) : null}
                    <TableCell className="py-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">
                          {entry.description || "Bez popisu"}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Výkaz #{entry.id}
                        </p>
                      </div>
                    </TableCell>
                    {showProjectColumn ? (
                      <TableCell>
                        {entry.project_id ? (
                          <Link
                            to="/app/projects/$id"
                            params={{ id: String(entry.project_id) }}
                            className="inline-flex items-center gap-2 font-medium text-foreground underline-offset-4 hover:underline"
                          >
                            <FolderKanban className="size-4 text-muted-foreground" />
                            <span className="truncate">
                              {projectNameById.get(entry.project_id) ??
                                `Projekt #${entry.project_id}`}
                            </span>
                          </Link>
                        ) : (
                          <span className="text-muted-foreground">
                            Bez projektu
                          </span>
                        )}
                      </TableCell>
                    ) : null}
                    <TableCell>
                      <div className="inline-flex items-center gap-2 text-sm">
                        <Clock3 className="size-4 text-muted-foreground" />
                        <span>{formatDateTime(entry.start_time)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="inline-flex items-center gap-2 text-sm">
                        <TimerReset className="size-4 text-muted-foreground" />
                        <span>{formatDateTime(entry.end_time)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="inline-flex items-center gap-2 rounded-md border border-border/70 bg-muted/25 px-2 py-1 font-mono text-xs tabular-nums text-foreground">
                        <Timer className="size-3.5 text-muted-foreground" />
                        {formatDuration(
                          durationSecondsBetween(entry.start_time, entry.end_time),
                          "clock",
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={
                          entry.end_time === null
                            ? "inline-flex items-center rounded-full bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary"
                            : "inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground"
                        }
                      >
                        {entry.end_time === null ? "Běží" : "Ukončeno"}
                      </span>
                    </TableCell>
                    {showQuickActions ? (
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <TimeEntryUpdateDialog
                            entry={{
                              id: entry.id,
                              description: entry.description,
                              project_id: entry.project_id,
                              start_time: entry.start_time,
                              end_time: entry.end_time,
                              billable: entry.billable,
                            }}
                            onUpdated={() => {
                              void invalidateEntries();
                            }}
                          />

                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={isDeleting || isBulkDeleting}
                            onClick={() => void handleDeleteSingle(entry.id)}
                            aria-label={`Smazat vykaz ${entry.id}`}
                          >
                            <Trash2 className="size-3.5" />
                            Smazat
                          </Button>
                        </div>
                      </TableCell>
                    ) : null}
                  </TableRow>
                ))
              : null}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
