import { useState } from "react";

import { ClientsTable } from "@/features/clients/components/clients-table";
import { ClientCreateForm } from "@/features/clients/components/client-create-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/clients/")({
  component: () => {
    const [refreshToken, setRefreshToken] = useState(0);

    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Klienti</CardTitle>
            <CardDescription>
              Vytvor noveho klienta a spravuj existujici zaznamy.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ClientCreateForm
              onCreated={() => setRefreshToken((value) => value + 1)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Seznam klientu</CardTitle>
          </CardHeader>
          <CardContent>
            <ClientsTable key={refreshToken} />
          </CardContent>
        </Card>
      </div>
    );
  },
});
