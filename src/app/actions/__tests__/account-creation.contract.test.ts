/**
 * CONTRATO DE CREACIÓN DE CUENTAS — estrategia B (Lukiva, B01 → implementado en B02)
 *
 * Especificación ejecutable de los dos flujos que crean cuentas financieras:
 *   1. Onboarding: `createFirstAccountAction` (primera cuenta del usuario).
 *   2. Gestión de cuentas: `createAccountAction` (cuenta adicional).
 *
 * Bajo la estrategia B el saldo inicial es un atributo de la cuenta:
 *   - la cuenta se inserta con `opening_balance`;
 *   - **no** se crea ninguna transacción de ingreso compensatoria
 *     (esa era la fuente de doble contabilización y además la BD la rechaza
 *     porque `transactions_income_rules` exige `category_id` en todo INCOME).
 *
 * Se ejecuta con:
 *   pnpm exec vitest run --config vitest.contract.config.mts
 *
 * También forma parte de la suite por defecto (`pnpm test`).
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createAccountAction } from "../accounts";
import { createFirstAccountAction } from "../onboarding";

interface InsertRecord {
  table: string;
  payload: Record<string, unknown>;
}

const inserts = vi.hoisted(() => [] as InsertRecord[]);

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: async () => createMockClient(),
}));

/** Cliente Supabase mínimo: registra los `insert` por tabla. */
function createMockClient() {
  function builder(table: string) {
    const chain = {
      insert(payload: Record<string, unknown>) {
        inserts.push({ table, payload });
        return chain;
      },
      select() {
        return chain;
      },
      eq() {
        return chain;
      },
      async single() {
        if (table === "accounts") {
          return { data: { id: "acc-nueva" }, error: null };
        }
        if (table === "profiles") {
          return { data: { currency_code: "COP" }, error: null };
        }
        return { data: null, error: null };
      },
    };
    return chain;
  }

  return {
    auth: {
      getUser: async () => ({ data: { user: { id: "user-1" } }, error: null }),
    },
    from: (table: string) => builder(table),
  };
}

function formDataCuenta(openingBalance: string): FormData {
  const data = new FormData();
  data.set("name", "Cuenta principal");
  data.set("type", "CHECKING");
  data.set("opening_balance", openingBalance);
  data.set("currency_code", "COP");
  return data;
}

function formDataOnboarding(initialBalance: string): FormData {
  const data = new FormData();
  data.set("name", "Cuenta principal");
  data.set("type", "CHECKING");
  data.set("initialBalance", initialBalance);
  data.set("currencyCode", "COP");
  return data;
}

const insertsEn = (table: string) => inserts.filter((i) => i.table === table);

describe("estrategia B — creación de cuentas sin transacción compensatoria", () => {
  beforeEach(() => {
    inserts.length = 0;
  });

  describe("flujo de gestión de cuentas (createAccountAction)", () => {
    it("persiste el saldo inicial en la cuenta", async () => {
      await createAccountAction({}, formDataCuenta("1000000"));

      const cuentas = insertsEn("accounts");
      expect(cuentas).toHaveLength(1);
      expect(cuentas[0].payload.opening_balance).toBe(1000000);
    });

    it("no crea ninguna transacción de saldo inicial compensatoria", async () => {
      await createAccountAction({}, formDataCuenta("1000000"));

      expect(insertsEn("transactions")).toHaveLength(0);
    });
  });

  describe("flujo de onboarding (createFirstAccountAction)", () => {
    it("persiste el saldo inicial en la cuenta", async () => {
      await createFirstAccountAction({ success: true }, formDataOnboarding("1000000"));

      const cuentas = insertsEn("accounts");
      expect(cuentas).toHaveLength(1);
      expect(cuentas[0].payload.opening_balance).toBe(1000000);
    });

    it("no crea ninguna transacción de saldo inicial compensatoria", async () => {
      await createFirstAccountAction({ success: true }, formDataOnboarding("1000000"));

      expect(insertsEn("transactions")).toHaveLength(0);
    });

    it("termina con redirección al dashboard", async () => {
      const resultado = await createFirstAccountAction(
        { success: true },
        formDataOnboarding("1000000")
      );

      expect(resultado).toEqual({ success: true, redirectTo: "/dashboard" });
    });
  });

  it("ninguno de los dos flujos duplica el saldo inicial", async () => {
    await createAccountAction({}, formDataCuenta("1000000"));
    await createFirstAccountAction({ success: true }, formDataOnboarding("250000"));

    // El saldo inicial vive solo en la cuenta: cero transacciones compensatorias.
    expect(insertsEn("transactions")).toHaveLength(0);
    expect(insertsEn("accounts")).toHaveLength(2);
    expect(insertsEn("accounts")[0].payload.opening_balance).toBe(1000000);
    expect(insertsEn("accounts")[1].payload.opening_balance).toBe(250000);
  });
});
