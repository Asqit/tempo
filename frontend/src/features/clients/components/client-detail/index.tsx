import { useEffect, useMemo, useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { $api } from "@/lib/api";

import { ClientUpdateForm } from "../client-update-form";

type ClientDetailProps = {
  id: number;
};

type ClientDetailData = {
  name: string;
  ownerName: string;
  createdAt: string | null;
  updatedAt: string | null;
};

function normalizeClientDetail(data: unknown): ClientDetailData | null {
  if (!data || typeof data !== "object") {
    return null;
  }

  const raw = data as {
    name?: unknown;
    user?: { name?: unknown } | null;
    created_at?: unknown;
    updated_at?: unknown;
  };

  if (typeof raw.name !== "string") {
    return null;
  }

  return {
    name: raw.name,
    ownerName:
      raw.user && typeof raw.user.name === "string" ? raw.user.name : "-",
    createdAt: typeof raw.created_at === "string" ? raw.created_at : null,
    updatedAt: typeof raw.updated_at === "string" ? raw.updated_at : null,
  };
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString("cs-CZ");
}

export function ClientDetail({ id }: ClientDetailProps) {
  const [localName, setLocalName] = useState<string | null>(null);

  const { data, isLoading, isError } = $api.useQuery(
    "get",
    "/api/v1/clients/{id}",
    {
      params: {
        path: {
          id,
        },
      },
    },
  );

  const client = useMemo(() => normalizeClientDetail(data), [data]);

  useEffect(() => {
    setLocalName(null);
  }, [id]);

  if (isLoading) {
    return (
      <p className="text-sm text-muted-foreground">Nacitam detail klienta...</p>
    );
  }

  if (isError || !client) {
    return (
      <p className="text-sm text-destructive">
        Detail klienta se nepodarilo nacist.
      </p>
    );
  }

  const displayName = localName ?? client.name;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{displayName}</CardTitle>
        <CardDescription>
          Detail klienta a rychla aktualizace nazvu.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <dl className="grid gap-2 text-xs">
          <div className="flex items-center justify-between gap-2 border-b pb-1">
            <dt className="text-muted-foreground">Vlastnik</dt>
            <dd>{client.ownerName}</dd>
          </div>
          <div className="flex items-center justify-between gap-2 border-b pb-1">
            <dt className="text-muted-foreground">Vytvoreno</dt>
            <dd>{formatDateTime(client.createdAt)}</dd>
          </div>
          <div className="flex items-center justify-between gap-2 border-b pb-1">
            <dt className="text-muted-foreground">Aktualizovano</dt>
            <dd>{formatDateTime(client.updatedAt)}</dd>
          </div>
        </dl>

        <ClientUpdateForm
          id={id}
          initialName={displayName}
          onUpdated={setLocalName}
        />
      </CardContent>
    </Card>
  );
}
