import { useAuthStore } from "@/features/auth";
import { ColorAvatar } from "@/components/share/color-avatar";
import { ModeToggle } from "@/components/ui/mode-toggle";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldContent, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SettingsLayout } from "@/features/settings/components/settings-layout";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/settings/account")({
  component: RouteComponent,
});

function RouteComponent() {
  const user = useAuthStore((state) => state.user);

  if (!user) return null;

  return (
    <SettingsLayout
      title="Účet"
      description="Spravujte své profilové údaje a osobní preference."
    >
      <Card className="border-border/80 shadow-none">
        <CardHeader className="border-b border-border/70">
          <div className="flex items-center gap-3">
            <ColorAvatar name={user.name} className="size-10 rounded-xl text-sm" />
            <div>
              <CardTitle>Profil</CardTitle>
              <CardDescription>Údaje používané v aplikaci a workspace.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-5">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="account-name">Jméno</FieldLabel>
              <FieldContent>
                <Input id="account-name" value={user.name} disabled />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="account-email">E-mail</FieldLabel>
              <FieldContent>
                <Input id="account-email" type="email" value={user.email} disabled />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="account-country">Země</FieldLabel>
              <FieldContent>
                <Input id="account-country" value={user.country} disabled />
              </FieldContent>
            </Field>
          </FieldGroup>
          <p className="mt-4 text-xs text-muted-foreground">
            Úprava profilových údajů bude dostupná v další verzi.
          </p>
        </CardContent>
      </Card>

      <Card className="border-border/80 shadow-none">
        <CardHeader className="border-b border-border/70">
          <CardTitle>Vzhled</CardTitle>
          <CardDescription>Vyberte vzhled, který vám při práci vyhovuje.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-4 pt-5">
          <div>
            <p className="text-sm font-medium">Barevný režim</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Přepíná světlý a tmavý vzhled aplikace.
            </p>
          </div>
          <ModeToggle />
        </CardContent>
      </Card>
    </SettingsLayout>
  );
}
