import { test, expect } from "@playwright/test";

/**
 * UC-03: recuperar contraseña. Lee el correo real del Mailpit del Supabase local
 * (puerto 54324 por defecto); si no está disponible, el test se omite.
 */
const BASE_URL = process.env.BASE_URL || `http://localhost:${process.env.E2E_PORT || "3000"}`;
const MAIL_URL = process.env.E2E_MAIL_URL || "http://127.0.0.1:54324";

async function mailAvailable(): Promise<boolean> {
  try {
    return (await fetch(`${MAIL_URL}/api/v1/messages`, { signal: AbortSignal.timeout(2000) })).ok;
  } catch {
    return false;
  }
}

async function waitForRecoveryLink(email: string): Promise<string> {
  for (let i = 0; i < 20; i++) {
    const search = await fetch(`${MAIL_URL}/api/v1/search?query=${encodeURIComponent(`to:${email}`)}`);
    const { messages } = (await search.json()) as { messages: { ID: string }[] };
    if (messages?.length) {
      const full = (await (await fetch(`${MAIL_URL}/api/v1/message/${messages[0].ID}`)).json()) as { Text: string; HTML: string };
      const match = (full.HTML || full.Text).match(/https?:\/\/[^"\s<>]+\/auth\/v1\/verify[^"\s<>]+/);
      if (match) return match[0].replace(/&amp;/g, "&");
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`No llegó el correo de recuperación a ${email}`);
}

test.describe("Recuperar contraseña (UC-03)", () => {
  test("el flujo completo cambia la contraseña y la respuesta es neutral", async ({ page }) => {
    test.skip(!(await mailAvailable()), "Requiere el Mailpit del Supabase local");

    const id = Date.now();
    const email = `test-reset-${id}@finwise.test`;
    const oldPassword = "TestPass123!";
    const newPassword = "NuevaClave456!";

    // Alta de la cuenta
    await page.goto(`${BASE_URL}/registro`);
    await page.waitForLoadState("networkidle");
    await page.fill('input[name="displayName"]', "Usuario Reset");
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', oldPassword);
    await page.fill('input[name="confirmPassword"]', oldPassword);
    await page.click('button[type="submit"]');
    await page.waitForLoadState("networkidle");

    // El enlace del login ya no es un 404
    await page.goto(`${BASE_URL}/login`);
    await page.getByRole("link", { name: "¿Olvidaste tu contraseña?" }).click();
    await expect(page.getByRole("heading", { name: "Recupera tu acceso" })).toBeVisible();

    // Respuesta neutral para un correo inexistente (no enumera cuentas)
    await page.fill('input[name="email"]', `no-existe-${id}@finwise.test`);
    await page.click('button[type="submit"]');
    const neutral = page.getByText(/Si el correo corresponde a una cuenta/);
    await expect(neutral).toBeVisible();

    // Y la misma respuesta para el correo real
    await page.goto(`${BASE_URL}/forgot-password`);
    await page.fill('input[name="email"]', email);
    await page.click('button[type="submit"]');
    await expect(page.getByText(/Si el correo corresponde a una cuenta/)).toBeVisible();

    // El enlace del correo se sigue sin pasar por la lista de redirecciones del Supabase local
    const verifyUrl = await waitForRecoveryLink(email);
    const verify = await fetch(verifyUrl, { redirect: "manual" });
    const location = verify.headers.get("location") ?? "";
    const code = new URL(location, "http://x").searchParams.get("code");
    expect(code, `Supabase no devolvió un código: ${location}`).toBeTruthy();

    await page.goto(`${BASE_URL}/auth/callback?code=${code}&next=/reset-password`);
    await expect(page.getByRole("heading", { name: "Nueva contraseña" })).toBeVisible();

    // Las contraseñas deben coincidir
    await page.fill('input[name="password"]', newPassword);
    await page.fill('input[name="confirmPassword"]', "otra-distinta");
    await page.click('main form button[type="submit"]');
    await expect(page.getByText("Las contraseñas no coinciden")).toBeVisible();

    await page.fill('input[name="password"]', newPassword);
    await page.fill('input[name="confirmPassword"]', newPassword);
    await page.click('main form button[type="submit"]');
    await page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 15000 });

    // La contraseña anterior ya no sirve y la nueva sí
    await page.context().clearCookies();
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', oldPassword);
    await page.click('button[type="submit"]');
    await expect(page.locator('[role="alert"]').first()).toBeVisible();

    // React 19 limpia el formulario tras cada acción: se vuelve a escribir el correo
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', newPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 15000 });
  });

  test("sin enlace válido /reset-password pide iniciar sesión", async ({ page }) => {
    await page.goto(`${BASE_URL}/reset-password`);
    await page.waitForURL(/\/login/);
  });

  test("las páginas legales enlazadas desde el login existen", async ({ page }) => {
    for (const [path, title] of [["/terminos", "Términos de servicio"], ["/privacidad", "Política de privacidad"]]) {
      await page.goto(`${BASE_URL}${path}`);
      await expect(page.getByRole("heading", { name: title })).toBeVisible();
    }
  });
});
