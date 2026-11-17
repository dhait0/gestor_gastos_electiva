import { test, expect, type Page } from "@playwright/test";

/**
 * P01: auditoría automatizable de responsive y accesibilidad sobre las rutas
 * principales, con un viewport móvil. No sustituye una revisión con lector de
 * pantalla, pero detecta regresiones frecuentes.
 */
const BASE_URL = process.env.BASE_URL || `http://localhost:${process.env.E2E_PORT || "3000"}`;

const ROUTES = [
  "/dashboard",
  "/transacciones/transferir",
  "/presupuestos/copiar?month=2026-11",
  "/recurrentes/nuevo",
  "/cuentas",
  "/categorias",
  "/transacciones",
  "/transacciones/nuevo?type=expense",
  "/obligaciones",
  "/presupuestos",
  "/presupuestos/nuevo",
  "/metas",
  "/metas/nueva",
  "/recurrentes",
  "/recurrentes/nuevo",
  "/suscripciones",
  "/suscripciones/nueva",
  "/deudas",
  "/deudas/nueva",
  "/deudas/estrategia",
  "/alertas",
  "/analisis",
  "/simulador",
  "/ajustes",
];

async function login(page: Page, email: string, password: string) {
  await page.goto(`${BASE_URL}/registro`);
  await page.waitForLoadState("networkidle");
  await page.fill('input[name="displayName"]', "Usuario A11y");
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

for (const [name, viewport] of [
  ["móvil 390 px", { width: 390, height: 844 }],
  ["escritorio 1280 px", { width: 1280, height: 800 }],
] as const) {
  test.describe(`Responsive y accesibilidad (P01) · ${name}`, () => {
  test.use({ viewport });

  test("las rutas principales no desbordan y exponen controles con nombre", async ({ page }) => {
    test.setTimeout(240000);
    await login(page, `test-a11y-${Date.now()}@finwise.test`, "TestPass123!");

    const problems: string[] = [];

    for (const route of ROUTES) {
      // Onboarding obligatorio hasta completarlo: las rutas internas pueden redirigir; se omiten esas
      await page.goto(`${BASE_URL}${route}`);
      await page.waitForLoadState("networkidle");
      if (page.url().includes("/onboarding")) continue;

      const report = await page.evaluate(() => {
        const issues: string[] = [];
        const root = document.documentElement;
        if (root.scrollWidth > root.clientWidth + 1) {
          const offenders = [...document.querySelectorAll("body *")]
            .filter((el) => el.getBoundingClientRect().right > root.clientWidth + 1)
            .slice(0, 3)
            .map((el) => `<${el.tagName.toLowerCase()} class="${(el.getAttribute("class") ?? "").slice(0, 60)}">`);
          issues.push(`desbordamiento horizontal (${root.scrollWidth}px > ${root.clientWidth}px) por ${offenders.join(", ")}`);
        }
        if (!document.documentElement.lang) issues.push("falta lang en <html>");
        if (!document.title.trim()) issues.push("falta <title>");

        const visible = (el: Element) => {
          // Lo oculto para tecnologías de apoyo (p. ej. el <select> nativo que Radix mantiene en el DOM) no cuenta
          if (el.closest('[aria-hidden="true"]')) return false;
          const r = (el as HTMLElement).getBoundingClientRect();
          const style = getComputedStyle(el as HTMLElement);
          return r.width > 0 && r.height > 0 && style.visibility !== "hidden" && style.display !== "none";
        };

        const nameOf = (el: Element): string => {
          const aria = el.getAttribute("aria-label")?.trim();
          if (aria) return aria;
          const labelledby = el.getAttribute("aria-labelledby");
          if (labelledby) {
            const text = labelledby.split(/\s+/).map((id) => document.getElementById(id)?.textContent ?? "").join(" ").trim();
            if (text) return text;
          }
          const id = el.getAttribute("id");
          if (id) {
            const label = document.querySelector(`label[for="${CSS.escape(id)}"]`);
            if (label?.textContent?.trim()) return label.textContent.trim();
          }
          const wrapping = el.closest("label");
          if (wrapping?.textContent?.trim()) return wrapping.textContent.trim();
          return (el.textContent ?? "").trim() || el.getAttribute("title")?.trim() || el.getAttribute("placeholder")?.trim() || "";
        };

        document.querySelectorAll("input:not([type=hidden]), select, textarea").forEach((el) => {
          if (visible(el) && !nameOf(el)) issues.push(`control sin nombre accesible: <${el.tagName.toLowerCase()} name="${el.getAttribute("name") ?? ""}">`);
        });
        document.querySelectorAll("button, a[href]").forEach((el) => {
          if (visible(el) && !nameOf(el)) issues.push(`${el.tagName.toLowerCase()} sin nombre accesible`);
        });
        document.querySelectorAll("img").forEach((el) => {
          if (visible(el) && !el.hasAttribute("alt")) issues.push("imagen sin atributo alt");
        });

        const h1s = [...document.querySelectorAll("h1")].filter(visible);
        if (h1s.length !== 1) issues.push(`se esperaba 1 <h1> visible y hay ${h1s.length}`);
        return issues;
      });

      for (const issue of report) problems.push(`${route}: ${issue}`);
    }

    expect(problems, problems.join("\n")).toEqual([]);
  });
  });
}
