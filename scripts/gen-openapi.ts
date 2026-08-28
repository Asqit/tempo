import { $ } from "bun";

await $`openapi-typescript http://127.0.0.1:8000/openapi.json -o packages/api-types/src/api.d.ts`;
