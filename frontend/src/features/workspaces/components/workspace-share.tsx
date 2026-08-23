import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { UserPlus } from "lucide-react";
import { $api } from "@/lib/api";
import { useWorkspaceStore } from "../store";
import { toast } from "sonner";
import * as z from "zod";

const formSchema = z.object({
  email: z.email("Zadejte platný e-mail"),
});

export function WorkspaceShare() {
  const [open, setOpen] = useState(false);
  const { activeWorkspace } = useWorkspaceStore();
  const { mutateAsync, isPending } = $api.useMutation(
    "post",
    "/api/v1/workspaces/{workspace_id}/members/",
  );

  const handleInvite = async (email: string) => {
    if (!activeWorkspace) return;

    try {
      await mutateAsync({
        params: {
          path: {
            workspace_id: activeWorkspace,
          },
          header: {
            "X-Workspace-Id": activeWorkspace,
          },
          query: {
            candidate_email: email,
          },
        },
      });

      setOpen(false);
      form.reset();
      toast.success("Člen byl pozván do workspace");
    } catch {
      toast.error(
        "Nepodařilo se pozvat člena workspace. Zkontrolujte e-mail a zkuste to znovu.",
      );
    }
  };

  const form = useForm({
    defaultValues: {
      email: "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      if (!activeWorkspace) {
        toast.error("Nejprve vyberte workspace");
        return;
      }

      await handleInvite(value.email.trim());
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" variant="outline" />}>
        <UserPlus className="size-3.5" />
        Pozvat
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pozvat členy workspace</DialogTitle>
          <DialogDescription>
            Zadejte e-mail člověka, kterého chcete přidat do tohoto workspace.
          </DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-5"
          onSubmit={(event) => {
            event.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            <form.Field
              name="email"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>E-mail</FieldLabel>
                    <FieldContent>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="email"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        aria-invalid={isInvalid}
                        placeholder="kolega@firma.cz"
                        autoComplete="email"
                        autoFocus
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </FieldContent>
                  </Field>
                );
              }}
            />
          </FieldGroup>
          <Button className="w-full" type="submit" disabled={isPending}>
            {isPending ? "Odesílám pozvánku…" : "Pozvat člena"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
