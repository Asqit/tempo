import { useMemo, type ReactElement } from "react";

import {
  EntityPicker,
  type EntityPickerProps,
  type PickerOption,
} from "@/components/ui/entity-picker";
import { $api, getWorkspaceHeader } from "@/lib/api";

type ProjectOption = PickerOption;
type ProjectTriggerProps = {
  selected: ProjectOption | null;
  disabled: boolean;
  isLoading: boolean;
  placeholder: string;
  id?: string;
};

function normalizeProjects(data: unknown): ProjectOption[] {
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

export type ProjectPickerProps =
  | {
      multiple?: false;
      value: number | null;
      onChange: (value: number) => void;
      disabled?: boolean;
      placeholder?: string;
      id?: string;
      trigger?: (props: ProjectTriggerProps) => ReactElement;
    }
  | {
      multiple: true;
      value: number[];
      onChange: (value: number[]) => void;
      disabled?: boolean;
      placeholder?: string;
      id?: string;
      trigger?: (props: {
        selected: ProjectOption[];
        disabled: boolean;
        isLoading: boolean;
        placeholder: string;
        id?: string;
      }) => ReactElement;
    };

export function ProjectPicker(props: ProjectPickerProps) {
  const workspaceHeader = getWorkspaceHeader();
  const { data, isLoading } = $api.useQuery("get", "/api/v1/projects/", {
    params: {
      query: { page: 1, size: 100 },
      header: workspaceHeader ?? { "X-Workspace-Id": 0 },
    },
    enabled: !!workspaceHeader,
  });
  const options = useMemo(() => normalizeProjects(data), [data]);

  if (!workspaceHeader) return null;

  const pickerProps = props as unknown as EntityPickerProps<ProjectOption>;

  return (
    <EntityPicker
      {...pickerProps}
      options={options}
      isLoading={isLoading}
      placeholder={props.placeholder ?? "Vyber projekt"}
      emptyLabel="Projekty nenalezeny"
      loadingLabel="Načítám projekty..."
    />
  );
}
