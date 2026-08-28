import { createQueryKeyFactory } from "@tanstack/react-query";

/**
 * Creates a factory function for building consistent query keys across your React Query queries.
 *
 * This pattern ensures:
 * - Predictable cache behavior
 * - Easy debugging with React Query DevTools
 * - Better integration with server-side pagination and filtering
 * - Consistent key structure for type-safe key generation
 *
 * @param prefix - The resource name prefix (e.g., 'client', 'project', 'timeEntry')
 * @returns A factory function that generates query keys from mode, path, and optional params
 */
export function createQueryKeyFactory(prefix: string) {
  return (
    mode: "get" | "post" | "put" | "delete",
    path: string,
    params?: {
      page?: number;
      limit?: number;
      filter?: Record<string, unknown>;
    },
    customKeys?: string[],
  ) => {
    const keys = [prefix, mode, path];

    // Add pagination and filtering params for fine-grained caching
    if (params) {
      if (params.page !== undefined) keys.push(params.page);
      if (params.limit !== undefined) keys.push(params.limit);
      if (Object.keys(params.filter).length > 0) {
        keys.push(`filter:${JSON.stringify(params.filter)}`);
      }
    }

    // Allow custom key overrides for special cases
    if (customKeys?.length) {
      keys.push(...customKeys);
    }

    return keys;
  };
}

// Example usage:
// const clientQueryKey = createQueryKeyFactory('client');
// queryKey(['get', '/api/v1/clients/', 1, 'filter:{name:"Acme Inc"}']);
