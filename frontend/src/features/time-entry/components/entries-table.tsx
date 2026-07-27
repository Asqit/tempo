import { $api } from "@/lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function formatDateTime(value: string | null) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString();
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

  const entries = data?.items ?? [];

  return (
    <div className="mt-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Description</TableHead>
            <TableHead>Project</TableHead>
            <TableHead>Start</TableHead>
            <TableHead>End</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-muted-foreground">
                Loading entries...
              </TableCell>
            </TableRow>
          ) : null}

          {!isLoading && isError ? (
            <TableRow>
              <TableCell colSpan={6} className="text-destructive">
                Could not load entries.
              </TableCell>
            </TableRow>
          ) : null}

          {!isLoading && !isError && entries.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-muted-foreground">
                No entries yet.
              </TableCell>
            </TableRow>
          ) : null}

          {!isLoading && !isError
            ? entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{entry.description || "-"}</TableCell>
                  <TableCell>{entry.project?.name ?? "-"}</TableCell>
                  <TableCell>{formatDateTime(entry.start_time)}</TableCell>
                  <TableCell>{formatDateTime(entry.end_time)}</TableCell>
                  <TableCell>
                    {formatDuration(entry.start_time, entry.end_time)}
                  </TableCell>
                  <TableCell>
                    {entry.end_time === null ? "Running" : "Stopped"}
                  </TableCell>
                </TableRow>
              ))
            : null}
        </TableBody>
      </Table>
    </div>
  );
}
