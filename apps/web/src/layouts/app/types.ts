import type { LucideIcon } from "lucide-react";

export type SidebarMenuSubItemConfig = {
  label: string;
  path: string;
  icon?: LucideIcon;
};

export type SidebarMenuItemConfig =
  | {
      label: string;
      path: string;
      icon?: LucideIcon;
      badge?: string | number;
      subItems?: never;
    }
  | {
      label: string;
      icon?: LucideIcon;
      badge?: string | number;
      path?: never;
      subItems: SidebarMenuSubItemConfig[];
    };

export type SidebarGroupConfig = {
  title: string;
  items: SidebarMenuItemConfig[];
};

export type SidebarNavConfig = SidebarGroupConfig[];
