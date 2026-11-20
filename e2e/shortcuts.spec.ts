import { test, expect, type Page } from "@playwright/test";

/** Atajos del iPhone: token en Ajustes → POST /api/atajos/movimientos → el movimiento aparece en la app. */
const BASE_URL = process.env.BASE_URL || `http://localhost:${process.env.E2E_PORT || "3000"}`;
const PASSWORD = "TestPassword123!";

async function registerAndLogin(page: Page, email: string) {
  await page.goto(`${BASE_URL}/registro`);
  await page.waitForLoadState("networkidle");
  await page.fill('input[name="displayName"]', "Ana Atajos");
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', PASSWORD);
  await page.fill('input[name="confirmPassword"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForLoadState("networkidle");
  await page.goto(`${BASE_URL}/login`);
  await page.waitForLoadState("networkidle");
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 15000 });
}

test.describe("Atajos del iPhone", () => {
  test("crear token, registrar por la API (con idempotencia), ver el movimiento y revocar", async ({ page, request }) => {
    await registerAndLogin(page, `atajos-${Date.now()}@finwise.test`);

    await page.goto(`${BASE_URL}/cuentas/nueva`);
    await page.fill("#name", "Efectivo E2E");
    await page.getByRole("button", { name: /Crear cuenta/ }).click();
    await page.waitForURL(/\/cuentas(\?|$)/, { timeout: 15000 });

    await page.goto(`${BASE_URL}/categorias/nueva`);
    await page.fill("#name", "Comida E2E");
    await page.getByRole("combobox").first().click();
    await page.getByRole("option", { name: /Gasto/ }).first().click();
    await page.getByRole("button", { name: /Crear categoría/ }).click();
    await page.waitForURL(/\/categorias(\?|$)/, { timeout: 15000 });

    // Crear el token: se muestra una sola vez y la guía usa los nombres reales de cuentas y categorías.
    await page.goto(`${BASE_URL}/ajustes`);
    await page.waitForLoadState("networkidle");
    await page.fill("#shortcut-name", "Mi iPhone E2E");
    await page.getByRole("button", { name: "Crear token" }).click();
    const token = (await page.getByTestId("shortcut-token").textContent())!.trim();
    expect(token).toMatch(/^lkv_[A-Za-z0-9_-]{43}$/);
    await expect(page.getByText("no se vuelve a mostrar")).toBeVisible();
    await expect(page.getByText("Efectivo E2E", { exact: false }).first()).toBeVisible();
    await page.reload();
    await expect(page.getByText(token)).toHaveCount(0); // tras recargar ya no está en pantalla
    await expect(page.getByText("Mi iPhone E2E")).toBeVisible();

    const url = `${BASE_URL}/api/atajos/movimientos`;
    const auth = { Authorization: `Bearer ${token}` };
    const body = { tipo: "gasto", monto: 45000, descripcion: "Almuerzo E2E", cuenta: "efectivo e2e", categoria: "comida e2e", clave: "e2e-clave-1" };

    const created = await request.post(url, { headers: auth, data: body });
    expect(created.status()).toBe(200);
    const json = await created.json();
    expect(json.ok).toBe(true);
    expect(json.mensaje).toContain("registrado en Efectivo E2E");
    expect(json.movimiento).toMatchObject({ duplicado: false, tipo: "EXPENSE", cuenta: "Efectivo E2E", categoria: "Comida E2E" });

    // El mismo atajo disparado dos veces no duplica el movimiento.
    const again = await (await request.post(url, { headers: auth, data: body })).json();
    expect(again.movimiento.duplicado).toBe(true);
    expect(again.movimiento.id).toBe(json.movimiento.id);

    // Errores claros para el atajo
    const noToken = await request.post(url, { data: body });
    expect(noToken.status()).toBe(401);
    const badToken = await request.post(url, { headers: { Authorization: `Bearer lkv_${"x".repeat(43)}` }, data: body });
    expect(badToken.status()).toBe(401);
    const badAccount = await request.post(url, { headers: auth, data: { ...body, cuenta: "No existe", clave: "e2e-clave-2" } });
    expect(badAccount.status()).toBe(400);
    expect((await badAccount.json()).mensaje).toContain("cuenta");
    const badAmount = await request.post(url, { headers: auth, data: { ...body, monto: "45.000,50", clave: "e2e-clave-3" } });
    expect(badAmount.status()).toBe(400);
    const notJson = await request.post(url, { headers: { ...auth, "Content-Type": "application/json" }, data: "{no es json" });
    expect(notJson.status()).toBe(400);

    // Las opciones lista nombres (sin datos financieros)
    const options = await (await request.get(`${BASE_URL}/api/atajos/opciones`, { headers: auth })).json();
    expect(options.cuentas.map((a: { nombre: string }) => a.nombre)).toContain("Efectivo E2E");
    expect(options.categorias_gasto).toContain("Comida E2E");

    // El movimiento aparece en la app
    await page.goto(`${BASE_URL}/transacciones`);
    await expect(page.getByText("Almuerzo E2E")).toHaveCount(1);

    // Revocar corta el acceso al instante
    await page.goto(`${BASE_URL}/ajustes`);
    await page.getByRole("button", { name: "Revocar token Mi iPhone E2E" }).click();
    await expect(page.getByText("Revocado")).toBeVisible();
    const revoked = await request.post(url, { headers: auth, data: { ...body, clave: "e2e-clave-4" } });
    expect(revoked.status()).toBe(401);
  });
});
