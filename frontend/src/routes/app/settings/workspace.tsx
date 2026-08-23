import { useForm } from "@tanstack/react-form";
import { createFileRoute } from "@tanstack/react-router";
import { Building2, Users } from "lucide-react";
import * as z from "zod";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ColorAvatar } from "@/components/share/color-avatar";
import { SettingsLayout } from "@/features/settings/components/settings-layout";
import { useWorkspaceStore } from "@/features/workspaces/store";
import { $api } from "@/lib/api";
import type { components } from "@/lib/api.d";

const workspaceSchema = z.object({
  name: z.string().trim().min(2, "Název workspace musí mít alespoň 2 znaky"),
});

export const Route = createFileRoute("/app/settings/workspace")({
  component: RouteComponent,
});

function RouteComponent() {
  const { activeWorkspace } = useWorkspaceStore();
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = $api.useQuery(
    "get",
    "/api/v1/workspaces/{workspace_id}",
    {
      params: {
        path: { workspace_id: activeWorkspace ?? 0 },
      },
      enabled: activeWorkspace !== null,
    },
  );

  const { mutateAsync, isPending } = $api.useMutation(
    "put",
    "/api/v1/workspaces/{workspace_id}",
  );

  if (!activeWorkspace) {
    return (
      <SettingsLayout
        title="Workspace"
        description="Spravujte workspace a jeho členy."
      >
        <Card>
          <CardContent className="flex min-h-48 items-center justify-center text-sm text-muted-foreground">
            Nejprve vyberte workspace.
          </CardContent>
        </Card>
      </SettingsLayout>
    );
  }

  if (isLoading) {
    return (
      <SettingsLayout title="Workspace" description="Spravujte workspace a jeho členy.">
        <Card>
          <CardContent className="flex min-h-48 items-center justify-center text-sm text-muted-foreground">
            Načítám workspace…
          </CardContent>
        </Card>
      </SettingsLayout>
    );
  }

  if (isError || !data) {
    return (
      <SettingsLayout title="Workspace" description="Spravujte workspace a jeho členy.">
        <Card>
          <CardContent className="flex min-h-48 items-center justify-center text-sm text-destructive">
            Workspace se nepodařilo načíst.
          </CardContent>
        </Card>
      </SettingsLayout>
    );
  }

  return (
    <SettingsLayout
      title="Workspace"
      description="Spravujte název workspace a přehled jeho členů."
    >
      <WorkspaceDetails
        workspace={data}
        isPending={isPending}
        onSave={async (name) => {
          try {
            await mutateAsync({
              params: {
                path: { workspace_id: activeWorkspace },
                header: { "X-Workspace-Id": activeWorkspace },
              },
              body: { name },
            });
            await queryClient.invalidateQueries({
              queryKey: ["get", "/api/v1/workspaces/{workspace_id}"],
            });
            await queryClient.invalidateQueries({
              queryKey: ["get", "/api/v1/workspaces"],
            });
            toast.success("Workspace byl aktualizován.");
          } catch {
            toast.error("Workspace se nepodařilo aktualizovat.");
          }
        }}
      />
    </SettingsLayout>
  );
}

function WorkspaceDetails({
  workspace,
  isPending,
  onSave,
}: {
  workspace: components["schemas"]["WorkspaceRead"];
  isPending: boolean;
  onSave: (name: string) => Promise<void>;
}) {
  const form = useForm({
    defaultValues: { name: workspace.name },
    validators: { onSubmit: workspaceSchema },
    onSubmit: async ({ value }) => onSave(value.name.trim()),
  });

  return (
    <>
      <Card className="border-border/80 shadow-none">
        <CardHeader className="border-b border-border/70">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="size-4 text-primary" />
            Základní údaje
          </CardTitle>
          <CardDescription>Název workspace vidí všichni jeho členové.</CardDescription>
        </CardHeader>
        <CardContent className="pt-5">
          <form
            className="flex flex-col gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              form.handleSubmit();
            }}
          >
            <FieldGroup>
              <form.Field
                name="name"
                children={(field) => {
                  const invalid = field.state.meta.isTouched && !field.state.meta.isValid;

                  return (
                    <Field data-invalid={invalid}>
                      <FieldLabel htmlFor={field.name}>Název workspace</FieldLabel>
                      <FieldContent>
                        <Input
                          id={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(event) => field.handleChange(event.target.value)}
                          aria-invalid={invalid}
                          disabled={isPending}
                        />
                        {invalid && <FieldError errors={field.state.meta.errors} />}
                      </FieldContent>
                    </Field>
                  );
                }}
              />
            </FieldGroup>
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isPending}
              >
                {isPending ? "Ukládám…" : "Uložit změny"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-border/80 shadow-none">
        <CardHeader className="border-b border-border/70">
          <CardTitle className="flex items-center gap-2">
            <Users className="size-4 text-primary" />
            Členové workspace
          </CardTitle>
          <CardDescription>
            {workspace.members.length} {workspace.members.length === 1 ? "člen" : "členů"} s přístupem.
          </CardDescription>
        </CardHeader>
        <CardContent className="divide-y divide-border/70 p-0">
          {workspace.members.map((member) => (
            <div key={member.id} className="flex items-center gap-3 px-5 py-3">
              <ColorAvatar name={member.user.name} className="size-8 text-xs" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{member.user.name}</p>
                <p className="truncate text-xs text-muted-foreground">{member.user.email}</p>
              </div>
              <Badge variant={member.role === "owner" ? "default" : "secondary"}>
                {member.role === "owner" ? "Vlastník" : member.role === "admin" ? "Admin" : "Člen"}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  );
}
