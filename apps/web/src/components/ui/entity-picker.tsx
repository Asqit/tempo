import { type ReactElement } from "react";
import { ChevronsUpDownIcon } from "lucide-react";

import { Checkbox } from "@tempo/ui/components/checkbox";
import { Button } from "@tempo/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@tempo/ui/components/dropdown-menu";

export type PickerOption = { id: number; name: string };

type PickerTriggerProps<T extends PickerOption> = {
  selected: T | null | T[];
  disabled: boolean;
  isLoading: boolean;
  placeholder: string;
  id?: string;
};

type PickerCommonProps<T extends PickerOption> = {
  options: T[];
  isLoading: boolean;
  disabled?: boolean;
  placeholder: string;
  emptyLabel: string;
  loadingLabel: string;
  id?: string;
  trigger?: (props: PickerTriggerProps<T>) => ReactElement;
  getOptionLabel?: (option: T) => string;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
};

type PickerSingleProps<T extends PickerOption> = PickerCommonProps<T> & {
  multiple?: false;
  value: number | null;
  onChange: (value: number) => void;
};

type PickerMultipleProps<T extends PickerOption> = PickerCommonProps<T> & {
  multiple: true;
  value: number[];
  onChange: (value: number[]) => void;
};

export type EntityPickerProps<T extends PickerOption> =
  PickerSingleProps<T> | PickerMultipleProps<T>;

type PickerViewProps<T extends PickerOption> =
  | PickerSingleProps<T>
  | PickerMultipleProps<T>;

function PickerTrigger<T extends PickerOption>({
  multiple,
  selected,
  disabled,
  isLoading,
  placeholder,
  emptyLabel,
  loadingLabel,
  id,
  trigger,
}: Omit<PickerViewProps<T>, "options"> & { selected: T | null | T[] }) {
  disabled = disabled ?? false;
  return (
    <DropdownMenuTrigger
      render={
        trigger ? (
          trigger({ selected, disabled, isLoading, placeholder, id })
        ) : (
          <Button
            type="button"
            variant="outline"
            id={id}
            disabled={disabled}
            className="min-w-48 justify-between"
          >
            <span className="truncate">
              {multiple
                ? Array.isArray(selected) && selected.length > 0
                  ? `${selected.length} vybráno`
                  : isLoading
                    ? loadingLabel
                    : placeholder
                : !Array.isArray(selected) && selected
                  ? selected.name
                  : isLoading
                    ? loadingLabel
                    : emptyLabel}
            </span>
            <ChevronsUpDownIcon className="size-4 shrink-0" />
          </Button>
        )
      }
    />
  );
}

function SinglePicker<T extends PickerOption>(props: PickerSingleProps<T>) {
  const { options, value, onChange, getOptionLabel } = props;
  const commonProps = {
    disabled: props.disabled,
    placeholder: props.placeholder,
    emptyLabel: props.emptyLabel,
    loadingLabel: props.loadingLabel,
    id: props.id,
    trigger: props.trigger,
    hasMore: props.hasMore,
    isLoadingMore: props.isLoadingMore,
    onLoadMore: props.onLoadMore,
    isLoading: props.isLoading,
  };
  const selected = options.find((option) => option.id === value) ?? null;

  return (
    <DropdownMenu>
      <PickerTrigger
        {...commonProps}
        multiple={false}
        value={value}
        onChange={onChange}
        selected={selected}
      />
      <PickerContent
        {...commonProps}
        multiple={false}
        value={value}
        onChange={onChange}
        options={options}
        getOptionLabel={getOptionLabel}
      />
    </DropdownMenu>
  );
}

function MultiplePicker<T extends PickerOption>(props: PickerMultipleProps<T>) {
  const { options, value, onChange, getOptionLabel } = props;
  const selectedIds = Array.isArray(value) ? value : [];
  const selected = options.filter((option) => selectedIds.includes(option.id));
  const commonProps = {
    disabled: props.disabled,
    placeholder: props.placeholder,
    emptyLabel: props.emptyLabel,
    loadingLabel: props.loadingLabel,
    id: props.id,
    trigger: props.trigger,
    hasMore: props.hasMore,
    isLoadingMore: props.isLoadingMore,
    onLoadMore: props.onLoadMore,
    isLoading: props.isLoading,
  };

  return (
    <DropdownMenu>
      <PickerTrigger
        {...commonProps}
        multiple
        value={value}
        onChange={onChange}
        selected={selected}
      />
      <PickerContent
        {...commonProps}
        multiple
        value={selectedIds}
        onChange={onChange}
        options={options}
        getOptionLabel={getOptionLabel}
      />
    </DropdownMenu>
  );
}

function PickerContent<T extends PickerOption>(props: PickerViewProps<T>) {
  const {
    options,
    multiple,
    value,
    onChange,
    getOptionLabel = (option) => option.name,
    emptyLabel,
    loadingLabel,
    hasMore,
    isLoadingMore,
    onLoadMore,
  } = props;
  const selectedIds = Array.isArray(value) ? value : [];

  return (
    <DropdownMenuContent className="w-64">
      {options.length > 0 ? (
        options.map((option) => {
          const isSelected = multiple
            ? selectedIds.includes(option.id)
            : option.id === value;

          return (
            <DropdownMenuItem
              key={option.id}
              aria-checked={isSelected}
              onClick={(event) => {
                if (multiple) {
                  event.preventDefault();
                  onChange(
                    isSelected
                      ? selectedIds.filter((id) => id !== option.id)
                      : [...selectedIds, option.id],
                  );
                } else {
                  onChange(option.id);
                }
              }}
              className="justify-between"
            >
              <span className="flex min-w-0 items-center gap-2">
                {multiple ? (
                  <Checkbox
                    checked={isSelected}
                    tabIndex={-1}
                    aria-hidden="true"
                    className="pointer-events-none"
                  />
                ) : null}
                <span className="truncate">{getOptionLabel(option)}</span>
              </span>
            </DropdownMenuItem>
          );
        })
      ) : (
        <div className="px-2 py-1.5 text-sm text-muted-foreground">
          {props.isLoading ? loadingLabel : emptyLabel}
        </div>
      )}

      {hasMore && onLoadMore ? (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            disabled={isLoadingMore}
            onClick={(event) => {
              event.preventDefault();
              onLoadMore();
            }}
            className="justify-center"
          >
            {isLoadingMore ? "Načítám další..." : "Zobrazit další"}
          </DropdownMenuItem>
        </>
      ) : null}
    </DropdownMenuContent>
  );
}

export function EntityPicker<T extends PickerOption>(
  props: EntityPickerProps<T>,
) {
  if (props.multiple) {
    return <MultiplePicker {...(props as PickerMultipleProps<T>)} />;
  }
  return <SinglePicker {...(props as PickerSingleProps<T>)} />;
}
