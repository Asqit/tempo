import type { paths } from "@tempo/api-types";
import createFetchClient, { type Middleware } from "openapi-fetch";
import createClient from "openapi-react-query";
import { useAuthStore } from "@/features/auth";
import { useWorkspaceStore } from "@/features/workspaces/store";
import { QueryClient } from "@tanstack/react-query";
import { redirect } from "@tanstack/react-router";

const BACKEND_URL: string | null = import.meta.env.VITE_BACKEND_URL;

if (!BACKEND_URL) {
  throw new Error("error: missing env. variable for backend connection.");
}

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

export function getWorkspaceHeader() {
  const { activeWorkspace } = useWorkspaceStore.getState();

  if (activeWorkspace === null || activeWorkspace === undefined) {
    return null;
  }

  return {
    "X-Workspace-Id": activeWorkspace,
  } as const;
}

async function refreshAccessToken() {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        return false;
      }

      const payload = await response.json().catch(() => null);
      const nextToken =
        payload?.token?.access_token ??
        payload?.access_token ??
        payload?.data?.token?.access_token ??
        null;

      if (!nextToken) {
        return false;
      }

      const { user } = useAuthStore.getState();
      useAuthStore.setState({
        token: nextToken,
        isAuthenticated: true,
        user: payload?.user ?? user ?? null,
      });

      return true;
    } catch {
      return false;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

const middleware: Middleware = {
  async onRequest({ request }) {
    const { token, isAuthenticated } = useAuthStore.getState();
    const { activeWorkspace } = useWorkspaceStore.getState();
    const url = new URL(request.url);
    const requiresWorkspace = [
      "/api/v1/clients",
      "/api/v1/projects",
      "/api/v1/time-entries",
    ].some(
      (prefix) =>
        url.pathname === prefix || url.pathname.startsWith(`${prefix}/`),
    );

    if (token && isAuthenticated) {
      request.headers.set("Authorization", `Bearer ${token}`);
    }

    if (activeWorkspace && requiresWorkspace) {
      request.headers.set("X-Workspace-Id", String(activeWorkspace));
    }

    return request;
  },
  async onResponse({ request, response }) {
    if (response.status === 401) {
      const requestUrl = new URL(request.url);
      const isRefreshRequest = requestUrl.pathname === "/api/v1/auth/refresh";

      if (!isRefreshRequest) {
        const refreshed = await refreshAccessToken();

        if (refreshed) {
          const { token } = useAuthStore.getState();
          const retryHeaders = new Headers(request.headers);

          if (token) {
            retryHeaders.set("Authorization", `Bearer ${token}`);
          }

          const retryRequest = new Request(request, {
            headers: retryHeaders,
            method: request.method,
            body: request.body ?? undefined,
          });

          return fetch(retryRequest, {
            credentials: "include",
          });
        }
      }

      const { logout } = useAuthStore.getState();
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
  credentials: "include",
});

fetchClient.use(middleware);

export const $api = createClient(fetchClient);
export const queryClient = new QueryClient();
