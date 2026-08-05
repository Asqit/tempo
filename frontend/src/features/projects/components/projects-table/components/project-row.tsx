import { Link } from "@tanstack/react-router";
import { Building2, FolderKanban, UserRound } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { TableCell, TableRow } from "@/components/ui/table";
import { generateColorFromString } from "@/lib/utils";

import type { ProjectItem } from "../types";
import { ColorAvatar } from "@/components/share/color-avatar";

type ProjectRowProps = {
  project: ProjectItem;
  compact: boolean;
  isSelected: boolean;
  onToggleSelection: (projectId: number, checked: boolean) => void;
};

export function ProjectRow({
  project,
  compact,
  isSelected,
  onToggleSelection,
}: ProjectRowProps) {
  const hasClient = Boolean(project.client);
  const clientName = project.client?.name ?? "Bez klienta";
  const colors = generateColorFromString(hasClient ? clientName : project.name);

  const ownerName = project.client?.user?.name ?? "Bez vlastníka";

  return (
    <TableRow key={project.id}>
      <TableCell className="w-10 px-2">
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) =>
            onToggleSelection(project.id, checked === true)
          }
          aria-label={`Vybrat projekt ${project.name}`}
        />
      </TableCell>
      <TableCell className="py-3">
        <div className="flex items-start gap-3">
          {hasClient ? (
            <ColorAvatar name={clientName} className="size-9" />
          ) : (
            <div
              style={{
                backgroundColor: colors.bg,
                color: colors.fg,
              }}
              className="mt-0.5 flex size-9 items-center justify-center rounded-full bg-muted/50 text-foreground"
            >
              <FolderKanban className="size-4" />
            </div>
          )}

          <div className="min-w-0">
            <Link
              to="/app/projects/$id"
              params={{ id: String(project.id) }}
              className="block truncate font-semibold underline-offset-4 hover:underline"
              style={{
                color: colors.bg,
              }}
            >
              {project.name}
            </Link>
            <p className="mt-1 text-xs text-muted-foreground">
              Projekt #{project.id}
            </p>
          </div>
        </div>
      </TableCell>
      {!compact ? (
        <TableCell>
          <div className="flex items-center gap-2">
            <Building2 className="size-4 text-muted-foreground" />
            {project.client?.id ? (
              <Link
                to="/app/clients/$id"
                params={{ id: String(project.client.id) }}
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                {clientName}
              </Link>
            ) : (
              <span className="font-medium text-foreground">{clientName}</span>
            )}
          </div>
        </TableCell>
      ) : null}
      <TableCell>
        <div className="flex items-center gap-2">
          <UserRound className="size-4 text-muted-foreground" />
          <span>{ownerName}</span>
        </div>
      </TableCell>
      {!compact ? (
        <TableCell>
          <span className="inline-flex items-center rounded-none border border-border/70 bg-muted/40 px-2.5 py-1 text-xs font-medium text-muted-foreground">
            Aktivní
          </span>
        </TableCell>
      ) : null}
    </TableRow>
  );
}
