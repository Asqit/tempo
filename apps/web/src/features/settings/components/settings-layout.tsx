import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Building2, UserRound } from "lucide-react";

import { PageHeader } from "@/components/share/page-header";
import { Card, CardContent } from "@tempo/ui/components/card";
import { cn } from "@/lib/utils";

const settingsLinks = [
  {
    label: "Účet",
    description: "Profil a vzhled aplikace",
    to: "/app/settings/account" as const,
    icon: UserRound,
  },
  {
    label: "Workspace",
    description: "Název a členové workspace",
    to: "/app/settings/workspace" as const,
    icon: Building2,
  },
];

type SettingsLayoutProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function SettingsLayout({
  title,
  description,
  children,
}: SettingsLayoutProps) {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300 ease-out fill-mode-both">
      <PageHeader eyebrow="Nastavení" title={title} description={description} />

      <div className="flex min-w-0 flex-col gap-6">
        <Card className="sticky top-0 z-10 border-border/80 bg-background/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <CardContent className="flex gap-1 overflow-x-auto p-2">
            {settingsLinks.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  activeOptions={{ exact: true }}
                  className={cn(
                    "group flex min-w-max flex-1 items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-muted",
                    "[&.active]:bg-primary/10 [&.active]:text-primary",
                  )}
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors group-[.active]:bg-primary/15 group-[.active]:text-primary">
                    <Icon />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-medium">{item.label}</span>
                    <span className="hidden text-xs text-muted-foreground sm:block">
                      {item.description}
                    </span>
                  </span>
                </Link>
              );
            })}
          </CardContent>
        </Card>

        <div className="flex min-w-0 flex-col gap-5">{children}</div>
      </div>
    </div>
  );
}
