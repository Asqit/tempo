import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import * as z from "zod";
import { UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { $api } from "@/lib/api";
import type { components } from "@/lib/api.d";
import { useWorkspaceStore } from "../store";

const formSchema = z.object({
  email: z.email("Zadejte platný e-mail"),
});

export function WorkspaceShare() {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<components["schemas"]["WorkspaceRole"]>(
    "member",
  );
  const { activeWorkspace } = useWorkspaceStore();
  const { mutateAsync, isPending } = $api.useMutation(
    "post",
    "/api/v1/workspaces/invitations",
  );

  const form = useForm({
    defaultValues: { email: "" },
    validators: { onSubmit: formSchema },
    onSubmit: async ({ value }) => {
      if (!activeWorkspace) {
        toast.error("Nejprve vyberte workspace.");
        return;
      }

      try {
        await mutateAsync({
          params: { header: { "X-Workspace-Id": activeWorkspace } },
          body: { email: value.email.trim(), role },
        });
        setOpen(false);
        form.reset();
        setRole("member");
        toast.success("Pozvánka byla odeslána.");
      } catch {
        toast.error(
          "Pozvánku se nepodařilo odeslat. Zkontrolujte e-mail a zkuste to znovu.",
        );
      }
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
          <DialogTitle>Pozvat člena do workspace</DialogTitle>
          <DialogDescription>
            Pozvaný člověk musí mít účet se stejnou e-mailovou adresou.
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
                        type="email"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) => field.handleChange(event.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="kolega@firma.cz"
                        autoComplete="email"
                        autoFocus
                      />
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </FieldContent>
                  </Field>
                );
              }}
            />
            <Field>
              <FieldLabel htmlFor="invite-role">Role ve workspace</FieldLabel>
              <Select value={role} onValueChange={(value) => setRole(value as typeof role)}>
                <SelectTrigger id="invite-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Člen</SelectItem>
                  <SelectItem value="admin">Administrátor</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </FieldGroup>
          <Button className="w-full" type="submit" disabled={isPending}>
            {isPending ? "Odesílám pozvánku…" : "Odeslat pozvánku"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
