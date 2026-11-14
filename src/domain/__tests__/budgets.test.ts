import { describe, it, expect } from "vitest";
import { calculateBudgetUsage, getBudgetMonthRange, getBudgetStatus } from "../budgets";
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
