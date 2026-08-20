import { useQueryKey } from "@tanstack/react-query";
import type { QueryKey, UseQueryOptions } from "@tanstack/react-query";

/**
 * A hook for building and caching query keys that automatically generates unique cache keys.
 *
 * Usage:
 * ```tsx
 * // Client with pagination and filtering
 * const clientKeys = useQueryKeyBuilder({
 *   mode: 'get',
 *   resource: 'clients',
 *   path: '/api/v1/clients/',
 *   params: { page: 2, limit: 20, filter: { name: 'Acme Inc' } },
 * });
 * // Returns: ['queryKeyBuilder', 'get', '/api/v1/clients/', 2, 20, 'filter:{name:"Acme Inc"}']
 *
 * // Project by ID (auto-generated key)
 * const projectKeys = useQueryKeyBuilder('project');
 * // Returns: ['queryKeyBuilder', 'get', '/api/v1/projects/{id}']
 * ```
 */
export function useQueryKeyBuilder<T extends string>(
  options:
    | { mode: "get"; resource: T; path?: string }
    | { mode: "post" | "put" | "delete"; resource: T; path?: string },
) {
  const queryKey = useQueryKey(options);

  return queryKey;
}

/**
 * A type helper for TypeScript autocomplete in query key building.
 */
export interface QueryKeyOptions<T extends string> {
  mode: "get" | "post" | "put" | "delete";
  resource: T;
  path?: string;
  page?: number;
  limit?: number;
  filter?: Record<string, unknown>;
}
