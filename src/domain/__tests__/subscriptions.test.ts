import { describe, it, expect } from "vitest";
import { annualCost, daysBetween, getNextRenewal, monthlyEquivalent, paymentsPerYear, summarizeSubscriptions } from "../subscriptions";

describe("costos recurrentes", () => {
  it("mensual: 12 cobros, equivalente mensual = monto", () => {
    const s = { amount: "30000", frequency: "MONTHLY" as const };
    expect(annualCost(s).toString()).toBe("360000");
    expect(monthlyEquivalent(s).toString()).toBe("30000");
  });
  it("anual: costo anual = monto y mensual = monto / 12", () => {
    const s = { amount: "120000", frequency: "YEARLY" as const };
    expect(annualCost(s).toString()).toBe("120000");
    expect(monthlyEquivalent(s).toString()).toBe("10000");
  });
  it("trimestral y semanal", () => {
    expect(paymentsPerYear("QUARTERLY").toString()).toBe("4");
    expect(annualCost({ amount: "10", frequency: "WEEKLY" }).toString()).toBe("520");
  });
  it("cada N días usa 365 / N cobros al año", () => {
    expect(annualCost({ amount: "100", frequency: "CUSTOM", custom_interval_days: 73 }).toString()).toBe("500");
  });
  it("CUSTOM sin intervalo válido lanza error", () => {
    expect(() => paymentsPerYear("CUSTOM", 0)).toThrow();
  });
});

describe("getNextRenewal", () => {
  it("si la fecha ya es futura la conserva", () => {
    expect(getNextRenewal({ frequency: "MONTHLY", next_payment_date: "2026-12-05" }, "2026-11-14")).toBe("2026-12-05");
  });
  it("si quedó atrasada, avanza al siguiente cobro", () => {
    expect(getNextRenewal({ frequency: "MONTHLY", next_payment_date: "2026-09-05" }, "2026-11-14")).toBe("2026-12-05");
  });
  it("el día de hoy cuenta como próximo cobro", () => {
    expect(getNextRenewal({ frequency: "MONTHLY", next_payment_date: "2026-10-14" }, "2026-11-14")).toBe("2026-11-14");
  });
});

describe("daysBetween", () => {
  it("cuenta días naturales, también entre meses y años", () => {
    expect(daysBetween("2026-11-14", "2026-11-17")).toBe(3);
    expect(daysBetween("2026-12-30", "2027-01-02")).toBe(3);
    expect(daysBetween("2026-11-14", "2026-11-10")).toBe(-4);
  });
});

describe("summarizeSubscriptions", () => {
  const subs = [
    { amount: "30000", currency_code: "COP", frequency: "MONTHLY" as const, next_payment_date: "2026-12-01", status: "ACTIVE" as const },
    { amount: "120000", currency_code: "COP", frequency: "YEARLY" as const, next_payment_date: "2027-03-01", status: "ACTIVE" as const },
    { amount: "999", currency_code: "COP", frequency: "MONTHLY" as const, next_payment_date: "2026-12-01", status: "PAUSED" as const },
    { amount: "10", currency_code: "USD", frequency: "MONTHLY" as const, next_payment_date: "2026-12-01", status: "ACTIVE" as const },
  ];
  it("suma solo activas de la moneda base", () => {
    const t = summarizeSubscriptions(subs, "COP");
    expect(t.count).toBe(2);
    expect(t.annual.toString()).toBe("480000");
    expect(t.monthly.toString()).toBe("40000");
  });
  it("sin suscripciones: ceros", () => {
    expect(summarizeSubscriptions([], "COP").annual.toString()).toBe("0");
  });
});
