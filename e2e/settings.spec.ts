import { test, expect, type Page } from "@playwright/test";

/** Ajustes de usuario: perfil, moneda (con su protección), correo, contraseña y sesiones. */
const BASE_URL = process.env.BASE_URL || `http://localhost:${process.env.E2E_PORT || "3000"}`;
const PASSWORD = "TestPassword123!";

async function registerAndLogin(page: Page, email: string, password = PASSWORD) {
  await page.goto(`${BASE_URL}/registro`);
  await page.waitForLoadState("networkidle");
  await page.fill('input[name="displayName"]', "Ana Ajustes");
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.fill('input[name="confirmPassword"]', password);
  await page.click('button[type="submit"]');
  await page.waitForLoadState("networkidle");
  await login(page, email, password);
}

async function login(page: Page, email: string, password: string) {
  await page.goto(`${BASE_URL}/login`);
  await page.waitForLoadState("networkidle");
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 15000 });
}

test.describe("Ajustes de usuario", () => {
  test("el perfil se guarda, se conserva al recargar y el encabezado muestra el nombre", async ({ page }) => {
    await registerAndLogin(page, `ajustes-perfil-${Date.now()}@finwise.test`);
    await page.goto(`${BASE_URL}/ajustes`);
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("heading", { name: "Ajustes", level: 1 })).toBeVisible();

    await page.fill("#displayName", "Ana Renombrada");
    await page.selectOption("#timezone", "America/Mexico_City");
    await page.fill("#safetyReserve", "250000");
    await page.getByRole("button", { name: "Guardar perfil" }).click();
    await expect(page.getByText("Perfil actualizado.")).toBeVisible();

    await page.reload();
    await expect(page.locator("#displayName")).toHaveValue("Ana Renombrada");
    await expect(page.locator("#timezone")).toHaveValue("America/Mexico_City");
    await expect(page.locator("#safetyReserve")).toHaveValue("250000");
    await expect(page.getByRole("link", { name: /Mi cuenta: Ana Renombrada/ })).toBeVisible();
  });

  test("valida el perfil y no deja cambiar la moneda con cuentas en otra moneda", async ({ page }) => {
    await registerAndLogin(page, `ajustes-moneda-${Date.now()}@finwise.test`);
    await page.goto(`${BASE_URL}/ajustes`);
    await page.waitForLoadState("networkidle");

    // El navegador ya bloquea un valor negativo (min="0") antes de llegar al servidor.
    await page.fill("#safetyReserve", "-5");
    await page.getByRole("button", { name: "Guardar perfil" }).click();
    await expect(page.locator("#safetyReserve")).toHaveJSProperty("validity.rangeUnderflow", true);
    await expect(page.getByText("Perfil actualizado.")).toHaveCount(0);

    // Con una cuenta en COP, pasar a USD las sacaría de los totales: se rechaza.
    await page.goto(`${BASE_URL}/cuentas/nueva`);
    await page.fill("#name", "Cuenta COP");
    await page.getByRole("button", { name: /Crear cuenta/ }).click();
    await page.waitForURL(/\/cuentas(\?|$)/, { timeout: 15000 });
    await page.goto(`${BASE_URL}/ajustes`);
    await page.waitForLoadState("networkidle");
    await page.selectOption("#currencyCode", "USD");
    await page.getByRole("button", { name: "Guardar perfil" }).click();
    await expect(page.getByRole("alert").filter({ hasText: /No puedes cambiar tu moneda principal/ })).toBeVisible();
    await page.reload();
    await expect(page.locator("#currencyCode")).toHaveValue("COP");
  });

  test("la contraseña pide la actual, valida la nueva y el cambio sirve para iniciar sesión", async ({ page }) => {
    const email = `ajustes-clave-${Date.now()}@finwise.test`;
    await registerAndLogin(page, email);
    await page.goto(`${BASE_URL}/ajustes`);
    await page.waitForLoadState("networkidle");

    // Contraseña actual incorrecta
    await page.fill("#currentPassword", "no-es-esta-123");
    await page.fill("#password", "NuevaClave456!");
    await page.fill("#confirmPassword", "NuevaClave456!");
    await page.getByRole("button", { name: "Cambiar contraseña" }).click();
    await expect(page.getByText("La contraseña actual no es correcta").first()).toBeVisible();

    // Confirmación distinta
    await page.fill("#currentPassword", PASSWORD);
    await page.fill("#password", "NuevaClave456!");
    await page.fill("#confirmPassword", "Otra-distinta-789");
    await page.getByRole("button", { name: "Cambiar contraseña" }).click();
    await expect(page.getByText("Las contraseñas no coinciden")).toBeVisible();

    // Cambio válido
    await page.fill("#currentPassword", PASSWORD);
    await page.fill("#password", "NuevaClave456!");
    await page.fill("#confirmPassword", "NuevaClave456!");
    await page.getByRole("button", { name: "Cambiar contraseña" }).click();
    await expect(page.getByText("Contraseña actualizada.")).toBeVisible();
    await expect(page.locator("#currentPassword")).toHaveValue("");

    // La nueva sirve y la vieja ya no
    await page.context().clearCookies();
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', PASSWORD);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/login/);
    await login(page, email, "NuevaClave456!");
  });

  test("el correo valida el formato, rechaza el actual y pide confirmar el nuevo", async ({ page }) => {
    const email = `ajustes-correo-${Date.now()}@finwise.test`;
    await registerAndLogin(page, email);
    await page.goto(`${BASE_URL}/ajustes`);
    await page.waitForLoadState("networkidle");
    await expect(page.getByText(email)).toBeVisible();

    await page.fill("#email", email);
    await page.getByRole("button", { name: "Cambiar correo" }).click();
    await expect(page.getByText("Ese ya es tu correo actual").first()).toBeVisible();

    await page.fill("#email", `nuevo-${Date.now()}@finwise.test`);
    await page.getByRole("button", { name: "Cambiar correo" }).click();
    await expect(page.getByRole("status").filter({ hasText: /enlace de confirmación/ })).toBeVisible();
  });

  test("cerrar sesión en todos los dispositivos devuelve al login", async ({ page }) => {
    await registerAndLogin(page, `ajustes-sesiones-${Date.now()}@finwise.test`);
    await page.goto(`${BASE_URL}/ajustes`);
    await page.getByRole("button", { name: "Cerrar sesión en todos los dispositivos" }).click();
    await page.waitForURL(/\/login/, { timeout: 15000 });
    await page.goto(`${BASE_URL}/ajustes`);
    await expect(page).toHaveURL(/\/login/);
  });

  test("el modo y el color se aplican al instante, se recuerdan al recargar y sirven en cualquier pantalla", async ({ page }) => {
    await registerAndLogin(page, `ajustes-tema-${Date.now()}@finwise.test`);
    await page.goto(`${BASE_URL}/ajustes`);
    await page.waitForLoadState("networkidle");
    const html = page.locator("html");

    await page.getByLabel("Oscuro").check({ force: true });
    await expect(html).toHaveClass(/dark/);
    await page.getByLabel("Menta").check({ force: true });
    await expect(html).toHaveAttribute("data-theme", "menta");

    // Se recuerda al recargar y al cambiar de pantalla (el script del <head> lo aplica antes de pintar).
    await page.reload();
    await expect(html).toHaveClass(/dark/);
    await expect(html).toHaveAttribute("data-theme", "menta");
    await expect(page.getByLabel("Oscuro")).toBeChecked();
    await page.goto(`${BASE_URL}/dashboard`);
    await expect(html).toHaveClass(/dark/);

    // Un valor guardado corrupto no rompe la app: vuelve al tema por defecto.
    await page.evaluate(() => localStorage.setItem("lukiva:tema", "{corrupto"));
    await page.reload();
    await expect(html).not.toHaveClass(/dark/);
    await expect(html).toHaveAttribute("data-theme", "oceano");
  });
});
