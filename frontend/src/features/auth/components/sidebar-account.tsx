import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar";
import { ChevronsUpDown } from "lucide-react";
import { useAuthStore } from "@/features/auth";
import { useNavigate } from "@tanstack/react-router";
import { ColorAvatar } from "@/components/share/color-avatar";
import { $api } from "@/lib/api";
import { toast } from "sonner";

export function SidebarAccount() {
  const { user } = useAuthStore.getState();
  const { logout } = useAuthStore.getState();
  const navigate = useNavigate();
  const { mutateAsync } = $api.useMutation("delete", "/api/v1/auth/logout");

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await mutateAsync({
        params: {
          cookie: {
            refresh_token: null,
          },
        },
      });
      logout();
      navigate({ to: "/" });
    } catch (_) {
      toast.error("Nešlo se odhlásit");
    }
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            type="button"
            className="flex h-auto w-full items-center justify-start rounded-none border border-sidebar-border/70 bg-sidebar-accent/35 px-2 py-2 text-left data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <div className="flex w-full items-center gap-2">
              <ColorAvatar name={user.name} className="size-8" />
              <div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {user.email}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 shrink-0" />
            </div>
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
