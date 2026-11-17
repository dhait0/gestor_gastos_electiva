import { describe, it, expect } from "vitest";
import { Decimal } from "decimal.js";
import { generateInsights, type InsightInput } from "../insights";

const D = (v: string | number) => new Decimal(v);
const base: InsightInput = {
  income: D(1000),
  expense: D(900),
  breakdown: [],
  previousMonthExpense: D(0),
  projectedMonthExpense: D(0),
  dayOfMonth: 15,
  subscriptionsMonthly: D(0),
  debtMonthlyInterest: D(0),
};
const ids = (i: InsightInput) => generateInsights(i).map((x) => x.id);

describe("generateInsights", () => {
  it("sin señales no genera insights", () => {
    expect(generateInsights(base)).toEqual([]);
  });

  it("toda explicación es no vacía (nunca una caja negra)", () => {
    const all = generateInsights({
      ...base,
      expense: D(1500),
      breakdown: [{ categoryId: "c", name: "Comida", color: null, amount: D(900), percent: 60 }],
      previousMonthExpense: D(1000),
      projectedMonthExpense: D(1500),
      subscriptionsMonthly: D(200),
      debtMonthlyInterest: D(50),
    });
    expect(all.length).toBeGreaterThanOrEqual(5);
    for (const i of all) expect(i.explanation.length).toBeGreaterThan(20);
  });

  it("categoría dominante: desde 40 %", () => {
    const item = (percent: number) => ({ categoryId: "c", name: "Comida", color: null, amount: D(1), percent });
    expect(ids({ ...base, breakdown: [item(39.9)] })).not.toContain("top-category");
    expect(ids({ ...base, breakdown: [item(40)] })).toContain("top-category");
  });

  it("gasta más de lo que ingresa", () => {
    expect(ids({ ...base, expense: D(1100) })).toContain("overspending");
    expect(ids({ ...base, expense: D(900) })).not.toContain("overspending");
  });

  it("buen ritmo de ahorro desde 20 %", () => {
    expect(ids({ ...base, expense: D(800) })).toContain("saving-well");
    expect(ids({ ...base, expense: D(801) })).not.toContain("saving-well");
  });

  it("sin ingresos no habla de ahorro ni de sobregasto", () => {
    const r = ids({ ...base, income: D(0), expense: D(500) });
    expect(r).not.toContain("overspending");
    expect(r).not.toContain("saving-well");
  });

  it("tendencia de gasto: solo desde el día 10 y con +20 %", () => {
    const trend = { ...base, previousMonthExpense: D(1000), projectedMonthExpense: D(1200) };
    expect(ids(trend)).toContain("spending-trend");
    expect(ids({ ...trend, dayOfMonth: 9 })).not.toContain("spending-trend");
    expect(ids({ ...trend, projectedMonthExpense: D(1199) })).not.toContain("spending-trend");
    expect(ids({ ...trend, previousMonthExpense: D(0) })).not.toContain("spending-trend");
  });

  it("peso de suscripciones desde 10 % de los ingresos", () => {
    expect(ids({ ...base, subscriptionsMonthly: D(100) })).toContain("subscriptions-weight");
    expect(ids({ ...base, subscriptionsMonthly: D(99) })).not.toContain("subscriptions-weight");
  });

  it("intereses de deuda sugiere comparar estrategias", () => {
    const [i] = generateInsights({ ...base, debtMonthlyInterest: D(10) });
    expect(i.id).toBe("debt-interest");
    expect(i.message).toContain("avalancha");
  });

  it("los ids son únicos", () => {
    const all = generateInsights({
      ...base,
      expense: D(1500),
      breakdown: [{ categoryId: "c", name: "X", color: null, amount: D(1), percent: 90 }],
      previousMonthExpense: D(1000),
      projectedMonthExpense: D(1500),
      subscriptionsMonthly: D(500),
      debtMonthlyInterest: D(5),
    });
    expect(new Set(all.map((i) => i.id)).size).toBe(all.length);
  });
});
