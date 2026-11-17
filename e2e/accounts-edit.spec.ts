import { test, expect, type Page } from "@playwright/test";

/**
 * Regresión: la edición de cuentas estaba rota de tres maneras a la vez.
 *  1) «Editar» del menú no navegaba (un <Link> envolvía al ítem de Radix).
 *  2) La pantalla de edición era un componente de cliente `async` y entraba en un
 *     bucle infinito de peticiones al servidor: nunca terminaba de cargar.
 *  3) Guardar fallaba en silencio: el checkbox «Archivada» llegaba como null/"on"
 *     y la validación esperaba un booleano. Tampoco había forma de desarchivar.
 */
const BASE_URL = process.env.BASE_URL || `http://localhost:${process.env.E2E_PORT || "3000"}`;

async function registerAndLogin(page: Page, email: string, password: string) {
  await page.goto(`${BASE_URL}/registro`);
  await page.waitForLoadState("networkidle");
  await page.fill('input[name="displayName"]', "Usuario Cuentas");
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

test.describe("Editar, archivar y desarchivar cuentas", () => {
  test("el menú edita, y una cuenta archivada se puede desarchivar de dos formas", async ({ page }) => {
    await registerAndLogin(page, `cuentas-${Date.now()}@finwise.test`, "TestPassword123!");

    // Crear una cuenta con saldo inicial negativo (sobregiro).
    await page.goto(`${BASE_URL}/cuentas/nueva`);
    await page.fill("#name", "Cuenta Nómina");
    await page.getByRole("combobox").first().click();
    await page.getByRole("option", { name: /Cuenta corriente/ }).click();
    await page.fill("#opening_balance", "-50000");
    await page.getByRole("button", { name: /Crear cuenta/ }).click();
    await page.waitForURL(/\/cuentas$/, { timeout: 15000 });
    await expect(page.getByText("Cuenta Nómina")).toBeVisible();

    // 1) «Editar» del menú navega y la pantalla carga (no se queda en bucle).
    await page.getByRole("button", { name: "Acciones de Cuenta Nómina" }).click();
    await page.getByRole("menuitem", { name: "Editar" }).click();
    await expect(page.getByRole("heading", { name: "Editar cuenta" })).toBeVisible({ timeout: 15000 });
    await expect(page.locator("#opening_balance")).toHaveValue("-50000");

    // 2) Guardar un cambio funciona.
    await page.fill("#name", "Nómina Bogotá");
    await page.getByRole("button", { name: "Guardar cambios" }).click();
    await page.waitForURL(/\/cuentas$/, { timeout: 15000 });
    await expect(page.getByText("Nómina Bogotá")).toBeVisible();

    // 3) Archivar desde el menú y desarchivar desde el menú.
    await page.getByRole("button", { name: "Acciones de Nómina Bogotá" }).click();
    await page.getByRole("menuitem", { name: "Archivar" }).click();
    await expect(page.getByText(/Archivadas \(1\)/)).toBeVisible();
    await page.getByRole("button", { name: "Acciones de Nómina Bogotá" }).click();
    await page.getByRole("menuitem", { name: "Desarchivar" }).click();
    await expect(page.getByText(/Activas \(1\)/)).toBeVisible();

    // 4) Archivar otra vez y desarchivar con el checkbox de la edición.
    await page.getByRole("button", { name: "Acciones de Nómina Bogotá" }).click();
    await page.getByRole("menuitem", { name: "Archivar" }).click();
    await expect(page.getByText(/Archivadas \(1\)/)).toBeVisible();
    await page.getByRole("button", { name: "Acciones de Nómina Bogotá" }).click();
    await page.getByRole("menuitem", { name: "Editar" }).click();
    await expect(page.locator("#is_archived")).toBeChecked();
    await page.locator("#is_archived").uncheck();
    await page.getByRole("button", { name: "Guardar cambios" }).click();
    await page.waitForURL(/\/cuentas$/, { timeout: 15000 });
    await expect(page.getByText(/Activas \(1\)/)).toBeVisible();
  });
});
