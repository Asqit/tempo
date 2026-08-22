import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { $api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";

const TYPE_LABELS: Record<string, string> = {
  workspace_invite: "Pozvánka do workspace",
  workspace_removed: "Odebrání z workspace",
};

export function UnreadNotifications() {
  const { data, isLoading } = $api.useQuery("get", "/api/v1/notifications/", {
    params: {
      query: {
        unread: true,
      },
    },
  });

  const count = data?.items.length ?? 0;

  return (
    <Popover>
      <PopoverTrigger render={<Button variant="ghost" className="relative" />}>
        <Bell />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-medium text-white">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </PopoverTrigger>

      <PopoverContent className="w-80">
        <PopoverHeader>
          <PopoverTitle>Notifikace</PopoverTitle>
          <PopoverDescription>
            {count > 0 ? `${count} nepřečtených` : "Nic nového"}
          </PopoverDescription>
        </PopoverHeader>

        <div className="mt-2 max-h-80 space-y-1 overflow-y-auto">
          {isLoading && (
            <p className="text-sm text-muted-foreground p-2">Načítám…</p>
          )}

          {!isLoading && count === 0 && (
            <p className="text-sm text-muted-foreground p-2">
              Žádné nepřečtené notifikace.
            </p>
          )}

          {data?.items.map((item) => (
            <div
              key={item.id}
              className="rounded-md p-2 text-sm hover:bg-muted"
            >
              <p className="font-medium">
                {TYPE_LABELS[item.type] ?? item.type}
              </p>
              {typeof item.payload?.message === "string" && (
                <p className="text-muted-foreground">{item.payload.message}</p>
              )}
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
