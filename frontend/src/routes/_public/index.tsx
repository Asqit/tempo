import { useAuthStore } from "@/features/auth";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_public/")({
  loader() {
    const { isAuthenticated, token } = useAuthStore.getState();
    if (isAuthenticated && token)
      throw redirect({
        to: "/app",
        replace: true,
      });
  },
  component: HomeView,
});

function HomeView() {
  return <>domovská stránka</>;
}
