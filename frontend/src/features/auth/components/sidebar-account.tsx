import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { ChevronsUpDown } from "lucide-react";
import { useAuthStore } from "@/features/auth";
import { useNavigate } from "@tanstack/react-router";
import { ColorAvatar } from "@/components/share/color-avatar";

export function SidebarAccount() {
  const { user } = useAuthStore.getState();
  const { logout } = useAuthStore.getState();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate({ to: "/" });
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent bg-muted data-[state=open]:text-sidebar-accent-foreground"
            >
              <ColorAvatar name={user!.name} className="size-8" />
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user!.name}</span>
                <span className="truncate text-xs">{user!.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56"
            align="end"
            sideOffset={4}
            side="top"
          >
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={handleLogout}>
                Odhlásit se
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
