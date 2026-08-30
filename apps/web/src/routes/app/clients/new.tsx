import { ClientCreateForm } from "@/features/clients/components/client-create-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@tempo/ui/components/card";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/clients/new")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <section className="space-y-1 animate-in fade-in slide-in-from-top-4 duration-500 delay-100">
        <p className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase animate-in fade-in slide-in-from-right-3 duration-300 delay-150">
          CRM
        </p>
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl animate-in fade-in slide-in-from-left-3 duration-300 delay-150">
          Přidat klienta
        </h2>
        <p className="text-sm text-muted-foreground animate-in fade-in slide-in-from-top-4 duration-500 delay-75">
          Vyplň základní údaje a nový klient bude okamžitě dostupný v přehledu.
        </p>
      </section>

      <Card className="animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">
        <CardHeader className="animate-in fade-in slide-in-from-top-4 duration-500 delay-75">
          <CardTitle className="animate-in fade-in slide-in-from-left-3 duration-300 delay-150">
            Detaily klienta
          </CardTitle>
          <CardDescription className="animate-in fade-in slide-in-from-right-3 duration-300 delay-150">
            Pro vytvoření stačí název. Ostatní data můžeš doplnit později.
          </CardDescription>
        </CardHeader>
        <CardContent className="animate-in fade-in slide-in-from-top-4 duration-500 delay-100">
          <ClientCreateForm />
        </CardContent>
      </Card>
    </div>
  );
}
