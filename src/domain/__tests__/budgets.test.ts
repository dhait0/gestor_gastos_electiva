import { describe, it, expect } from "vitest";
import { calculateBudgetUsage, getBudgetMonthRange, getBudgetStatus, planBudgetCopy, shiftMonth } from "../budgets";
import type { Transaction, TransactionType } from "../transactions";

const budget = { category_id: "c1", period_month: "2026-11-01", limit_amount: "1000", currency_code: "COP" };

function tx(id: string, amount: string, date: string, extra: Partial<Transaction> = {}, type: TransactionType = "EXPENSE"): Transaction {
  return {
    id,
    account_id: "a1",
    category_id: "c1",
    type,
    direction: type === "INCOME" ? "INFLOW" : "OUTFLOW",
    amount,
    currency_code: "COP",
    description: id,
    transaction_date: date,
    created_at: "",
    updated_at: "",
    deleted_at: null,
    user_id: "u1",
    ...extra,
  };
}

describe("getBudgetStatus (UC-23)", () => {
  it.each([
    [0, "NORMAL"],
    [69.9, "NORMAL"],
    [70, "WARNING"],
    [89.9, "WARNING"],
    [90, "HIGH"],
    [99.9, "HIGH"],
    [100, "EXCEEDED"],
    [250, "EXCEEDED"],
  ])("%s%% → %s", (pct, status) => {
    expect(getBudgetStatus(pct)).toBe(status);
  });
});

describe("getBudgetMonthRange", () => {
  it("noviembre tiene 30 días, febrero 28 y bisiesto 29", () => {
    expect(getBudgetMonthRange("2026-11-01").end).toBe("2026-11-30");
    expect(getBudgetMonthRange("2027-02-01").end).toBe("2027-02-28");
    expect(getBudgetMonthRange("2028-02-01").end).toBe("2028-02-29");
  });
});

describe("calculateBudgetUsage", () => {
  it("sin gastos: 0 % consumido y todo el límite disponible", () => {
    const u = calculateBudgetUsage([], budget);
    expect(u.spent.toString()).toBe("0");
    expect(u.remaining.toString()).toBe("1000");
    expect(u.percent).toBe(0);
    expect(u.status).toBe("NORMAL");
  });

  it("suma gastos del mes en la categoría y calcula restante y porcentaje", () => {
    const u = calculateBudgetUsage([tx("1", "300", "2026-11-02"), tx("2", "450", "2026-11-30")], budget);
    expect(u.spent.toString()).toBe("750");
    expect(u.remaining.toString()).toBe("250");
    expect(u.percent).toBe(75);
    expect(u.status).toBe("WARNING");
  });

  it("al superar el límite el restante es negativo y el estado EXCEEDED", () => {
    const u = calculateBudgetUsage([tx("1", "1200", "2026-11-05")], budget);
    expect(u.remaining.toString()).toBe("-200");
    expect(u.percent).toBe(120);
    expect(u.status).toBe("EXCEEDED");
  });

  it("no consumen: otra categoría, otro mes, otra moneda, eliminados, ingresos ni transferencias", () => {
    const u = calculateBudgetUsage(
      [
        tx("1", "100", "2026-11-05", { category_id: "otra" }),
        tx("2", "100", "2026-10-31"),
        tx("3", "100", "2026-12-01"),
        tx("4", "100", "2026-11-05", { currency_code: "USD" }),
        tx("5", "100", "2026-11-05", { deleted_at: "2026-11-06T00:00:00Z" }),
        tx("6", "100", "2026-11-05", {}, "INCOME"),
        tx("7", "100", "2026-11-05", {}, "TRANSFER"),
      ],
      budget
    );
    expect(u.spent.toString()).toBe("0");
  });

  it("el estado usa el porcentaje exacto, no el redondeado", () => {
    const u = calculateBudgetUsage([tx("1", "999.6", "2026-11-05")], budget);
    expect(u.percent).toBe(100);
    expect(u.status).toBe("HIGH");
  });

  it("conserva precisión decimal", () => {
    const u = calculateBudgetUsage([tx("1", "0.1", "2026-11-05"), tx("2", "0.2", "2026-11-05")], budget);
    expect(u.spent.toString()).toBe("0.3");
  });
});

describe("shiftMonth", () => {
  it("avanza y retrocede cruzando el año", () => {
    expect(shiftMonth("2026-11", 1)).toBe("2026-12");
    expect(shiftMonth("2026-12", 1)).toBe("2027-01");
    expect(shiftMonth("2026-01", -1)).toBe("2025-12");
    expect(shiftMonth("2026-03", -14)).toBe("2025-01");
  });
});

describe("planBudgetCopy (UC-25)", () => {
  const previous = [
    { id: "p1", category_id: "c1", limit_amount: "100" },
    { id: "p2", category_id: "c2", limit_amount: "200" },
    { id: "p3", category_id: "c3", limit_amount: "300" },
  ];

  it("copia todos si no hay selección ni existentes", () => {
    const plan = planBudgetCopy(previous, []);
    expect(plan.toCreate.map((b) => b.id)).toEqual(["p1", "p2", "p3"]);
    expect(plan.skipped).toEqual([]);
  });
  it("copia solo los seleccionados", () => {
    expect(planBudgetCopy(previous, [], ["p2"]).toCreate.map((b) => b.id)).toEqual(["p2"]);
    expect(planBudgetCopy(previous, [], []).toCreate).toEqual([]);
  });
  it("evita duplicados: las categorías que ya tienen presupuesto se omiten", () => {
    const plan = planBudgetCopy(previous, ["c2"]);
    expect(plan.toCreate.map((b) => b.id)).toEqual(["p1", "p3"]);
    expect(plan.skipped.map((b) => b.id)).toEqual(["p2"]);
  });
  it("no duplica una categoría repetida dentro del mes origen", () => {
    const plan = planBudgetCopy([...previous, { id: "p4", category_id: "c1", limit_amount: "999" }], []);
    expect(plan.toCreate.map((b) => b.id)).toEqual(["p1", "p2", "p3"]);
    expect(plan.skipped.map((b) => b.id)).toEqual(["p4"]);
  });
  it("ignora ids seleccionados que no existen y no muta la entrada", () => {
    const copy = JSON.stringify(previous);
    expect(planBudgetCopy(previous, [], ["zzz"]).toCreate).toEqual([]);
    expect(JSON.stringify(previous)).toBe(copy);
  });
});
