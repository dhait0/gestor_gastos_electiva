import { describe, it, expect } from "vitest";
import {
  calculateExpenseBreakdown,
  calculateIncomeExpenseInRange,
  getPeriodRange,
  parseDashboardPeriod,
} from "../analytics";
import type { Transaction, TransactionType } from "../transactions";

const TZ = "America/Bogota";
const NOW = new Date("2026-11-14T12:00:00Z");

function tx(
  id: string,
  type: TransactionType,
  amount: string,
  date: string,
  extra: Partial<Transaction> = {}
): Transaction {
  return {
    id,
    account_id: "a1",
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

describe("getPeriodRange", () => {
  it("current: mes en curso", () => {
    expect(getPeriodRange("current", TZ, NOW)).toEqual({ start: "2026-11-01", end: "2026-11-30" });
  });
  it("previous: mes anterior completo", () => {
    expect(getPeriodRange("previous", TZ, NOW)).toEqual({ start: "2026-10-01", end: "2026-10-31" });
  });
  it("previous cruza el año en enero", () => {
    expect(getPeriodRange("previous", TZ, new Date("2026-01-10T12:00:00Z"))).toEqual({
      start: "2025-12-01",
      end: "2025-12-31",
    });
  });
  it("last3: incluye el mes actual y los dos anteriores", () => {
    expect(getPeriodRange("last3", TZ, NOW)).toEqual({ start: "2026-09-01", end: "2026-11-30" });
  });
  it("year: desde enero hasta el fin del mes actual", () => {
    expect(getPeriodRange("year", TZ, NOW)).toEqual({ start: "2026-01-01", end: "2026-11-30" });
  });
  it("respeta la zona horaria al cambiar de mes", () => {
    // 1 de diciembre 02:00 UTC sigue siendo 30 de noviembre en Bogotá (UTC-5)
    expect(getPeriodRange("current", TZ, new Date("2026-12-01T02:00:00Z")).start).toBe("2026-11-01");
  });
});

describe("parseDashboardPeriod", () => {
  it("acepta valores válidos y cae a 'current' en cualquier otro caso", () => {
    expect(parseDashboardPeriod("last3")).toBe("last3");
    expect(parseDashboardPeriod(["year"])).toBe("year");
    expect(parseDashboardPeriod("hack")).toBe("current");
    expect(parseDashboardPeriod(undefined)).toBe("current");
  });
});

describe("calculateIncomeExpenseInRange", () => {
  const range = { start: "2026-10-01", end: "2026-10-31" };
  it("suma solo ingresos y gastos del rango, sin transferencias, otras monedas ni eliminados", () => {
    const r = calculateIncomeExpenseInRange(
      [
        tx("i1", "INCOME", "1000", "2026-10-02"),
        tx("e1", "EXPENSE", "300", "2026-10-31"),
        tx("e2", "EXPENSE", "50", "2026-11-01"),
        tx("t1", "TRANSFER", "999", "2026-10-05"),
        tx("u1", "EXPENSE", "70", "2026-10-06", { currency_code: "USD" }),
        tx("d1", "EXPENSE", "80", "2026-10-07", { deleted_at: "2026-10-08T00:00:00Z" }),
      ],
      "COP",
      range
    );
    expect(r.income.toString()).toBe("1000");
    expect(r.expense.toString()).toBe("300");
  });
});

describe("calculateExpenseBreakdown", () => {
  const range = { start: "2026-11-01", end: "2026-11-30" };
  const cats = [
    { id: "c1", name: "Alimentación", color: "#FFC777" },
    { id: "c2", name: "Transporte", color: "#315CF5" },
  ];

  it("agrupa por categoría, ordena de mayor a menor y calcula porcentajes", () => {
    const b = calculateExpenseBreakdown(
      [
        tx("1", "EXPENSE", "300", "2026-11-02", { category_id: "c1" }),
        tx("2", "EXPENSE", "100", "2026-11-03", { category_id: "c2" }),
        tx("3", "EXPENSE", "100", "2026-11-04", { category_id: "c1" }),
      ],
      cats,
      "COP",
      range
    );
    expect(b.map((i) => i.name)).toEqual(["Alimentación", "Transporte"]);
    expect(b[0].amount.toString()).toBe("400");
    expect(b[0].percent).toBe(80);
    expect(b[1].percent).toBe(20);
  });

  it("agrupa gastos sin categoría o con categoría desconocida", () => {
    const b = calculateExpenseBreakdown(
      [
        tx("1", "EXPENSE", "10", "2026-11-02"),
        tx("2", "EXPENSE", "10", "2026-11-03", { category_id: "otra" }),
      ],
      cats,
      "COP",
      range
    );
    expect(b).toHaveLength(1);
    expect(b[0].name).toBe("Sin categoría");
    expect(b[0].categoryId).toBeNull();
    expect(b[0].percent).toBe(100);
  });

  it("ignora ingresos, transferencias, eliminados, otras monedas y fechas fuera de rango", () => {
    const b = calculateExpenseBreakdown(
      [
        tx("1", "INCOME", "500", "2026-11-02", { category_id: "c1" }),
        tx("2", "TRANSFER", "500", "2026-11-02", { category_id: "c1" }),
        tx("3", "EXPENSE", "500", "2026-10-30", { category_id: "c1" }),
        tx("4", "EXPENSE", "500", "2026-11-02", { category_id: "c1", currency_code: "USD" }),
        tx("5", "EXPENSE", "500", "2026-11-02", { category_id: "c1", deleted_at: "x" }),
      ],
      cats,
      "COP",
      range
    );
    expect(b).toEqual([]);
  });

  it("los porcentajes usan Decimal (un tercio exacto a 1 decimal)", () => {
    const b = calculateExpenseBreakdown(
      [
        tx("1", "EXPENSE", "1", "2026-11-02", { category_id: "c1" }),
        tx("2", "EXPENSE", "2", "2026-11-02", { category_id: "c2" }),
      ],
      cats,
      "COP",
      range
    );
    expect(b[0].percent).toBe(66.7);
    expect(b[1].percent).toBe(33.3);
  });
});
