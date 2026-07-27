import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { $api } from "@/lib/api";
import { useAuthStore } from "../store";
import type { components } from "@/lib/api.d";
import { useNavigate } from "@tanstack/react-router";

const formSchema = z.object({
  username: z.string().min(1, "Uzivatelske jmeno je povinne"),
  password: z.string().min(1, "Heslo je povinne"),
});

export function LoginForm() {
  const { mutateAsync } = $api.useMutation("post", "/api/v1/auth/");
  const { login } = useAuthStore.getState();
  const navigate = useNavigate();
  const form = useForm({
    defaultValues: {
      username: "",
      password: "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const response: components["schemas"]["LoginResponse"] =
          await mutateAsync({
            body: {
              username: value.username,
              password: value.password,
              scope: "",
            },
            bodySerializer(body) {
              const fd = new FormData();
              for (const name in body) {
                // @ts-expect-error stupid little iteration error
                fd.append(name, body[name]);
              }
              return fd;
            },
          });

        login({ ...response }, response.access_token);
        navigate({ to: "/app" });
      } catch (error) {
        toast.error("Prihlaseni se nezdarilo");
      }
    },
  });

  return (
    <Card className="w-full sm:max-w-sm">
      <CardHeader>
        <CardTitle>Prihlaseni</CardTitle>
        <CardDescription>
          Zadej prihlasovaci udaje pro pokracovani.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="login-form"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            <form.Field
              name="username"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      Uzivatelske jmeno
                    </FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="tvoje.jmeno"
                      autoComplete="username"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />
            <form.Field
              name="password"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Heslo</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="password"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="••••••••"
                      autoComplete="current-password"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <Field orientation="horizontal">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Vymazat
          </Button>
          <Button type="submit" form="login-form">
            Prihlasit se
          </Button>
        </Field>
      </CardFooter>
    </Card>
  );
}
