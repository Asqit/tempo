import { useAuthStore } from "@/features/auth";
import { AppLayout } from "@/layouts/app";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/app")({
  async beforeLoad() {
    const { isAuthenticated, logout } = useAuthStore.getState();
    if (!isAuthenticated) {
      logout();
      throw redirect({ to: "/login", replace: true });
    }
  },
  component() {
    return <AppLayout />;
  },
});
