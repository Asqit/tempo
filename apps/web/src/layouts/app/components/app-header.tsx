import { Link, useLocation } from "@tanstack/react-router";
import { Fragment } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@tempo/ui/components/breadcrumb";
import { SidebarTrigger } from "@tempo/ui/components/sidebar";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { UnreadNotifications } from "@/features/notifications/components/unread";

type BreadcrumbItemData = {
  label: string;
  href?: string;
};

function getBreadcrumbs(pathname: string): BreadcrumbItemData[] {
  const path = pathname.replace(/\/$/, "") || "/app";
  const breadcrumbs: BreadcrumbItemData[] = [
    { label: "Přehled", href: "/app" },
  ];

  if (path === "/app") {
    return breadcrumbs;
  }

  if (path === "/app/clients") {
    return [...breadcrumbs, { label: "Klienti" }];
  }

  if (path === "/app/clients/new") {
    return [
      ...breadcrumbs,
      { label: "Klienti", href: "/app/clients" },
      { label: "Nový klient" },
    ];
  }

  if (path.startsWith("/app/clients/")) {
    return [
      ...breadcrumbs,
      { label: "Klienti", href: "/app/clients" },
      { label: "Detail klienta" },
    ];
  }

  if (path === "/app/projects") {
    return [...breadcrumbs, { label: "Projekty" }];
  }

  if (path.startsWith("/app/projects/")) {
    return [
      ...breadcrumbs,
      { label: "Projekty", href: "/app/projects" },
      { label: "Detail projektu" },
    ];
  }

  if (path === "/app/reports") {
    return [...breadcrumbs, { label: "Reporty" }];
  }

  if (path === "/app/reports/saved") {
    return [
      ...breadcrumbs,
      { label: "Reporty", href: "/app/reports" },
      { label: "Uložené reporty" },
    ];
  }

  if (path.startsWith("/app/reports/saved/")) {
    return [
      ...breadcrumbs,
      { label: "Reporty", href: "/app/reports" },
      { label: "Uložené reporty", href: "/app/reports/saved" },
      { label: "Detail reportu" },
    ];
  }

  if (path.startsWith("/app/reports/")) {
    return [...breadcrumbs, { label: "Reporty" }];
  }

  if (path === "/app/invoices") {
    return [...breadcrumbs, { label: "Fakturace" }];
  }

  if (path === "/app/settings/account") {
    return [...breadcrumbs, { label: "Nastavení účtu" }];
  }

  if (path === "/app/settings/workspace") {
    return [...breadcrumbs, { label: "Nastavení workspace" }];
  }

  if (path === "/app/workspaces") {
    return [...breadcrumbs, { label: "Workspace" }];
  }

  if (path.startsWith("/app/workspaces/")) {
    return [
      ...breadcrumbs,
      { label: "Workspace", href: "/app/workspaces" },
      { label: "Detail workspace" },
    ];
  }

  return breadcrumbs;
}

function AppBreadcrumbs() {
  const { pathname } = useLocation();
  const breadcrumbs = getBreadcrumbs(pathname);

  return (
    <Breadcrumb className="min-w-0">
      <BreadcrumbList className="flex-nowrap overflow-hidden text-xs">
        {breadcrumbs.map((breadcrumb, index) => {
          const isCurrent = index === breadcrumbs.length - 1;

          return (
            <Fragment key={`${breadcrumb.label}-${index}`}>
              <BreadcrumbItem className="min-w-0">
                {isCurrent || !breadcrumb.href ? (
                  <BreadcrumbPage className="truncate">{breadcrumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    render={
                      <Link
                        to={breadcrumb.href as never}
                        className="truncate"
                      />
                    }
                  >
                    {breadcrumb.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isCurrent && <BreadcrumbSeparator />}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export function AppHeader() {
  return (
    <header className="print-app-header flex min-h-14 items-center gap-3 bg-sidebar px-4 animate-in fade-in slide-in-from-top-1 duration-300 ease-out fill-mode-both backdrop-blur md:px-8">
      <SidebarTrigger />
      <div className="min-w-0 flex-1">
        <div className="hidden sm:block">
          <AppBreadcrumbs />
        </div>
        <h1 className="truncate text-base font-semibold tracking-tight sm:hidden">
          Tempo
        </h1>
      </div>
      <div className="ml-auto flex items-center gap-1">
        <ModeToggle />
        <UnreadNotifications />
      </div>
    </header>
  );
}
