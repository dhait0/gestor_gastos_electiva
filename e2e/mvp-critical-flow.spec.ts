import { test, expect, type Page } from "@playwright/test";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

async function registerUser(page: Page, email: string, password: string, displayName: string) {
  // Step 1: Sign up
  await page.goto(`${BASE_URL}/registro`);
  await page.waitForLoadState("networkidle");

  await page.fill('input[name="displayName"]', displayName);
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.fill('input[name="confirmPassword"]', password);

  await page.click('button[type="submit"]');
  await page.waitForLoadState("networkidle");
  
  // Step 2: Log in (signup doesn't auto-sign-in)
  await loginUser(page, email, password);
  
  // Step 3: Check if onboarding is needed
  const url = page.url();
  if (url.includes("/dashboard")) {
    // User might already have completed onboarding, check if we can access onboarding
    await page.goto(`${BASE_URL}/onboarding`);
    await page.waitForLoadState("networkidle");
    
    // If redirected to dashboard, onboarding is complete
    if (page.url().includes("/dashboard")) {
      return; // Onboarding already done
    }
  }
}

async function loginUser(page: Page, email: string, password: string) {
  await page.goto(`${BASE_URL}/login`);
  await page.waitForLoadState("networkidle");

  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);

  // Submit form - the server action doesn't redirect, so we wait for submission to complete
  await page.click('button[type="submit"]');
  // Wait for the button to not be pending (form submission complete)
  await page.waitForFunction(() => {
    const btn = document.querySelector('button[type="submit"]') as HTMLButtonElement | null;
    return btn && !btn.disabled && !btn.textContent?.includes("Iniciando");
  }, { timeout: 10000 });
  
  // Manually navigate to dashboard after successful login
  await page.goto(`${BASE_URL}/dashboard`);
  await page.waitForURL(`${BASE_URL}/dashboard`, { timeout: 10000 });
  await page.waitForLoadState("networkidle");
}

