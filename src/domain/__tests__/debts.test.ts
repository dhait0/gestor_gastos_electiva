import { describe, it, expect } from "vitest";
import { monthlyInterest, paidPercent, simulatePayoff, summarizeDebts, validateDebtPayment } from "../debts";

describe("paidPercent", () => {
  it("calcula el capital ya pagado", () => {
    expect(paidPercent({ original_amount: "1000", current_balance: "250" })).toBe(75);
    expect(paidPercent({ original_amount: "1000", current_balance: "1000" })).toBe(0);
    expect(paidPercent({ original_amount: "1000", current_balance: "0" })).toBe(100);
  });
  it("tiene tope 0–100", () => {
    expect(paidPercent({ original_amount: "1000", current_balance: "1200" })).toBe(0);
  });
});

describe("validateDebtPayment (espeja record_debt_payment)", () => {
  const debt = { current_balance: "1000", status: "ACTIVE" as const };
  it("devuelve el capital = abono − interés", () => {
    const r = validateDebtPayment(debt, "300", "50");
    expect("principal" in r && r.principal.toString()).toBe("250");
  });
  it.each([
    [{ ...debt }, "0", "0", "mayor a 0"],
    [{ ...debt }, "10", "20", "entre 0"],
    [{ ...debt }, "10", "-1", "entre 0"],
    [{ ...debt, status: "PAID" as const }, "10", "0", "no admite"],
    [{ ...debt, status: "CANCELLED" as const }, "10", "0", "no admite"],
    [{ ...debt }, "1001", "0", "supera el saldo"],
  ])("rechaza casos inválidos (%#)", (d, amount, interest, fragment) => {
    const r = validateDebtPayment(d, amount, interest);
    expect("error" in r && r.error).toContain(fragment);
  });
  it("permite liquidar exactamente el saldo", () => {
    const r = validateDebtPayment(debt, "1000");
    expect("principal" in r && r.principal.toString()).toBe("1000");
  });
  it("el interés no reduce el saldo: abono 1100 con 100 de interés liquida", () => {
    const r = validateDebtPayment(debt, "1100", "100");
    expect("principal" in r && r.principal.toString()).toBe("1000");
  });
});

describe("monthlyInterest y simulatePayoff", () => {
  it("interés mensual = saldo × tasa / 100 / 12", () => {
    expect(monthlyInterest("12000", "12").toString()).toBe("120");
  });
  it("sin interés: meses = ceil(saldo / pago)", () => {
    const s = simulatePayoff("1000", "0", "300")!;
    expect(s.months).toBe(4);
    expect(s.totalInterest.toString()).toBe("0");
    expect(s.totalPaid.toString()).toBe("1000");
  });
  it("con interés: paga más que el saldo y tarda al menos lo mismo", () => {
    const s = simulatePayoff("1000", "24", "300")!;
    expect(s.months).toBeGreaterThanOrEqual(4);
    expect(s.totalInterest.gt(0)).toBe(true);
    expect(s.totalPaid.minus(1000).toDecimalPlaces(2).toString()).toBe(s.totalInterest.toDecimalPlaces(2).toString());
  });
  it("devuelve null si el pago no cubre el interés", () => {
    expect(simulatePayoff("10000", "60", "40")).toBeNull();
  });
  it("saldo cero: 0 meses", () => {
    expect(simulatePayoff("0", "10", "50")!.months).toBe(0);
  });
});

describe("summarizeDebts", () => {
  it("suma solo activas de la moneda base", () => {
    const t = summarizeDebts(
      [
        { original_amount: "1000", current_balance: "400", currency_code: "COP", minimum_payment: "50", status: "ACTIVE" },
        { original_amount: "500", current_balance: "0", currency_code: "COP", minimum_payment: "20", status: "PAID" },
        { original_amount: "500", current_balance: "300", currency_code: "USD", minimum_payment: "10", status: "ACTIVE" },
      ],
      "COP"
    );
    expect(t.balance.toString()).toBe("400");
    expect(t.minimumPayments.toString()).toBe("50");
    expect(t.count).toBe(1);
  });
});
