import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { $api, queryClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import type { components } from "@/lib/api.d";
import { Check, Bell } from "lucide-react";
import { toast } from "sonner";

const TYPE_LABELS: Record<string, string> = {
  workspace_invite: "Pozvánka do workspace",
  workspace_removed: "Odebrání z workspace",
};

function getNotificationMessage(
  item: components["schemas"]["NotificationRead"],
) {
  if (item.payload.type === "workspace_invite") {
    return `${item.payload.invited_by_name} vás pozval do workspace „${item.payload.workspace_name}“. Role: ${item.payload.role}.`;
  }

  return `${item.payload.removed_by_name} vás odebral z workspace „${item.payload.workspace_name}“.`;
}

export function UnreadNotifications() {
  const { data, isLoading } = $api.useQuery("get", "/api/v1/notifications/", {
    params: {
      query: {
        unread: true,
      },
    },
  });
  const { mutateAsync: markAsRead, isPending: isMarkingAsRead } =
    $api.useMutation("put", "/api/v1/notifications/{id}/read");

  const count = data?.items.length ?? 0;

  const handleMarkAsRead = async (id: number) => {
    try {
      await markAsRead({ params: { path: { id } } });
      await queryClient.invalidateQueries({
        queryKey: ["get", "/api/v1/notifications/"],
      });
    } catch {
      toast.error("Notifikaci se nepodařilo označit jako přečtenou.");
    }
  };

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
              className="flex items-start gap-2 rounded-md p-2 text-sm hover:bg-muted"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium">
                  {TYPE_LABELS[item.type] ?? item.type}
                </p>
                <p className="text-muted-foreground">
                  {getNotificationMessage(item)}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                aria-label="Označit jako přečtené"
                title="Označit jako přečtené"
                disabled={isMarkingAsRead}
                onClick={() => handleMarkAsRead(item.id)}
              >
                <Check />
              </Button>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
