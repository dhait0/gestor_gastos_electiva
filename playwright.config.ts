import { defineConfig } from "@playwright/test";

// El puerto es configurable para no reutilizar por error un servidor de otro proyecto en :3000.
const PORT = process.env.E2E_PORT || "3000";
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

// En CI (o con E2E_PROD=1) se prueba el build de producción: `next dev` recompila rutas en frío y las
// acciones de servidor en vuelo fallaban con "unexpected response"; además así se prueba lo que se despliega.
const USE_PRODUCTION_BUILD = Boolean(process.env.CI || process.env.E2E_PROD);

export default defineConfig({
  testDir: "./e2e",
  // `next dev` compila rutas bajo demanda: en un runner de CI con la suite completa 30 s se quedaba corto
  timeout: 60_000,
  expect: { timeout: 10_000 },
  workers: process.env.CI ? 2 : undefined,
  use: {
    baseURL: BASE_URL,
    headless: true,
    trace: "on-first-retry",
  },
  webServer: {
    command: USE_PRODUCTION_BUILD ? `pnpm build && pnpm start --port ${PORT}` : `pnpm dev --port ${PORT}`,
    url: BASE_URL,
    timeout: USE_PRODUCTION_BUILD ? 300_000 : 120_000,
    reuseExistingServer: true,
  },
});
