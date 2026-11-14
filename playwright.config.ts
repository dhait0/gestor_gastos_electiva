import { defineConfig } from "@playwright/test";

// El puerto es configurable para no reutilizar por error un servidor de otro proyecto en :3000.
const PORT = process.env.E2E_PORT || "3000";
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  use: {
    baseURL: BASE_URL,
    headless: true,
    trace: "on-first-retry",
  },
  webServer: {
    command: `pnpm dev --port ${PORT}`,
    url: BASE_URL,
    timeout: 120000,
    reuseExistingServer: true,
  },
});
