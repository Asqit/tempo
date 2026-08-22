import { useForm, useSelector } from "@tanstack/react-form";
import { ChevronsUpDownIcon, FilePlusCorner } from "lucide-react";
import { toast } from "sonner";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { $api, getWorkspaceHeader } from "@/lib/api";
import { ClientPicker } from "@/features/clients/components/client-picker";
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
import { ColorAvatar } from "@/components/share/color-avatar";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/share/date-picker";
import { useMemo } from "react";

type ProjectCreateFormProps = {
  onCreated?: () => void;
  trigger?: React.ReactNode;
};

function fromDateTimeLocalInput(value: string): string | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

const formSchema = z.object({
  name: z.string().min(1, "Nazev projektu je povinny").max(30),
  description: z.string().min(1).max(128),
  client_id: z.number().int().positive("Vyber klienta").nullable(),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
});

type FormSchema = z.infer<typeof formSchema>;

export function ProjectCreate({ onCreated, trigger }: ProjectCreateFormProps) {
  const fallbackProjectDate = useMemo(() => new Date(), []);
  const workspaceHeader = getWorkspaceHeader();
  const { mutateAsync } = $api.useMutation("post", "/api/v1/projects/");
  const form = useForm({
    validators: {
      onSubmit: formSchema,
    },
    defaultValues: {
      name: "",
      description: "",
      client_id: null,
      start_time: new Date().toISOString(),
      end_time: new Date().toISOString(),
    } as FormSchema,
    onSubmit: async ({ value }) => {
      try {
        if (!clientId || !workspaceHeader) {
          toast.error("Vyber klienta a workspace");
          return;
        }

        const nextStartTime = value.start_time
          ? fromDateTimeLocalInput(value.start_time)
          : null;
        const nextEndTime = value.end_time
          ? fromDateTimeLocalInput(value.end_time)
          : null;

        if (value.start_time && !nextStartTime) {
          toast.error("Začátek musí být platný datum a čas.");
          return;
        }

        if (value.end_time && !nextEndTime) {
          toast.error("Konec musí být platný datum a čas.");
          return;
        }

        await mutateAsync({
          params: {
            query: {
              client_id: clientId,
            },
            header: workspaceHeader,
          },
          body: {
            name: value.name,
            description: value.description || null,
            start_time: nextStartTime,
            end_time: nextEndTime,
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

  const dialogContent = (
    <DialogContent className="border-border/80">
      <DialogHeader>
        <DialogTitle>Nový projekt</DialogTitle>
        <DialogDescription>
          Vytvoř projekt a přiřaď ho ke klientovi.
        </DialogDescription>
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
                    <FieldLabel htmlFor={field.name}>Název projektu</FieldLabel>
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

          <details className="rounded-lg border border-border/70 bg-muted/25 p-3">
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
                        Popis projektu
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
                      <Button
                        type="button"
                        disabled={disabled}
                        variant="outline"
                        id="client_id"
                        className="h-9 w-full min-w-0 justify-between text-left text-sm font-normal"
                      >
                        <span className="truncate">
                          {selected?.name ??
                            (isLoading ? "Načítám klienty..." : placeholder)}
                        </span>
                        <ChevronsUpDownIcon className="size-4 shrink-0" />
                      </Button>
                    )}
                  />
                </FieldContent>
              </Field>

              <form.Field
                name="start_time"
                children={(field) => {
                  return (
                    <Field>
                      <FieldLabel htmlFor="project-start-time">
                        Začátek projektu
                      </FieldLabel>
                      <FieldContent>
                        <DatePicker
                          id="project-start-time"
                          withTime
                          value={new Date(
                            field.state.value ?? fallbackProjectDate,
                          )}
                          setValue={(d) => field.handleChange(d.toISOString())}
                        />
                      </FieldContent>
                    </Field>
                  );
                }}
              />

              <form.Field
                name="end_time"
                children={(field) => {
                  return (
                    <Field>
                      <FieldLabel htmlFor="project-end-time">
                        Konec projektu
                      </FieldLabel>
                      <FieldContent>
                        <DatePicker
                          id="project-end-time"
                          withTime
                          value={new Date(
                            field.state.value ?? fallbackProjectDate,
                          )}
                          setValue={(d) => field.handleChange(d.toISOString())}
                        />
                      </FieldContent>
                    </Field>
                  );
                }}
              />
            </div>
          </details>
          <Button className="w-full" type="submit">
            Vytvořit projekt
          </Button>
        </FieldGroup>
      </form>
    </DialogContent>
  );

  if (trigger) {
    return (
      <Dialog>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        {dialogContent}
      </Dialog>
    );
  }

  return (
    <Dialog>
      <DialogTrigger>
        <Button>
          <FilePlusCorner className="size-4" /> Vytvořit Projekt
        </Button>
      </DialogTrigger>
      {dialogContent}
    </Dialog>
  );
}
