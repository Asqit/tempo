import { useState } from "react";

import { ClientsTable } from "@/features/clients/components/clients-table";
import { ClientCreateDialog } from "@/features/clients/components/client-create-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/clients/")({
  component: ClientsPage,
});

function ClientsPage() {
  const [refreshToken, setRefreshToken] = useState(0);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <section className="space-y-1">
        <p className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
          CRM
        </p>
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Klienti
        </h2>
        <p className="text-sm text-muted-foreground">
          Zakládej nové klienty a spravuj existující kontakty na jednom místě.
        </p>
      </section>

      <Card>
        <CardHeader className="flex flex-col gap-3 border-b md:flex-row md:items-start md:justify-between">
          <div>
            <CardTitle>Nový klient</CardTitle>
            <CardDescription>
              Přidej klienta do seznamu a začni k němu přiřazovat projekty.
            </CardDescription>
          </div>
          <ClientCreateDialog
            onCreated={() => setRefreshToken((value) => value + 1)}
          />
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            Vytvoř klienta pomocí dialogu a ihned ho uvidíš v seznamu.
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Seznam klientu</CardTitle>
          <CardDescription>
            Přehled všech klientů včetně vlastníka a času poslední změny.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ClientsTable key={refreshToken} />
        </CardContent>
      </Card>
    </div>
  );
}