async function completeOnboarding(page: Page, accountName: string, initialBalance: string) {
  await page.goto(`${BASE_URL}/onboarding`);
  await page.waitForURL(`${BASE_URL}/onboarding`, { timeout: 10000 });
  await page.waitForLoadState("networkidle");

  // Capture browser console
  const consoleLogs: string[] = [];
  page.on('console', msg => {
    const text = msg.text();
    consoleLogs.push(text);
    // Log all console messages during step 3
    if (text.includes('Step3') || text.includes('state') || text.includes('onComplete') || text.includes('createFirstAccount') || msg.type() === 'error') {
      console.log("[BROWSER CONSOLE]:", text);
    }
  });
  
  page.on('pageerror', error => {
    console.log("[BROWSER ERROR]:", error.message);
  });
  
  // Capture network requests
  page.on('request', request => {
    if (request.url().includes('onboarding') || request.url().includes('action')) {
      console.log("[NETWORK REQUEST]:", request.method(), request.url());
      // Log headers for action requests
      const headers = request.headers();
      if (headers['next-action']) {
        console.log("[NETWORK REQUEST HEADERS]:", JSON.stringify(headers, null, 2));
      }
    }
  });
  
  page.on('response', async response => {
    if (response.url().includes('onboarding') || response.url().includes('action')) {
      console.log("[NETWORK RESPONSE]:", response.status(), response.url());
      try {
        const body = await response.text();
        console.log("[NETWORK RESPONSE BODY]:", body.substring(0, 500));
      } catch (err) {
        console.log("[NETWORK RESPONSE BODY ERROR]:", err instanceof Error ? err.message : String(err));
      }
    }
  });

  // Check if redirected to dashboard (onboarding already complete)
  if (page.url().includes("/dashboard")) {
    return;
  }

  // Step 1: Profile
  await expect(page.locator("main h1")).toContainText("Bienvenido a Lukiva");
  await page.waitForSelector('input[name="displayName"]', { state: "visible" });
  await page.fill('input[name="displayName"]', "Test User");
  await page.selectOption('select[name="currencyCode"]', "COP");
  await page.selectOption('select[name="timezone"]', "America/Bogota");
  await page.click('button:has-text("Continuar")');
  // Wait for form submission and step change
  await page.waitForLoadState("networkidle");
  
  // Check for error messages
  const errorMsg = await page.locator('[role="alert"]').textContent().catch(() => null);
  if (errorMsg) {
    console.log("Error message:", errorMsg);
  }
  
  // Debug: log page content if step 2 doesn't appear
  const safetyReserveVisible = await page.locator('input[name="safetyReserve"]').isVisible({ timeout: 5000 }).catch(() => false);
  if (!safetyReserveVisible) {
    const pageContent = await page.content();
    console.log("Page content when safetyReserve not visible:", pageContent.substring(0, 10000));
  }
  
  await page.waitForSelector('input[name="safetyReserve"]', { state: "visible", timeout: 10000 });

  // Step 2: Safety Reserve
  await expect(page.locator("main h1")).toContainText("Bienvenido a Lukiva");
  await page.fill('input[name="safetyReserve"]', "100000");
  await page.click('button:has-text("Continuar")');
  await page.waitForLoadState("networkidle");
  await page.waitForSelector('input[name="name"]', { state: "visible", timeout: 10000 });

  // Step 3: Account
  await expect(page.locator("main h1")).toContainText("Bienvenido a Lukiva");
  await page.fill('input[name="name"]', accountName);
  await page.click('input[name="type"][value="CHECKING"]');
  await page.fill('input[name="initialBalance"]', initialBalance);
  
  // Add console logging to capture client-side events
  await page.evaluate(() => {
    (window as unknown as { onCompleteCalled?: boolean; handleCompleteOriginal?: (...args: unknown[]) => void }).onCompleteCalled = false;
    (window as unknown as { onCompleteCalled?: boolean; handleCompleteOriginal?: (...args: unknown[]) => void }).handleCompleteOriginal = console.log;
    console.log = (...args) => {
      if (args[0] && typeof args[0] === 'string' && args[0].includes('handleComplete')) {
        (window as unknown as { onCompleteCalled?: boolean }).onCompleteCalled = true;
      }
      ((window as unknown as { handleCompleteOriginal?: (...args: unknown[]) => void }).handleCompleteOriginal || console.log).apply(console, args);
    };
  });
  
  await page.click('button:has-text("Comenzar a usar Lukiva")');
  // Wait for form submission to complete (button should be disabled during submission)
  await page.waitForFunction(() => {
    const btn = document.querySelector('button[type="submit"]') as HTMLButtonElement | null;
    return btn && !btn.disabled;
  }, { timeout: 10000 });
  
  // Check if onComplete was called
  const onCompleteCalled = await page.evaluate(() => (window as unknown as { onCompleteCalled?: boolean }).onCompleteCalled);
  console.log("onComplete called:", onCompleteCalled);
  
  await page.waitForURL(`${BASE_URL}/dashboard`, { timeout: 10000 });
}

async function createTransaction(page: Page, type: "income" | "expense", amount: string, description: string) {
  await page.goto(`${BASE_URL}/transacciones/nuevo?type=${type}`);
  await page.waitForLoadState("networkidle");

  await page.fill('input[name="amount"]', amount);
  await page.selectOption('select[name="account_id"]', { index: 1 });
  await page.selectOption('select[name="category_id"]', { index: 1 });
  await page.fill('input[name="description"]', description);
  // El layout tiene su propio submit (cerrar sesión): acotar al formulario de la página.
  await page.click('main form button[type="submit"]');
  await page.waitForURL(`${BASE_URL}/dashboard`, { timeout: 10000 });
}

async function createObligation(page: Page, name: string, amount: string, dueDate: string) {
  await page.goto(`${BASE_URL}/obligaciones/nueva`);
  await page.waitForLoadState("networkidle");

  await page.fill('input[name="name"]', name);
  await page.fill('input[name="amount"]', amount);
  await page.selectOption('select[name="currency_code"]', "COP");
  await page.fill('input[name="due_date"]', dueDate);
  await page.click('main form button[type="submit"]');
  await page.waitForURL(`${BASE_URL}/obligaciones`, { timeout: 10000 });
}

