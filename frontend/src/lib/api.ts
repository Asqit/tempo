import type { paths } from "./api.d";
import createFetchClient, { type Middleware } from "openapi-fetch";
import createClient from "openapi-react-query";
import { useAuthStore } from "@/features/auth";
import { QueryClient } from "@tanstack/react-query";
import { redirect } from "@tanstack/react-router";

const BACKEND_URL: string | null = import.meta.env.VITE_BACKEND_URL;

if (!BACKEND_URL) {
  throw new Error("error: missing env. variable for backend connection.");
}

const middleware: Middleware = {
  async onRequest({ request, options }) {
    const { token, isAuthenticated } = useAuthStore.getState();
    if (token && isAuthenticated) {
      request.headers.set("Authorization", `Bearer ${token}`);
    }

    return request;
  },
  async onResponse({ request, response, options }) {
    const { logout } = useAuthStore.getState();
    if (response.status == 401) {
      logout();
      throw redirect({ to: "/login" });
    }

    return response;
  },
  async onError({ error }) {
    return new Error("error", { cause: error });
  },
};

const fetchClient = createFetchClient<paths>({
  baseUrl: BACKEND_URL,
});

fetchClient.use(middleware);

export const $api = createClient(fetchClient);
export const queryClient = new QueryClient();
