import { useState } from "react";

import { ProjectsTable } from "@/features/projects/components/projects-table";
import { ProjectCreateForm } from "@/features/projects/components/project-create-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/projects/")({
  component: () => {
    const [refreshToken, setRefreshToken] = useState(0);

    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Projekty</CardTitle>
            <CardDescription>
              Vytvor novy projekt a spravuj existujici zaznamy.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProjectCreateForm
              onCreated={() => setRefreshToken((value) => value + 1)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Seznam projektu</CardTitle>
          </CardHeader>
          <CardContent>
            <ProjectsTable key={refreshToken} />
          </CardContent>
        </Card>
      </div>
    );
  },
});
