import { useMemo, useState, type ReactElement } from "react";

import {
  EntityPicker,
  type EntityPickerProps,
  type PickerOption,
} from "@/components/ui/entity-picker";
import { $api, getWorkspaceHeader } from "@/lib/api";

type ClientOption = PickerOption;
type ClientTriggerProps = {
  selected: ClientOption | null;
  disabled: boolean;
  isLoading: boolean;
  placeholder: string;
  id?: string;
};

function normalizeClients(data: unknown): ClientOption[] {
  if (!data || typeof data !== "object" || !("items" in data)) return [];
  const items = (data as { items?: unknown }).items;
  if (!Array.isArray(items)) return [];

  return items.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const raw = item as { id?: unknown; name?: unknown };
    return typeof raw.id === "number" && typeof raw.name === "string"
      ? [{ id: raw.id, name: raw.name }]
      : [];
  });
}

export type ClientPickerProps =
  | {
      multiple?: false;
      value: number | null;
      onChange: (value: number) => void;
      disabled?: boolean;
      placeholder?: string;
      id?: string;
      trigger?: (props: ClientTriggerProps) => ReactElement;
    }
  | {
      multiple: true;
      value: number[];
      onChange: (value: number[]) => void;
      disabled?: boolean;
      placeholder?: string;
      id?: string;
      trigger?: (props: {
        selected: ClientOption[];
        disabled: boolean;
        isLoading: boolean;
        placeholder: string;
        id?: string;
      }) => ReactElement;
    };

export function ClientPicker(props: ClientPickerProps) {
  const workspaceHeader = getWorkspaceHeader();
  const [pageSize, setPageSize] = useState(10);
  const { data, isLoading, isFetching } = $api.useQuery(
    "get",
    "/api/v1/clients/",
    {
      params: {
        query: { page: 1, size: pageSize },
        header: workspaceHeader ?? { "X-Workspace-Id": 0 },
      },
      enabled: !!workspaceHeader,
    },
  );
  const options = useMemo(() => normalizeClients(data), [data]);
  const total =
    data && typeof data === "object" && "total" in data &&
    typeof data.total === "number"
      ? data.total
      : options.length;

  if (!workspaceHeader) return null;

  const pickerProps = props as unknown as EntityPickerProps<ClientOption>;

  return (
    <EntityPicker
      {...pickerProps}
      options={options}
      isLoading={isLoading}
      placeholder={props.placeholder ?? "Vyber klienta"}
      emptyLabel="Klienti nenalezeni"
      loadingLabel="Načítám klienty..."
      hasMore={pageSize < 100 && total > options.length}
      isLoadingMore={isFetching}
      onLoadMore={() => setPageSize((current) => Math.min(100, current + 10))}
    />
  );
}
