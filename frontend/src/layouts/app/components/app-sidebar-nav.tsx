import { Link } from "@tanstack/react-router";
import {
  ClipboardClock,
  FolderKanban,
  LayoutDashboard,
  Receipt,
  Users,
  type LucideIcon,
} from "lucide-react";

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
    title: "Tracking",
    items: [
      {
        label: "Home",
        path: "/app",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: "Data Analysis",
    items: [
      {
        label: "Report",
        path: "/app/report",
        icon: ClipboardClock,
      },
    ],
  },
  {
    title: "Workspace",
    items: [
      {
        label: "Clients",
        path: "/app/clients",
        icon: Users,
      },
      {
        label: "Projects",
        path: "/app/projects",
        icon: FolderKanban,
      },
      {
        label: "Invoicing",
        path: "/app/invoice",
        icon: Receipt,
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
                className="group rounded-none transition-all [&.active]:bg-sidebar-accent [&.active]:text-sidebar-accent-foreground"
                activeOptions={{ exact: true }}
              />
            }
          >
            <span className="transition-transform group-[.active]:translate-x-0.5">
              {subItem.label}
            </span>
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
              className="group rounded-none border border-transparent transition-all [&.active]:border-sidebar-border [&.active]:bg-sidebar-accent [&.active]:text-sidebar-accent-foreground"
              activeOptions={{ exact: true }}
            />
          }
        >
          <NavIcon icon={item.icon} className="transition-all" />
          <span className="transition-transform group-[.active]:translate-x-1">
            {item.label}
          </span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }
  return (
    <SidebarMenuItem key={item.label}>
      <SidebarMenuButton>
        <NavIcon icon={item.icon} />
        <span>{item.label}</span>
      </SidebarMenuButton>
      {renderSubItems(item.subItems)}
    </SidebarMenuItem>
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
