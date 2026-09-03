import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  Clock3,
  LogOut,
  MailCheck,
  Trash2,
  Users,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { ColorAvatar } from "@/components/share/color-avatar";
import { Badge } from "@tempo/ui/components/badge";
import { Button } from "@tempo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@tempo/ui/components/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@tempo/ui/components/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@tempo/ui/components/select";
import { SettingsLayout } from "@/features/settings/components/settings-layout";
import { useAuthStore } from "@/features/auth";
import { WorkspaceShare } from "@/features/workspaces/components/workspace-share";
import { useWorkspaceStore } from "@/features/workspaces/store";
import { $api } from "@/lib/api";
import type { components } from "@tempo/api-types";

export const Route = createFileRoute("/app/settings/workspace")({
  component: RouteComponent,
});

function RouteComponent() {
  const { activeWorkspace, role, reset } = useWorkspaceStore();
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = $api.useQuery(
    "get",
    "/api/v1/workspaces",
    { params: { query: { size: 100 } } },
  );
  const { data: invitationsData, isLoading: invitationsLoading } =
    $api.useQuery("get", "/api/v1/workspaces/invitations");
  const leaveMutation = $api.useMutation(
    "delete",
    "/api/v1/workspaces/members/me",
  );
  const deleteMutation = $api.useMutation("delete", "/api/v1/workspaces/");
  const workspace = data?.items.find((item) => item.id === activeWorkspace);

  const finishWorkspaceChange = async () => {
    await queryClient.invalidateQueries({
      queryKey: ["get", "/api/v1/workspaces"],
    });
    reset();
    await navigate({ to: "/app/workspaces" });
  };

  const handleLeave = async () => {
    if (!activeWorkspace) return;
    try {
      await leaveMutation.mutateAsync({
        params: { header: { "X-Workspace-Id": activeWorkspace } },
      });
      toast.success("Workspace jste opustili.");
      await finishWorkspaceChange();
    } catch {
      toast.error("Workspace se nepodařilo opustit.");
    }
  };

  const handleDelete = async () => {
    if (!activeWorkspace) return;
    try {
      await deleteMutation.mutateAsync({
        params: { header: { "X-Workspace-Id": activeWorkspace } },
      });
      toast.success("Workspace byl smazán.");
      await finishWorkspaceChange();
    } catch {
      toast.error("Workspace se nepodařilo smazat.");
    }
  };

  if (!activeWorkspace) {
    return <WorkspaceMessage>Nejprve vyberte workspace.</WorkspaceMessage>;
  }
  if (isLoading) return <WorkspaceMessage>Načítám workspace…</WorkspaceMessage>;
  if (isError || !workspace) {
    return (
      <WorkspaceMessage error>Workspace se nepodařilo načíst.</WorkspaceMessage>
    );
  }

  return (
    <SettingsLayout
      title="Workspace"
      description="Spravujte členy a přístup k workspace."
    >
      <WorkspaceMembers
        workspace={workspace}
        currentUserId={user?.id}
        role={role}
      />
      <WorkspaceInvitations
        data={invitationsData as WorkspaceInvitationPage | undefined}
        isLoading={invitationsLoading}
        workspaceId={workspace.id}
      />
      <Card className="border-destructive/30 shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-destructive">
            <LogOut className="size-4" /> Nebezpečná zóna
          </CardTitle>
          <CardDescription>
            {role === "owner"
              ? "Jako vlastník můžete workspace trvale smazat."
              : "Opustíte workspace a ztratíte k němu přístup."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {role === "owner" ? (
            <ConfirmWorkspaceAction
              title="Smazat workspace?"
              description="Tato akce trvale smaže workspace a všechna jeho data."
              actionLabel="Smazat workspace"
              onConfirm={handleDelete}
              isPending={deleteMutation.isPending}
              destructive
            />
          ) : (
            <ConfirmWorkspaceAction
              title="Opustit workspace?"
              description="Po opuštění workspace neuvidíte jeho projekty ani časové záznamy."
              actionLabel="Opustit workspace"
              onConfirm={handleLeave}
              isPending={leaveMutation.isPending}
            />
          )}
        </CardContent>
      </Card>
    </SettingsLayout>
  );
}

type WorkspaceInvitationRecord = {
  id: number;
  workspace_id: number;
  role: components["schemas"]["WorkspaceRole"];
  accepted_at: string | null;
  revoked_at: string | null;
  expires_at: string | null;
  created_at: string;
};

type WorkspaceInvitationPage = {
  items?: WorkspaceInvitationRecord[];
};

function WorkspaceInvitations({
  data,
  isLoading,
  workspaceId,
}: {
  data?: WorkspaceInvitationPage;
  isLoading: boolean;
  workspaceId: number;
}) {
  const invitations = (data?.items ?? [])
    .filter((invitation) => invitation.workspace_id === workspaceId)
    .sort(
      (first, second) =>
        new Date(second.created_at).getTime() -
        new Date(first.created_at).getTime(),
    );

  return (
    <Card className="border-border/80 shadow-none">
      <CardHeader className="border-b border-border/70">
        <CardTitle className="flex items-center gap-2">
          <Clock3 className="size-4 text-primary" /> Historie pozvánek
        </CardTitle>
        <CardDescription className="mt-1">
          Přehled pozvánek, které jste obdrželi do tohoto workspace.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="px-5 py-6 text-sm text-muted-foreground">
            Načítám pozvánky…
          </div>
        ) : invitations.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-5 py-8 text-center">
            <MailCheck className="size-8 text-muted-foreground/60" />
            <p className="text-sm font-medium">Zatím žádné pozvánky</p>
            <p className="text-xs text-muted-foreground">
              Historie pozvánek pro tento workspace se zobrazí zde.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/70">
            {invitations.map((invitation) => (
              <InvitationRow key={invitation.id} invitation={invitation} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function InvitationRow({
  invitation,
}: {
  invitation: WorkspaceInvitationRecord;
}) {
  const status = getInvitationStatus(invitation);
  const StatusIcon = status.icon;

  return (
    <div className="flex items-center gap-3 px-5 py-3">
      <span
        className={`flex size-8 shrink-0 items-center justify-center rounded-full ${status.iconClass}`}
      >
        <StatusIcon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">Pozvánka do workspace</p>
        <p className="text-xs text-muted-foreground">
          {formatInvitationDate(invitation.created_at)} · Role:{" "}
          {getRoleLabel(invitation.role)}
        </p>
      </div>
      <Badge variant={status.variant}>{status.label}</Badge>
    </div>
  );
}

function getInvitationStatus(invitation: WorkspaceInvitationRecord) {
  if (invitation.revoked_at) {
    return {
      label: "Odvolaná",
      variant: "destructive" as const,
      icon: XCircle,
      iconClass: "bg-destructive/10 text-destructive",
    };
  }
  if (invitation.accepted_at) {
    return {
      label: "Přijatá",
      variant: "default" as const,
      icon: MailCheck,
      iconClass: "bg-primary/10 text-primary",
    };
  }
  if (invitation.expires_at && new Date(invitation.expires_at) <= new Date()) {
    return {
      label: "Prošlá",
      variant: "secondary" as const,
      icon: Clock3,
      iconClass: "bg-muted text-muted-foreground",
    };
  }
  return {
    label: "Čeká na přijetí",
    variant: "secondary" as const,
    icon: Clock3,
    iconClass: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  };
}

function getRoleLabel(role: components["schemas"]["WorkspaceRole"]) {
  return role === "admin"
    ? "administrátor"
    : role === "owner"
      ? "vlastník"
      : "člen";
}

function formatInvitationDate(value: string) {
  return new Intl.DateTimeFormat("cs-CZ", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function WorkspaceMessage({
  children,
  error = false,
}: {
  children: string;
  error?: boolean;
}) {
  return (
    <SettingsLayout
      title="Workspace"
      description="Spravujte workspace a jeho členy."
    >
      <Card>
        <CardContent
          className={`flex min-h-48 items-center justify-center text-sm ${error ? "text-destructive" : "text-muted-foreground"}`}
        >
          {children}
        </CardContent>
      </Card>
    </SettingsLayout>
  );
}

function WorkspaceMembers({
  workspace,
  currentUserId,
  role,
}: {
  workspace: components["schemas"]["WorkspaceRead"];
  currentUserId?: number;
  role: components["schemas"]["WorkspaceRole"];
}) {
  const queryClient = useQueryClient();
  const updateMember = $api.useMutation(
    "put",
    "/api/v1/workspaces/members/{member_id}",
  );
  const removeMember = $api.useMutation(
    "delete",
    "/api/v1/workspaces/members/{member_id}",
  );

  const invalidateMembers = () =>
    queryClient.invalidateQueries({ queryKey: ["get", "/api/v1/workspaces"] });

  const handleRoleChange = async (
    memberId: number,
    nextRole: components["schemas"]["WorkspaceRole"],
  ) => {
    if (!workspace.id) return;
    try {
      await updateMember.mutateAsync({
        params: {
          path: { member_id: memberId },
          header: { "X-Workspace-Id": workspace.id },
        },
        body: { role: nextRole },
      });
      await invalidateMembers();
      toast.success("Role člena byla aktualizována.");
    } catch {
      toast.error("Role člena se nepodařilo změnit.");
    }
  };

  const handleRemove = async (memberId: number) => {
    try {
      await removeMember.mutateAsync({
        params: {
          path: { member_id: memberId },
          header: { "X-Workspace-Id": workspace.id },
        },
      });
      await invalidateMembers();
      toast.success("Člen byl odebrán z workspace.");
    } catch {
      toast.error("Člena se nepodařilo odebrat.");
    }
  };

  return (
    <Card className="border-border/80 shadow-none">
      <CardHeader className="border-b border-border/70">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="size-4 text-primary" /> Členové workspace
            </CardTitle>
            <CardDescription className="mt-1">
              {workspace.name} · {workspace.members.length}{" "}
              {workspace.members.length === 1 ? "člen" : "členů"} s přístupem.
            </CardDescription>
          </div>
          {(role === "owner" || role === "admin") && <WorkspaceShare />}
        </div>
      </CardHeader>
      <CardContent className="divide-y divide-border/70 p-0">
        {workspace.members.map((member) => (
          <div key={member.id} className="flex items-center gap-3 px-5 py-3">
            <ColorAvatar name={member.user.name} className="size-8 text-xs" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {member.user.name}{" "}
                {member.user_id === currentUserId ? "(vy)" : ""}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {member.user.email}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {member.user_id !== currentUserId &&
              (role === "owner" ||
                (role === "admin" && member.role === "member")) ? (
                <Select
                  value={member.role}
                  onValueChange={(value) =>
                    void handleRoleChange(
                      member.id,
                      value as components["schemas"]["WorkspaceRole"],
                    )
                  }
                >
                  <SelectTrigger className="h-8 w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Člen</SelectItem>
                    <SelectItem value="admin">Administrátor</SelectItem>
                    {role === "owner" ? (
                      <SelectItem value="owner">Vlastník</SelectItem>
                    ) : null}
                  </SelectContent>
                </Select>
              ) : (
                <Badge
                  variant={member.role === "owner" ? "default" : "secondary"}
                >
                  {member.role === "owner"
                    ? "Vlastník"
                    : member.role === "admin"
                      ? "Administrátor"
                      : "Člen"}
                </Badge>
              )}
              {member.user_id !== currentUserId &&
              (role === "owner" ||
                (role === "admin" && member.role === "member")) ? (
                <ConfirmWorkspaceAction
                  title="Odebrat člena?"
                  description={`${member.user.name} ztratí přístup k tomuto workspace.`}
                  actionLabel="Odebrat"
                  onConfirm={() => handleRemove(member.id)}
                  isPending={removeMember.isPending}
                  destructive
                  compact
                />
              ) : null}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function ConfirmWorkspaceAction({
  title,
  description,
  actionLabel,
  onConfirm,
  isPending,
  destructive = false,
  compact = false,
}: {
  title: string;
  description: string;
  actionLabel: string;
  onConfirm: () => Promise<void>;
  isPending: boolean;
  destructive?: boolean;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant={destructive ? "destructive" : "outline"}
            size={compact ? "icon-sm" : "default"}
            aria-label={compact ? actionLabel : undefined}
            title={compact ? actionLabel : undefined}
          >
            {destructive ? <Trash2 /> : <LogOut />}
            {!compact && actionLabel}
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button type="button" variant="outline" />}>
            Zrušit
          </DialogClose>
          <Button
            variant={destructive ? "destructive" : "default"}
            disabled={isPending}
            onClick={() => void onConfirm()}
          >
            {isPending ? "Probíhá…" : actionLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
