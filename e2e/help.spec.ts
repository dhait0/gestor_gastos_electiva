import { test, expect, type Page } from "@playwright/test";

/**
 * Ayuda: botón flotante «?» + panel + recorrido guiado (driver.js).
 * El recorrido nunca arranca solo (no debe tapar la pantalla ni a los demás tests).
 */
const BASE_URL = process.env.BASE_URL || `http://localhost:${process.env.E2E_PORT || "3000"}`;

async function registerAndLogin(page: Page, email: string, password: string) {
  await page.goto(`${BASE_URL}/registro`);
  await page.waitForLoadState("networkidle");
  await page.fill('input[name="displayName"]', "Usuario Ayuda");
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.fill('input[name="confirmPassword"]', password);
  await page.click('button[type="submit"]');
  await page.waitForLoadState("networkidle");
  await page.goto(`${BASE_URL}/login`);
  await page.waitForLoadState("networkidle");
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 15000 });
}

for (const [name, viewport, pasosEsperados] of [
  // Escritorio fuera del Dashboard: «Movimientos» ya lo cubre el paso 3, así que son 8 (en el Dashboard serían 9).
  ["escritorio", { width: 1280, height: 800 }, 8],
  ["móvil", { width: 390, height: 844 }, 7],
] as const) {
  test.describe(`Ayuda y recorrido guiado · ${name}`, () => {
    test.use({ viewport });

    test("el «?» abre la ayuda de la sección y el recorrido se puede seguir y cerrar", async ({ page }) => {
      await registerAndLogin(page, `ayuda-${Date.now()}-${viewport.width}@finwise.test`, "TestPassword123!");
      await page.goto(`${BASE_URL}/cuentas`);
      await page.waitForLoadState("networkidle");

      // Nada se abre solo.
      await expect(page.locator(".driver-popover")).toHaveCount(0);
      const ayuda = page.getByRole("button", { name: "Ayuda y recorrido guiado" });
      await expect(ayuda).toBeVisible();

      // Panel con ayuda contextual, flujo y glosario.
      await ayuda.click();
      const panel = page.getByRole("dialog");
      await expect(panel.getByRole("heading", { name: "Ayuda de Lukiva" })).toBeVisible();
      await expect(panel.getByRole("heading", { name: /En esta pantalla: Cuentas/ })).toBeVisible();
      await expect(panel.getByRole("heading", { name: "Cómo usar Lukiva, paso a paso" })).toBeVisible();
      await expect(panel.getByText("Dinero disponible", { exact: true })).toBeVisible();

      // Recorrido: avanza por todos los pasos aplicables a este tamaño de pantalla y termina.
      await panel.getByRole("button", { name: "Iniciar recorrido guiado" }).click();
      await expect(page.locator(".driver-popover-title")).toHaveText("Bienvenido a Lukiva");
      for (let i = 1; i < pasosEsperados; i++) {
        await expect(page.locator(".driver-popover-progress-text")).toHaveText(`${i} de ${pasosEsperados}`);
        await page.locator(".driver-popover-next-btn").click();
      }
      await expect(page.locator(".driver-popover-title")).toHaveText("¿Dudas? Aquí estoy");
      await page.locator(".driver-popover-next-btn").click(); // «Listo»
      await expect(page.locator(".driver-popover")).toHaveCount(0);
    });

    test("Esc cierra el recorrido y el aviso del botón desaparece tras abrirlo", async ({ page }) => {
      await registerAndLogin(page, `ayuda-esc-${Date.now()}-${viewport.width}@finwise.test`, "TestPassword123!");
      await page.goto(`${BASE_URL}/dashboard`);
      await page.waitForLoadState("networkidle");

      const aviso = page.locator('[data-tour="ayuda"] [class*="animate-ping"]');
      await expect(aviso).toHaveCount(1); // primera vez: el botón late
      await page.getByRole("button", { name: "Ayuda y recorrido guiado" }).click();
      await expect(aviso).toHaveCount(0);
      await page.getByRole("button", { name: "Iniciar recorrido guiado" }).click();
      await expect(page.locator(".driver-popover")).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(page.locator(".driver-popover")).toHaveCount(0);

      // El aviso no vuelve (se recordó en localStorage).
      await page.reload();
      await page.waitForLoadState("networkidle");
      await expect(page.locator('[data-tour="ayuda"] [class*="animate-ping"]')).toHaveCount(0);
    });
  });
}