async function setSafetyReserve(page: Page, amount: string) {
  await page.goto(`${BASE_URL}/ajustes`);
  await page.waitForLoadState("networkidle");

  await page.fill('input[name="safetyReserve"]', amount);
  await page.click('main form button[type="submit"]');
  await page.waitForLoadState("networkidle");
}

async function logout(page: Page) {
  // Click the logout button in the user menu (top right)
  await page.click('button[aria-label="Cerrar sesión"]');
  await page.waitForURL(`${BASE_URL}/login`, { timeout: 5000 });
}

// test.describe.configure({ retries: 0 }); // Playwright-specific, not for Vitest

test.describe("FASE 21 - Flujo crítico MVP (E2E)", () => {
  test("registro → onboarding → crear cuenta → dashboard", async ({
    page,
  }) => {
    const uniqueId = Date.now();
    const email = `test-${uniqueId}@finwise.test`;
    const password = "TestPass123!";
    const displayName = `Usuario Test ${uniqueId}`;

    await registerUser(page, email, password, displayName);
    await completeOnboarding(page, "Cuenta Principal", "1000000");

    // Verify dashboard loads with "Dinero disponible"
    await expect(page.locator('p:has-text("Dinero disponible")')).toBeVisible();
    
    // Test passes - onboarding flow works
  });

  test("registro → onboarding → crear cuenta → ingreso → gasto → obligación → reserva → disponible", async ({
    page,
  }) => {
    const uniqueId = Date.now() + 5;
    const email = `test-flow-${uniqueId}@finwise.test`;
    const password = "TestPass123!";

    await registerUser(page, email, password, `Usuario Flujo ${uniqueId}`);
    // El onboarding fija una reserva de seguridad de 100.000.
    await completeOnboarding(page, "Cuenta Flujo", "1000000");

    await createTransaction(page, "income", "100000", "Ingreso flujo");
    await createTransaction(page, "expense", "30000", "Gasto flujo");

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    const dueDate = futureDate.toISOString().split("T")[0];
    await createObligation(page, "Obligación flujo", "200000", dueDate);

    // 1.000.000 + 100.000 - 30.000 - 200.000 - 100.000 (reserva) = 770.000
    await page.goto(`${BASE_URL}/dashboard`);
    await expect(page.locator("main").first()).toContainText(/770[.,]000/);

    // F02: desglose por categoría y filtro de período
    await expect(page.getByRole("heading", { name: "Gasto por categoría" })).toBeVisible();
    await expect(page.getByRole("progressbar").first()).toBeVisible();
    await page.getByRole("link", { name: "Mes anterior" }).click();
    await expect(page).toHaveURL(/period=previous/);
    await expect(page.locator("text=No hay gastos registrados")).toBeVisible();
  });

  test("déficit: disponible negativo cuando obligaciones > saldo", async ({ page }) => {
    const uniqueId = Date.now() + 1;
    const email = `test-deficit-${uniqueId}@finwise.test`;
    const password = "TestPass123!";
    const displayName = `Usuario Déficit ${uniqueId}`;

    await registerUser(page, email, password, displayName);
    await completeOnboarding(page, "Cuenta Principal", "100000");

    await createTransaction(page, "expense", "50000", "Gasto inicial");

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    const dueDate = futureDate.toISOString().split("T")[0];
    await createObligation(page, "Deuda grande", "200000", dueDate);

    await page.goto(`${BASE_URL}/dashboard`);
    await expect(page.locator("text=compromisos superan tu saldo").first()).toBeVisible();
  });

  test("usuario B no ve datos de usuario A", async ({ page, context }) => {
    const uniqueId = Date.now() + 2;
    const emailA = `test-isolation-${uniqueId}-a@finwise.test`;
    const emailB = `test-isolation-${uniqueId}-b@finwise.test`;
    const password = "TestPass123!";

    await registerUser(page, emailA, password, `Usuario A ${uniqueId}`);
    await completeOnboarding(page, "Cuenta A", "1000000");
    await createTransaction(page, "income", "500000", "Salario A");

    await logout(page);

    await registerUser(page, emailB, password, `Usuario B ${uniqueId}`);
    await completeOnboarding(page, "Cuenta B", "100000");

    await page.goto(`${BASE_URL}/dashboard`);
    await expect(page.locator("text=Saldo A")).not.toBeVisible();
    await expect(page.locator("text=Salario A")).not.toBeVisible();

await page.goto(`${BASE_URL}/transacciones`);
    await expect(page.locator("text=Salario A")).not.toBeVisible();
  });
});

