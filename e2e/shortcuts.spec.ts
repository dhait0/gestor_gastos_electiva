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

    // Opción GET (sin cuerpo): para cuando el POST con JSON falla en la app Atajos
    const viaGet = await request.get(`${url}?cuenta=${encodeURIComponent("Efectivo E2E")}&categoria=${encodeURIComponent("Comida E2E")}&monto=12000&descripcion=${encodeURIComponent("Café con tilde á")}&clave=e2e-get-1`, { headers: auth });
    expect(viaGet.status()).toBe(200);
    expect((await viaGet.json()).mensaje).toContain("registrado en Efectivo E2E");
    expect((await (await request.get(`${url}?cuenta=Efectivo%20E2E&categoria=Comida%20E2E&monto=12000&clave=e2e-get-1`, { headers: auth })).json()).movimiento.duplicado).toBe(true);
    expect((await request.get(`${url}?monto=12000&categoria=Comida%20E2E`)).status()).toBe(401); // sin token
    expect((await request.get(`${url}?monto=abc&categoria=Comida%20E2E&cuenta=Efectivo%20E2E`, { headers: auth })).status()).toBe(400);

    // POST con «Formulario» (lo más fiable en Atajos): descripción con espacios y tildes, y el monto como lo escribe el teléfono (45.000)
    const viaForm = await request.post(url, { headers: auth, form: { tipo: "gasto", monto: "45.000", descripcion: "Almuerzo con amigos de la oficina", cuenta: "Efectivo E2E", categoria: "Comida E2E", clave: "e2e-form-1" } });
    expect(viaForm.status()).toBe(200);
    expect((await viaForm.json()).movimiento).toMatchObject({ monto: 45000, duplicado: false });
    const viaMultipart = await request.post(url, { headers: auth, multipart: { tipo: "gasto", monto: "1.250,50", descripcion: "Mercado de la semana", cuenta: "Efectivo E2E", categoria: "Comida E2E", clave: "e2e-multi-1" } });
    expect(viaMultipart.status()).toBe(200);
    expect((await viaMultipart.json()).movimiento).toMatchObject({ monto: 1250.5 });

    // Errores claros para el atajo
    const noToken = await request.post(url, { data: body });
    expect(noToken.status()).toBe(401);
    const badToken = await request.post(url, { headers: { Authorization: `Bearer lkv_${"x".repeat(43)}` }, data: body });
    expect(badToken.status()).toBe(401);
    const badAccount = await request.post(url, { headers: auth, data: { ...body, cuenta: "No existe", clave: "e2e-clave-2" } });
    expect(badAccount.status()).toBe(400);
    expect((await badAccount.json()).mensaje).toContain("cuenta");
    const badAmount = await request.post(url, { headers: auth, data: { ...body, monto: "cuarenta mil", clave: "e2e-clave-3" } });
    expect(badAmount.status()).toBe(400);
    const notJson = await request.post(url, { headers: { ...auth, "Content-Type": "application/json" }, data: "{no es json" });
    expect(notJson.status()).toBe(400);

    // Las opciones lista nombres (sin datos financieros)
    const options = await (await request.get(`${BASE_URL}/api/atajos/opciones`, { headers: auth })).json();
    expect(options.cuentas.map((a: { nombre: string }) => a.nombre)).toContain("Efectivo E2E");
    expect(options.categorias_gasto).toContain("Comida E2E");
    expect(options.cuentas_nombres).toEqual(["Efectivo E2E"]); // lista simple para «Elegir de la lista»

    // El movimiento aparece en la app
    await page.goto(`${BASE_URL}/transacciones`);
    await expect(page.getByText("Almuerzo E2E")).toHaveCount(1);
    await expect(page.getByText("Café con tilde á")).toHaveCount(1);
    await expect(page.getByText("Almuerzo con amigos de la oficina")).toHaveCount(1); // la descripción llega completa

    // Revocar corta el acceso al instante
    await page.goto(`${BASE_URL}/ajustes`);
    await page.getByRole("button", { name: "Revocar token Mi iPhone E2E" }).click();
    await expect(page.getByText("Revocado")).toBeVisible();
    const revoked = await request.post(url, { headers: auth, data: { ...body, clave: "e2e-clave-4" } });
    expect(revoked.status()).toBe(401);
  });
});
