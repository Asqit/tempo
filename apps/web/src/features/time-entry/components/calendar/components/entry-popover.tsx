import type { components } from "@/lib/api.d";
import type { ReactNode } from "react";
import { TimeEntryUpdateForm } from "../../time-entry-update-form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Props {
  entry: components["schemas"]["TimeEntryRead"];
  children: ReactNode;
}

export function EntryPopover({ entry, children }: Props) {
  return (
    <Popover>
      <PopoverTrigger render={children} />
      <PopoverContent className="w-80">
        <TimeEntryUpdateForm
          id={entry.id}
          initialBillable={entry.billable}
          initialProjectId={entry.project_id}
          initialDescription={entry.description}
          initialEndTime={entry.end_time}
          initialStartTime={entry.start_time}
        />
      </PopoverContent>
    </Popover>
  );
}
