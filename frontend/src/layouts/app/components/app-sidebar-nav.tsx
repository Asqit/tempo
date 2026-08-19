import { Link } from "@tanstack/react-router";
import {
  ChevronRight,
  ClipboardClock,
  FolderKanban,
  LayoutDashboard,
  Receipt,
  Users,
  type LucideIcon,
} from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import type {
  SidebarMenuItemConfig,
  SidebarMenuSubItemConfig,
  SidebarNavConfig,
} from "../types";

const navigation: SidebarNavConfig = [
  {
    title: "Workspace",
    items: [
      {
        label: "Přehled",
        path: "/app",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: "Data",
    items: [
      {
        label: "Reporty",
        icon: ClipboardClock,
        subItems: [
          {
            label: "nový report",
            path: "/app/reports",
          },
          {
            label: "uložené",
            path: "/app/reports/saved",
          },
        ],
      },
    ],
  },
  {
    title: "Správa",
    items: [
      {
        label: "Klienti",
        path: "/app/clients",
        icon: Users,
      },
      {
        label: "Projekty",
        path: "/app/projects",
        icon: FolderKanban,
      },
      {
        label: "Fakturace",
        icon: Receipt,
        subItems: [
          {
            label: "Vydané faktury",
            path: "/app/invoices/",
          },
          {
            label: "Nová faktura",
            path: "/app/invoices/new",
          },
        ],
      },
    ],
  },
];

function NavIcon({
  icon: Icon,
  className,
}: {
  icon?: LucideIcon;
  className?: string;
}) {
  if (!Icon) {
    return null;
  }

  return <Icon className={className} />;
}

function renderSubItems(subItems: SidebarMenuSubItemConfig[]) {
  return (
    <SidebarMenuSub>
      {subItems.map((subItem) => (
        <SidebarMenuSubItem key={subItem.path}>
          <SidebarMenuSubButton
            render={
              <Link
                to={subItem.path}
                className="group transition-all [&.active]:bg-sidebar-accent dark:[&.active]:bg-primary/10 dark:[&.active]:text-primary"
                activeOptions={{ exact: true }}
              />
            }
          >
            <span className="transition-transform">{subItem.label}</span>
          </SidebarMenuSubButton>
        </SidebarMenuSubItem>
      ))}
    </SidebarMenuSub>
  );
}

function renderItem(item: SidebarMenuItemConfig) {
  if ("path" in item) {
    return (
      <SidebarMenuItem key={item.path}>
        <SidebarMenuButton
          render={
            <Link
              to={item.path}
              className="group border-l-4 border-transparent transition-all [&.active]:border-primary [&.active]:bg-sidebar-accent
              dark:[&.active]:bg-primary/10 dark:[&.active]:text-primary"
              activeOptions={{ exact: true }}
            />
          }
        >
          <NavIcon icon={item.icon} className="transition-all" />
          <span>{item.label}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  return (
    <Collapsible key={item.label} defaultOpen className="group/collapsible">
      <SidebarMenuItem>
        <SidebarMenuButton render={<CollapsibleTrigger />}>
          <NavIcon icon={item.icon} />
          <span>{item.label}</span>
          <ChevronRight className="ml-auto transition-transform group-data-open/collapsible:rotate-180" />
        </SidebarMenuButton>
        <CollapsibleContent>{renderSubItems(item.subItems)}</CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

export function AppSidebarNav() {
  return (
    <>
      {navigation.map((group) => (
        <SidebarGroup key={group.title}>
          <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{group.items.map(renderItem)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  );
}