test.describe("Autenticación básica", () => {
  test("login → dashboard → logout", async ({ page }) => {
    const uniqueId = Date.now() + 3;
    const email = `test-auth-${uniqueId}@finwise.test`;
    const password = "TestPass123!";

    await registerUser(page, email, password, `Usuario Auth ${uniqueId}`);
    await completeOnboarding(page, "Cuenta Auth", "100000");

    await logout(page);

    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/dashboard`, { timeout: 10000 });

    await expect(page.locator("text=Dashboard")).toBeVisible();
  });

  test("usuario no autenticado redirigido a login", async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForURL(`${BASE_URL}/login**`, { timeout: 5000 });
    await expect(page.locator("text=Iniciar sesión")).toBeVisible();
});
  
test.describe("Transacciones", () => {
  test("crear ingreso y gasto aparecen en movimientos", async ({ page }) => {
    const uniqueId = Date.now() + 4;
    const email = `test-tx-${uniqueId}@finwise.test`;
    const password = "TestPass123!";

    await registerUser(page, email, password, `Usuario TX ${uniqueId}`);
    await completeOnboarding(page, "Cuenta TX", "1000000");

    await createTransaction(page, "income", "100000", "Freelance");
    await createTransaction(page, "expense", "30000", "Transporte");

    await page.goto(`${BASE_URL}/transacciones`);
    await expect(page.locator("text=Freelance")).toBeVisible();
    await expect(page.locator("text=Transporte")).toBeVisible();
  });
});});


test.describe("Presupuestos (G03)", () => {
  test("crear presupuesto, consumirlo con un gasto y ver el estado", async ({ page }) => {
    const uniqueId = Date.now() + 6;
    await registerUser(page, `test-budget-${uniqueId}@finwise.test`, "TestPass123!", `Usuario Presupuesto ${uniqueId}`);
    await completeOnboarding(page, "Cuenta Presupuesto", "1000000");

    // Gasto de 80.000 en la primera categoría de gasto (índice 1 del select)
    await createTransaction(page, "expense", "80000", "Compra del mes");

    await page.goto(`${BASE_URL}/presupuestos/nuevo`);
    await page.waitForLoadState("networkidle");
    await page.selectOption('select[name="category_id"]', { index: 1 });
    await page.fill('input[name="limit_amount"]', "100000");
    await page.click('main form button[type="submit"]');
    await page.waitForURL(/\/presupuestos(\?|$)/, { timeout: 10000 });

    // 80.000 de 100.000 = 80 % → "Atención"
    await expect(page.getByRole("heading", { level: 2 }).first()).toBeVisible();
    await expect(page.locator("text=Atención")).toBeVisible();
    await expect(page.getByRole("progressbar").first()).toHaveAttribute("aria-valuenow", "80");

    // Duplicado: mismo mes y categoría → error legible
    await page.goto(`${BASE_URL}/presupuestos/nuevo`);
    await page.waitForLoadState("networkidle");
    await page.selectOption('select[name="category_id"]', { index: 1 });
    await page.fill('input[name="limit_amount"]', "50000");
    await page.click('main form button[type="submit"]');
    await expect(page.locator("text=Ya existe un presupuesto")).toBeVisible();

    // Eliminar (soft delete) y volver al estado vacío
    await page.goto(`${BASE_URL}/presupuestos`);
    page.once("dialog", (d) => d.accept());
    await page.getByRole("button", { name: /Eliminar presupuesto/ }).click();
    await expect(page.locator("text=Sin presupuestos en este mes")).toBeVisible();
  });
});


test.describe("Metas (H03)", () => {
  test("crear meta, aportar, completarla y revertir al eliminar un aporte", async ({ page }) => {
    const uniqueId = Date.now() + 7;
    await registerUser(page, `test-goal-${uniqueId}@finwise.test`, "TestPass123!", `Usuario Meta ${uniqueId}`);
    await completeOnboarding(page, "Cuenta Meta", "1000000");

    await page.goto(`${BASE_URL}/metas/nueva`);
    await page.waitForLoadState("networkidle");
    await page.fill('input[name="name"]', "Viaje E2E");
    await page.fill('input[name="target_amount"]', "100000");
    await page.click('main form button[type="submit"]');
    await page.waitForURL(/\/metas\/[0-9a-f-]{36}$/, { timeout: 10000 });
    await expect(page.getByRole("heading", { name: "Viaje E2E" })).toBeVisible();

    // Aporte parcial: 40 %
    await page.fill('input[name="amount"]', "40000");
    await page.click('main form button[type="submit"]');
    await expect(page.getByRole("progressbar").first()).toHaveAttribute("aria-valuenow", "40");

    // Aporte que completa la meta
    await page.fill('input[name="amount"]', "60000");
    await page.click('main form button[type="submit"]');
    await expect(page.locator("text=Meta cumplida")).toBeVisible();
    await expect(page.locator("text=Cumplida").first()).toBeVisible();

    // Eliminar el aporte de 60.000: vuelve a "En curso"
    page.once("dialog", (d) => d.accept());
    await page.getByRole("button", { name: "Eliminar aporte" }).first().click();
    await expect(page.locator("text=En curso").first()).toBeVisible();
    await expect(page.getByRole("progressbar").first()).toHaveAttribute("aria-valuenow", "40");

    // Aportar no mueve dinero entre cuentas: el disponible sigue igual
    await page.goto(`${BASE_URL}/dashboard`);
    await expect(page.locator("main").first()).toContainText(/900[.,]000/);
  });
});


test.describe("Recurrentes (I03)", () => {
  test("registrar vencidos una sola vez (idempotente) y reanudar sin back-fill", async ({ page }) => {
    const uniqueId = Date.now() + 8;
    await registerUser(page, `test-rec-${uniqueId}@finwise.test`, "TestPass123!", `Usuario Recurrente ${uniqueId}`);
    await completeOnboarding(page, "Cuenta Recurrente", "1000000");

    // Primer día del mes de hace dos meses: siempre hay exactamente 3 ocurrencias vencidas (m-2, m-1, m)
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    const startStr = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-01`;

    await page.goto(`${BASE_URL}/recurrentes/nuevo`);
    await page.waitForLoadState("networkidle");
    await page.fill('input[name="name"]', "Arriendo E2E");
    await page.fill('input[name="amount"]', "1000");
    await page.selectOption('select[name="account_id"]', { index: 1 });
    await page.selectOption('select[name="category_id"]', { index: 1 });
    await page.fill('input[name="start_date"]', startStr);
    await page.click('main form button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/recurrentes`, { timeout: 10000 });

    await expect(page.getByRole("button", { name: "Registrar 3 vencidos" })).toBeVisible();
    await page.getByRole("button", { name: "Registrar 3 vencidos" }).click();
    // La próxima ocurrencia pasa al primer día del mes siguiente cuando terminó el registro
    const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const nextStr = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}-01`;
    await expect(page.getByText(`Próxima: ${nextStr}`)).toBeVisible();
    await expect(page.getByRole("button", { name: /Registrar \d+ vencido/ })).toHaveCount(0);

    // Recargar no genera duplicados
    await page.reload();
    await expect(page.getByRole("button", { name: /Registrar \d+ vencido/ })).toHaveCount(0);

    // Los 3 movimientos existen en el libro
    await page.goto(`${BASE_URL}/transacciones`);
    await expect(page.getByText("Arriendo E2E")).toHaveCount(3);

    // Pausar y reanudar: no hay back-fill
    await page.goto(`${BASE_URL}/recurrentes`);
    await page.getByRole("button", { name: "Pausar" }).click();
    await expect(page.getByRole("button", { name: "Reanudar" })).toBeVisible();
    await page.getByRole("button", { name: "Reanudar" }).click();
    await expect(page.getByRole("button", { name: "Pausar" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Registrar \d+ vencido/ })).toHaveCount(0);
  });
});
