import { useForm, useSelector } from "@tanstack/react-form";
import { ChevronsUpDownIcon, FilePlusCorner } from "lucide-react";
import { toast } from "sonner";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { $api } from "@/lib/api";
import { ClientPicker } from "@/features/clients/components/client-picker";
import {
  Dialog,
  DialogContent,
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
import { ColorAvatar } from "@/components/share/color-avatar";
import { Textarea } from "@/components/ui/textarea";

type ProjectCreateFormProps = {
  onCreated?: () => void;
};

const formSchema = z.object({
  name: z.string().min(1, "Nazev projektu je povinny").max(30),
  description: z.string().min(1).max(128),
  client_id: z.number().int().positive("Vyber klienta").nullable(),
});

type FormSchema = z.infer<typeof formSchema>;

export function ProjectCreate({ onCreated }: ProjectCreateFormProps) {
  const { mutateAsync } = $api.useMutation("post", "/api/v1/projects/");
  const form = useForm({
    validators: {
      onSubmit: formSchema,
    },
    defaultValues: {
      name: "",
      description: "",
      client_id: null,
    } as FormSchema,
    onSubmit: async ({ value }) => {
      try {
        await mutateAsync({
          body: {
            name: value.name,
            client_id: clientId,
          },
        });
        onCreated?.();
      } catch {
        toast.error("Projekt se nezdařilo vyrobit.");
      } finally {
        form.reset();
      }
    },
  });

  const nameSub = useSelector(form.store, (s) => s.values.name);
  const clientId = useSelector(form.store, (s) => s.values.client_id);

  return (
    <Dialog>
      <DialogTrigger>
        <Button>
          <FilePlusCorner className="size-4" /> Vytvořit Projekt
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-none border-border/80">
        <DialogHeader>
          <DialogTitle>Nový Projekt</DialogTitle>
        </DialogHeader>
        <form
          className="flex flex-col gap-5"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            <div className="flex items-end gap-2">
              <ColorAvatar name={nameSub} className="w-fit size-7 shrink-0" />
              <form.Field
                name="name"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid} className="flex-1">
                      <FieldLabel htmlFor={field.name}>
                        Název projektu
                      </FieldLabel>
                      <FieldContent>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          placeholder="např. Nová kampaně"
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
            </div>

            <details className="rounded-none border border-border/70 bg-muted/25 p-3">
              <summary className="cursor-pointer text-sm font-medium text-foreground">
                Rozšířené možnosti
              </summary>
              <div className="mt-3 space-y-3">
                <form.Field
                  name="description"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid} className="flex-1">
                        <FieldLabel htmlFor={field.name}>
                          Popis Projektu
                        </FieldLabel>
                        <FieldContent>
                          <Textarea
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            aria-invalid={isInvalid}
                            placeholder="např. Nová kampaně"
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

                <Field>
                  <FieldLabel htmlFor="client_id">Klient</FieldLabel>
                  <FieldContent>
                    <ClientPicker
                      disabled={false}
                      value={clientId}
                      onChange={(nextValue) =>
                        form.setFieldValue("client_id", nextValue)
                      }
                      trigger={({
                        selected,
                        disabled,
                        isLoading,
                        placeholder,
                      }) => (
                        <button
                          type="button"
                          disabled={disabled}
                          className="flex h-9 w-full min-w-0 items-center justify-between rounded-none border border-input/80 bg-background px-3 py-1.5 text-left text-xs transition-colors outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50"
                        >
                          <span className="truncate">
                            {selected?.name ??
                              (isLoading ? "Načítám klienty..." : placeholder)}
                          </span>
                          <ChevronsUpDownIcon className="size-4 shrink-0" />
                        </button>
                      )}
                    />
                  </FieldContent>
                </Field>
              </div>
            </details>
            <Button className="w-full" type="submit">
              Vytvořit projekt
            </Button>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
