/**
 * Pre-defined query key patterns for Tempo frontend resources.
 *
 * These constants provide type-safe, consistent keys across your application.
 */

import { createQueryKeyFactory } from "./query-key-factory";

// Resource names matching backend endpoints
export const RESOURCE_NAMES = {
  auth: "/api/v1/auth",
  client: "client",
  project: "project",
  timeEntry: "timeEntry",
  workspace: "workspace",
  report: "report",
} as const;

// Query key factories for each resource
export const queryKeyFactories = {
  [RESOURCE_NAMES.auth]: createQueryKeyFactory(RESOURCE_NAMES.auth),
  [RESOURCE_NAMES.client]: createQueryKeyFactory(RESOURCE_NAMES.client),
  [RESOURCE_NAMES.project]: createQueryKeyFactory(RESOURCE_NAMES.project),
  [RESOURCE_NAMES.timeEntry]: createQueryKeyFactory(RESOURCE_NAMES.timeEntry),
  [RESOURCE_NAMES.workspace]: createQueryKeyFactory(RESOURCE_NAMES.workspace),
  [RESOURCE_NAMES.report]: createQueryKeyFactory(RESOURCE_NAMES.report),
} as const;

// Example query keys:
// queryKeyFactories.client(['get', '/api/v1/clients/'])
// queryKeyFactories.project(['get', '/api/v1/projects/{id}', 'project-id-123'])
// queryKeyFactories.timeEntry(['get', '/api/v1/time-entries/', { page: 1, limit: 50 }])
