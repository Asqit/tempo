import { ClientCreateForm } from "@/features/clients/components/client-create-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/clients/new")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <section className="space-y-1">
        <p className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
          CRM
        </p>
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Přidat klienta
        </h2>
        <p className="text-sm text-muted-foreground">
          Vyplň základní údaje a nový klient bude okamžitě dostupný v přehledu.
        </p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Detaily klienta</CardTitle>
          <CardDescription>
            Pro vytvoření stačí název. Ostatní data můžeš doplnit později.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ClientCreateForm />
        </CardContent>
      </Card>
    </div>
  );
}
