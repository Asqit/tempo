import { watch } from "chokidar";
import { join } from "path";
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
  const output = await $`openapi-typescript ${apiUrl}`.text();
  await Bun.write(
    join(import.meta.dir, "../packages/api-types/src/api.d.ts"),
    output,
  );
}

await waitForApi();
await generate();

watch("apps/api/src/**/*.py").on("change", generate);
