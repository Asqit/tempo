import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { $api } from "@/lib/api";

type ClientOption = {
  id: number;
  name: string;
};

type ClientPickerProps = {
  value: number | null;
  onChange: (nextValue: number) => void;
  disabled?: boolean;
  placeholder?: string;
};

function normalizeClients(data: unknown): ClientOption[] {
  if (!data || typeof data !== "object" || !("items" in data)) {
    return [];
  }

  const items = (data as { items?: unknown[] }).items;
  if (!Array.isArray(items)) {
    return [];
  }

  return items
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
      } satisfies ClientOption;
    })
    .filter((client): client is ClientOption => client !== null);
}

export function ClientPicker({
  value,
  onChange,
  disabled,
  placeholder = "Vyber klienta",
}: ClientPickerProps) {
  const { data, isLoading } = $api.useQuery("get", "/api/v1/clients/", {
    params: {
      query: {
        page: 1,
        size: 100,
      },
    },
  });

  const options = normalizeClients(data);
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
                ? "Nacitam klienty..."
                : options.length === 0
                  ? "Klienti nenalezeni"
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
