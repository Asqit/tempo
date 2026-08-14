import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { UserPlus2 } from "lucide-react";
import { toast } from "sonner";
import * as z from "zod";

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
import { $api, getWorkspaceHeader } from "@/lib/api";
import type { components } from "@/lib/api.d";

type ClientCreateDialogProps = {
  onCreated?: (client: components["schemas"]["ClientRead"]) => void;
  trigger?: React.ReactNode;
};

const formSchema = z.object({
  name: z.string().min(1, "Nazev klienta je povinny"),
});

export function ClientCreateDialog({
  onCreated,
  trigger,
}: ClientCreateDialogProps) {
  const [open, setOpen] = useState(false);
  const workspaceHeader = getWorkspaceHeader();
  const { mutateAsync, isPending } = $api.useMutation(
    "post",
    "/api/v1/clients/",
  );

  const form = useForm({
    defaultValues: {
      name: "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        if (!workspaceHeader) {
          toast.error("Vyber workspace");
          return;
        }

        const createdClient = await mutateAsync({
          params: {
            header: workspaceHeader,
          },
          body: {
            name: value.name.trim(),
          },
        });

        setOpen(false);
        form.reset();
        onCreated?.(createdClient);
        toast.success("Klient byl vytvoren");
      } catch {
        toast.error("Vytvoreni klienta se nezdarilo");
      }
    },
  });

  const dialogContent = (
    <DialogContent className="rounded-none border-border/80 sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Nový klient</DialogTitle>
        <DialogDescription>
          Zadej název klienta a přidej ho do seznamu.
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
            name="name"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;

              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Název klienta</FieldLabel>
                  <FieldContent>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      aria-invalid={isInvalid}
                      placeholder="např. Acme s.r.o."
                      autoComplete="off"
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
          {isPending ? "Vytvarim..." : "Vytvořit klienta"}
        </Button>
      </form>
    </DialogContent>
  );

  if (trigger) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        {dialogContent}
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button>
          <UserPlus2 className="size-4" /> Vytvořit klienta
        </Button>
      </DialogTrigger>
      {dialogContent}
    </Dialog>
  );
}
