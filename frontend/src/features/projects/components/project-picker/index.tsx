import { useMemo } from "react";
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { $api, getWorkspaceHeader } from "@/lib/api";

type ProjectOption = {
  id: number;
  name: string;
};

type ProjectPickerProps = {
  value: number | null;
  onChange: (nextValue: number) => void;
  disabled?: boolean;
  placeholder?: string;
};

function normalizeProjects(data: unknown): ProjectOption[] {
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

export function ProjectPicker({
  value,
  onChange,
  disabled = false,
  placeholder = "Vyber projekt",
}: ProjectPickerProps) {
  const workspaceHeader = getWorkspaceHeader();

  const { data, isLoading } = $api.useQuery("get", "/api/v1/projects/", {
    params: {
      query: {
        page: 1,
        size: 100,
      },
      header: workspaceHeader ?? { "X-Workspace-Id": 0 },
    },
    enabled: !!workspaceHeader,
  } as unknown as never);

  const options = useMemo(() => normalizeProjects(data), [data]);

  const selected = useMemo(
    () => options.find((option) => option.id === value) ?? null,
    [options, value],
  );

  const isDisabled = disabled || isLoading || options.length === 0;

  if (!workspaceHeader) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="outline"
            disabled={isDisabled}
            className="min-w-48 justify-between"
          />
        }
      >
        <span className="truncate">
          {selected?.name ??
            (isLoading
              ? "Načítám projekty..."
              : options.length
                ? placeholder
                : "Projekty nenalezeny")}
        </span>

        <ChevronsUpDownIcon className="size-4" />
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-64">
        {options.length > 0 ? (
          options.map((option) => (
            <DropdownMenuItem
              key={option.id}
              onSelect={() => onChange(option.id)}
              className="justify-between"
            >
              <span className="truncate">{option.name}</span>

              {value === option.id ? <CheckIcon className="size-4" /> : null}
            </DropdownMenuItem>
          ))
        ) : (
          <div className="px-2 py-1.5 text-sm text-muted-foreground">
            {isLoading ? "Načítám projekty..." : "Projekty nenalezeny"}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
