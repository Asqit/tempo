import { $api } from "@/lib/api";
import { Link } from "@tanstack/react-router";
import { Clock3, FolderKanban, TimerReset, Timer } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

function formatDuration(startTime: string, endTime: string | null) {
  const start = new Date(startTime).getTime();
  const end = endTime ? new Date(endTime).getTime() : Date.now();
  const totalSeconds = Math.max(0, Math.floor((end - start) / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function EntriesTable() {
  const { data, isLoading, isError } = $api.useQuery(
    "get",
    "/api/v1/time-entries/",
    {
      params: {
        query: {
          page: 1,
          size: 20,
        },
      },
    },
  );
  const { data: projectsData } = $api.useQuery("get", "/api/v1/projects/", {
    params: {
      query: {
        page: 1,
        size: 200,
      },
    },
  } as unknown as never);

  const entries = data?.items ?? [];
  const projectOptions = normalizeProjects(projectsData);
  const projectNameById = new Map<number, string>(
    projectOptions.map((project) => [project.id, project.name]),
  );

  return (
    <div className="overflow-hidden rounded-none border border-border/70 bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Úkol</TableHead>
            <TableHead>Projekt</TableHead>
            <TableHead>Start</TableHead>
            <TableHead>Konec</TableHead>
            <TableHead>Trvání</TableHead>
            <TableHead>Stav</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="py-6 text-center text-muted-foreground"
              >
                Načítám výkazy...
              </TableCell>
            </TableRow>
          ) : null}

          {!isLoading && isError ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="py-6 text-center text-destructive"
              >
                Nepodařilo se načíst výkazy.
              </TableCell>
            </TableRow>
          ) : null}

          {!isLoading && !isError && entries.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="py-6 text-center text-muted-foreground"
              >
                Zatím tu nejsou žádné výkazy.
              </TableCell>
            </TableRow>
          ) : null}

          {!isLoading && !isError
            ? entries.map((entry) => (
                <TableRow key={entry.id}>
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
                    <div className="inline-flex items-center gap-2 rounded-none border border-border/70 bg-muted/25 px-2 py-1 font-mono text-xs tabular-nums text-foreground">
                      <Timer className="size-3.5 text-muted-foreground" />
                      {formatDuration(entry.start_time, entry.end_time)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={
                        entry.end_time === null
                          ? "inline-flex items-center rounded-none bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary"
                          : "inline-flex items-center rounded-none bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground"
                      }
                    >
                      {entry.end_time === null ? "Běží" : "Ukončeno"}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            : null}
        </TableBody>
      </Table>
    </div>
  );
}
