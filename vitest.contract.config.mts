import { defineConfig } from "vitest/config";

/**
 * Configuración de las pruebas de CONTRATO (Lukiva, B01/B02).
 *
 * Ejecuta los archivos `*.contract.test.ts`, que especifican el comportamiento
 * del saldo inicial bajo la estrategia B ("el saldo inicial es un atributo de
 * la cuenta, no una transacción de ingreso"):
 *
 *   pnpm exec vitest run --config vitest.contract.config.mts
 *
 * Desde B02 los contratos se cumplen y están **integrados en la suite por
 * defecto** (`pnpm test`). Esta configuración se conserva para poder ejecutar
 * únicamente los contratos de forma aislada durante el diagnóstico.
 */
export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },

  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.contract.test.ts"],
    exclude: ["**/e2e/**", "**/supabase/**", "**/node_modules/**", "**/dist/**"],
  },
});
