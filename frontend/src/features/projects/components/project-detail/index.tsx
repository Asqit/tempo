import { useEffect, useMemo, useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { $api } from "@/lib/api";

import { ProjectUpdateForm } from "../project-update-form";

type ProjectDetailProps = {
  id: number;
};

type ProjectDetailData = {
  name: string;
  clientName: string;
  clientId: number | null;
  ownerName: string;
};

function normalizeProjectDetail(data: unknown): ProjectDetailData | null {
  if (!data || typeof data !== "object") {
    return null;
  }

  const raw = data as {
    name?: unknown;
    client?: { id?: unknown; name?: unknown } | null;
    user?: { name?: unknown } | null;
  };

  if (typeof raw.name !== "string") {
    return null;
  }

  return {
    name: raw.name,
    clientName:
      raw.client && typeof raw.client.name === "string" ? raw.client.name : "-",
    clientId:
      raw.client && typeof raw.client.id === "number" ? raw.client.id : null,
    ownerName:
      raw.user && typeof raw.user.name === "string" ? raw.user.name : "-",
  };
}

export function ProjectDetail({ id }: ProjectDetailProps) {
  const [localName, setLocalName] = useState<string | null>(null);
  const [localClientId, setLocalClientId] = useState<number | null>(null);

  const { data, isLoading, isError } = $api.useQuery(
    "get",
    "/api/v1/projects/{id}",
    {
      params: {
        path: {
          id,
        },
      },
    },
  );

  const project = useMemo(() => normalizeProjectDetail(data), [data]);

  useEffect(() => {
    setLocalName(null);
    setLocalClientId(null);
  }, [id]);

  if (isLoading) {
    return (
      <p className="text-sm text-muted-foreground">
        Nacitam detail projektu...
      </p>
    );
  }

  if (isError || !project) {
    return (
      <p className="text-sm text-destructive">
        Detail projektu se nepodarilo nacist.
      </p>
    );
  }

  const displayName = localName ?? project.name;
  const displayClientId = localClientId ?? project.clientId;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{displayName}</CardTitle>
        <CardDescription>
          Detail projektu a rychla aktualizace nazvu.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <dl className="grid gap-2 text-xs">
          <div className="flex items-center justify-between gap-2 border-b pb-1">
            <dt className="text-muted-foreground">Klient</dt>
            <dd>{project.clientName}</dd>
          </div>
          <div className="flex items-center justify-between gap-2 border-b pb-1">
            <dt className="text-muted-foreground">ID klienta</dt>
            <dd>{displayClientId ?? "-"}</dd>
          </div>
          <div className="flex items-center justify-between gap-2 border-b pb-1">
            <dt className="text-muted-foreground">Vlastnik</dt>
            <dd>{project.ownerName}</dd>
          </div>
        </dl>

        <ProjectUpdateForm
          id={id}
          initialName={displayName}
          initialClientId={displayClientId}
          onUpdated={(nextName, nextClientId) => {
            setLocalName(nextName);
            setLocalClientId(nextClientId);
          }}
        />
      </CardContent>
    </Card>
  );
}
