import { watch } from "chokidar";
import { $ } from "bun";

const apiUrl = "http://127.0.0.1:8000/openapi.json";

async function waitForApi() {
  while (true) {
    try {
      const response = await fetch(apiUrl);

      if (response.ok) return;
    } catch {}

    await Bun.sleep(500);
  }
}

async function generate() {
  console.log("Generating OpenAPI types...");
  await $`openapi-typescript ${apiUrl} -o packages/api-types/src/api.d.ts`;
}

await waitForApi();
await generate();

watch("apps/api/src/**/*.py").on("change", generate);
