import { Link } from "@tanstack/react-router";
import {
  FolderKanban,
  LayoutDashboard,
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
    title: "Workspace",
    items: [
      {
        label: "Home",
        path: "/app",
        icon: LayoutDashboard,
      },
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
    ],
  },
];

function NavIcon({ icon: Icon }: { icon?: LucideIcon }) {
  if (!Icon) {
    return null;
  }

  return <Icon />;
}

function renderSubItems(subItems: SidebarMenuSubItemConfig[]) {
  return (
    <SidebarMenuSub>
      {subItems.map((subItem) => (
        <SidebarMenuSubItem key={subItem.path}>
          <SidebarMenuSubButton
            render={<Link to={subItem.path} activeOptions={{ exact: true }} />}
          >
            <NavIcon icon={subItem.icon} />
            <span>{subItem.label}</span>
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
          render={<Link to={item.path} activeOptions={{ exact: true }} />}
        >
          <NavIcon icon={item.icon} />
          <span>{item.label}</span>
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
