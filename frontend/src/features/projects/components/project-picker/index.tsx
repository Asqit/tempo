import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { $api } from "@/lib/api";

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
  disabled,
  placeholder = "Vyber projekt",
}: ProjectPickerProps) {
  const { data, isLoading } = $api.useQuery("get", "/api/v1/projects/");

  const options = normalizeProjects(data);
  const selected = options.find((option) => option.id === value) ?? null;
  const isDisabled = disabled || isLoading || options.length === 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={isDisabled}
          className="min-w-48 justify-between"
        >
          <span className="truncate">
            {selected?.name ??
              (isLoading
                ? "Nacitam projekty..."
                : options.length === 0
                  ? "Projekty nenalezeny"
                  : placeholder)}
          </span>
          <ChevronsUpDownIcon className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64">
        {options.map((option) => (
          <DropdownMenuItem
            key={option.id}
            onClick={() => onChange(option.id)}
            className="justify-between"
          >
            <span className="truncate">{option.name}</span>
            {value === option.id ? <CheckIcon className="size-4" /> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
