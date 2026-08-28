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
  workspace_invite_accepted: "Přijetí pozvánky",
  workspace_removed: "Odebrání z workspace",
  workspace_role_changed: "Změna role",
  workspace_left: "Opuštění workspace",
};

function getNotificationMessage(
  item: components["schemas"]["NotificationRead"],
) {
  if (item.payload.type === "workspace_invite") {
    return `${item.payload.invited_by_name} vás pozval do workspace „${item.payload.workspace_name}“. Role: ${item.payload.role}.`;
  }

  if (item.payload.type === "workspace_invite_accepted") {
    return `${item.payload.accepted_by_name} přijal pozvánku do workspace „${item.payload.workspace_name}“.`;
  }

  if (item.payload.type === "workspace_role_changed") {
    return `${item.payload.changed_by_name} změnil vaši roli ve workspace „${item.payload.workspace_name}“ z ${item.payload.old_role} na ${item.payload.new_role}.`;
  }

  if (item.payload.type === "workspace_left") {
    return `${item.payload.user_name} opustil workspace „${item.payload.workspace_name}“.`;
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
  const { mutateAsync: acceptInvitation, isPending: isAcceptingInvitation } =
    $api.useMutation(
      "post",
      "/api/v1/workspaces/invitations/accept/{invitation_id}",
    );

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

  const handleAcceptInvitation = async (
    notificationId: number,
    invitationId: number,
  ) => {
    try {
      await acceptInvitation({ params: { path: { invitation_id: invitationId } } });
      await markAsRead({ params: { path: { id: notificationId } } });
      await queryClient.invalidateQueries({
        queryKey: ["get", "/api/v1/notifications/"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["get", "/api/v1/workspaces"],
      });
      toast.success("Pozvánka byla přijata.");
    } catch {
      toast.error("Pozvánku se nepodařilo přijmout.");
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
            <NotificationItem
              key={item.id}
              item={item}
              onAccept={handleAcceptInvitation}
              onMarkAsRead={handleMarkAsRead}
              isAccepting={isAcceptingInvitation}
              isMarking={isMarkingAsRead}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function NotificationItem({
  item,
  onAccept,
  onMarkAsRead,
  isAccepting,
  isMarking,
}: {
  item: components["schemas"]["NotificationRead"];
  onAccept: (notificationId: number, invitationId: number) => void;
  onMarkAsRead: (id: number) => void;
  isAccepting: boolean;
  isMarking: boolean;
}) {
  const invitationId =
    item.payload.type === "workspace_invite"
      ? item.payload.invitation_id
      : null;

  return (
    <div className="flex items-start gap-2 rounded-md p-2 text-sm hover:bg-muted">
      <div className="min-w-0 flex-1">
        <p className="font-medium">{TYPE_LABELS[item.type] ?? item.type}</p>
        <p className="text-muted-foreground">{getNotificationMessage(item)}</p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {invitationId !== null ? (
          <Button
            type="button"
            size="sm"
            onClick={() => onAccept(item.id, invitationId)}
            disabled={isAccepting || isMarking}
          >
            Přijmout
          </Button>
        ) : null}
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label="Označit jako přečtené"
          title="Označit jako přečtené"
          disabled={isMarking || isAccepting}
          onClick={() => onMarkAsRead(item.id)}
        >
          <Check />
        </Button>
      </div>
    </div>
  );
}
