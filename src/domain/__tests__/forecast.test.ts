import { describe, it, expect } from "vitest";
import { Decimal } from "decimal.js";
import { calculateForecast, getMonthProgress } from "../forecast";

const D = (v: string | number) => new Decimal(v);

describe("getMonthProgress", () => {
  it("día y total de días del mes", () => {
    expect(getMonthProgress("2026-11-14")).toEqual({ day: 14, daysInMonth: 30 });
    expect(getMonthProgress("2027-02-28")).toEqual({ day: 28, daysInMonth: 28 });
    expect(getMonthProgress("2028-02-10")).toEqual({ day: 10, daysInMonth: 29 });
  });
});

describe("calculateForecast (UC-29)", () => {
  it("proyecta con gasto diario promedio × días del mes", () => {
    const f = calculateForecast({ spentToDate: D(300), day: 10, daysInMonth: 30, liquidBalance: D(2000), pendingObligationsDueThisMonth: D(0) });
    expect(f.dailyAverage.toString()).toBe("30");
    expect(f.projectedMonthExpense.toString()).toBe("900");
    expect(f.projectedRemainingExpense.toString()).toBe("600");
    expect(f.projectedEndLiquid.toString()).toBe("1400");
    expect(f.isNegative).toBe(false);
  });

  it("resta las obligaciones pendientes del mes al saldo final", () => {
    const f = calculateForecast({ spentToDate: D(300), day: 10, daysInMonth: 30, liquidBalance: D(2000), pendingObligationsDueThisMonth: D(500) });
    expect(f.projectedEndLiquid.toString()).toBe("900");
  });

  it("marca saldo final negativo", () => {
    const f = calculateForecast({ spentToDate: D(900), day: 10, daysInMonth: 30, liquidBalance: D(1000), pendingObligationsDueThisMonth: D(0) });
    expect(f.projectedEndLiquid.toString()).toBe("-800");
    expect(f.isNegative).toBe(true);
  });

  it("el último día no queda gasto por proyectar", () => {
    const f = calculateForecast({ spentToDate: D(900), day: 30, daysInMonth: 30, liquidBalance: D(1000), pendingObligationsDueThisMonth: D(0) });
    expect(f.projectedRemainingExpense.toString()).toBe("0");
    expect(f.projectedEndLiquid.toString()).toBe("1000");
  });

  it("siempre se presenta como estimación y avisa de baja confianza al inicio del mes", () => {
    const early = calculateForecast({ spentToDate: D(100), day: 2, daysInMonth: 30, liquidBalance: D(1000), pendingObligationsDueThisMonth: D(0) });
    const later = calculateForecast({ spentToDate: D(100), day: 15, daysInMonth: 30, liquidBalance: D(1000), pendingObligationsDueThisMonth: D(0) });
    expect(early.isEstimate).toBe(true);
    expect(early.lowConfidence).toBe(true);
    expect(later.lowConfidence).toBe(false);
  });

  it("sin gastos proyecta cero gasto restante", () => {
    const f = calculateForecast({ spentToDate: D(0), day: 10, daysInMonth: 30, liquidBalance: D(500), pendingObligationsDueThisMonth: D(0) });
    expect(f.projectedEndLiquid.toString()).toBe("500");
  });

  it("conserva precisión decimal", () => {
    const f = calculateForecast({ spentToDate: D("0.3"), day: 3, daysInMonth: 30, liquidBalance: D(10), pendingObligationsDueThisMonth: D(0) });
    expect(f.projectedMonthExpense.toString()).toBe("3");
  });
});
