import { describe, it, expect } from "vitest";
import { Decimal } from "decimal.js";
import { calculateFinancialScore, getScoreBand, type ScoreInput } from "../score";

const D = (v: string | number) => new Decimal(v);
const base: ScoreInput = {
  liquidBalance: D(1000),
  availableToSpend: D(300),
  overdueObligations: 0,
  monthlyIncome: D(1000),
  monthlyExpense: D(800),
  budgetsTotal: 0,
  budgetsExceeded: 0,
  debtMinimumPayments: D(0),
};
const comp = (s: ReturnType<typeof calculateFinancialScore>, key: string) => s.components.find((c) => c.key === key)!;

describe("calculateFinancialScore (UC-40)", () => {
  it("es un indicador interno y explica cada componente", () => {
    const s = calculateFinancialScore(base);
    expect(s.isInternalIndicator).toBe(true);
    for (const c of s.components) expect(c.explanation.length).toBeGreaterThan(10);
  });

  it("disponible: 100 con ≥30 % del líquido, 0 sin disponible", () => {
    expect(comp(calculateFinancialScore(base), "available").score).toBe(100);
    expect(comp(calculateFinancialScore({ ...base, availableToSpend: D(150) }), "available").score).toBe(50);
    expect(comp(calculateFinancialScore({ ...base, availableToSpend: D(-10) }), "available").score).toBe(0);
  });

  it("sin saldo líquido el componente no aplica", () => {
    expect(comp(calculateFinancialScore({ ...base, liquidBalance: D(0) }), "available").score).toBeNull();
  });

  it("obligaciones: resta 25 por vencida con piso 0", () => {
    expect(comp(calculateFinancialScore(base), "obligations").score).toBe(100);
    expect(comp(calculateFinancialScore({ ...base, overdueObligations: 2 }), "obligations").score).toBe(50);
    expect(comp(calculateFinancialScore({ ...base, overdueObligations: 9 }), "obligations").score).toBe(0);
  });

  it("ahorro: 100 con tasa ≥20 %, proporcional por debajo y 0 con tasa negativa", () => {
    expect(comp(calculateFinancialScore({ ...base, monthlyExpense: D(800) }), "savings").score).toBe(100);
    expect(comp(calculateFinancialScore({ ...base, monthlyExpense: D(900) }), "savings").score).toBe(50);
    expect(comp(calculateFinancialScore({ ...base, monthlyExpense: D(1200) }), "savings").score).toBe(0);
    expect(comp(calculateFinancialScore({ ...base, monthlyIncome: D(0) }), "savings").score).toBeNull();
  });

  it("presupuestos: porcentaje de presupuestos no superados", () => {
    const s = calculateFinancialScore({ ...base, budgetsTotal: 4, budgetsExceeded: 1 });
    expect(comp(s, "budgets").score).toBe(75);
    expect(comp(calculateFinancialScore(base), "budgets").score).toBeNull();
  });

  it("deuda: 100 hasta 15 % de los ingresos, 0 desde 40 %", () => {
    expect(comp(calculateFinancialScore({ ...base, debtMinimumPayments: D(100) }), "debt").score).toBe(100);
    expect(comp(calculateFinancialScore({ ...base, debtMinimumPayments: D(275) }), "debt").score).toBe(50);
    expect(comp(calculateFinancialScore({ ...base, debtMinimumPayments: D(500) }), "debt").score).toBe(0);
    expect(comp(calculateFinancialScore(base), "debt").score).toBeNull();
  });

  it("el total es el promedio de los componentes con datos y los que no aplican no cuentan", () => {
    const s = calculateFinancialScore({ ...base, overdueObligations: 2, monthlyExpense: D(900) });
    // disponible 100, obligaciones 50, ahorro 50 → 67
    expect(s.total).toBe(67);
    expect(s.band).toBe("ON_TRACK");
  });

  it("sin datos suficientes no inventa un total", () => {
    const s = calculateFinancialScore({ ...base, liquidBalance: D(0), monthlyIncome: D(0) });
    // solo obligaciones aplica
    expect(s.total).toBeNull();
    expect(s.band).toBeNull();
  });

  it("bandas por umbral", () => {
    expect(getScoreBand(39)).toBe("ATTENTION");
    expect(getScoreBand(40)).toBe("ON_TRACK");
    expect(getScoreBand(69)).toBe("ON_TRACK");
    expect(getScoreBand(70)).toBe("HEALTHY");
  });
});
