import { describe, it, expect } from "vitest";
import { orderDebts, planDebtPayoff, type StrategyDebt } from "../debt-strategies";

const debts: StrategyDebt[] = [
  { id: "a", name: "Tarjeta", current_balance: "5000", interest_rate_percent: "36", minimum_payment: "200" },
  { id: "b", name: "Préstamo", current_balance: "2000", interest_rate_percent: "12", minimum_payment: "100" },
  { id: "c", name: "Familiar", current_balance: "800", interest_rate_percent: "0", minimum_payment: "50" },
];

describe("orderDebts (UC-35/36)", () => {
  it("snowball: menor saldo primero", () => {
    expect(orderDebts(debts, "SNOWBALL").map((d) => d.id)).toEqual(["c", "b", "a"]);
  });
  it("avalanche: mayor tasa primero", () => {
    expect(orderDebts(debts, "AVALANCHE").map((d) => d.id)).toEqual(["a", "b", "c"]);
  });
  it("los empates se resuelven por el criterio contrario y luego por nombre", () => {
    const tie: StrategyDebt[] = [
      { id: "x", name: "Zeta", current_balance: "100", interest_rate_percent: "10", minimum_payment: "10" },
      { id: "y", name: "Alfa", current_balance: "100", interest_rate_percent: "10", minimum_payment: "10" },
      { id: "z", name: "Beta", current_balance: "100", interest_rate_percent: "20", minimum_payment: "10" },
    ];
    expect(orderDebts(tie, "SNOWBALL").map((d) => d.id)).toEqual(["z", "y", "x"]);
  });
  it("no muta el arreglo original", () => {
    const copy = [...debts];
    orderDebts(debts, "SNOWBALL");
    expect(debts).toEqual(copy);
  });
});

describe("planDebtPayoff", () => {
  it("rechaza un presupuesto que no cubre los mínimos y la lista vacía", () => {
    expect(planDebtPayoff(debts, "300", "SNOWBALL")).toBeNull();
    expect(planDebtPayoff([], "1000", "SNOWBALL")).toBeNull();
  });

  it("sin interés y una deuda: meses = ceil(saldo / presupuesto)", () => {
    const plan = planDebtPayoff([{ id: "c", name: "Familiar", current_balance: "800", interest_rate_percent: "0", minimum_payment: "50" }], "300", "SNOWBALL")!;
    expect(plan.months).toBe(3);
    expect(plan.totalInterest.toString()).toBe("0");
    expect(plan.totalPaid.toString()).toBe("800");
    expect(plan.order).toEqual([{ id: "c", name: "Familiar", paidOffMonth: 3 }]);
  });

  it("liquida todas las deudas y reporta el orden de liquidación", () => {
    const plan = planDebtPayoff(debts, "800", "SNOWBALL")!;
    expect(plan.order.map((o) => o.id)).toHaveLength(3);
    expect(plan.order[0].id).toBe("c");
    expect(plan.order.map((o) => o.paidOffMonth)).toEqual([...plan.order.map((o) => o.paidOffMonth)].sort((a, b) => a - b));
    expect(plan.months).toBe(plan.order[plan.order.length - 1].paidOffMonth);
  });

  it("el total pagado es el capital más los intereses", () => {
    const plan = planDebtPayoff(debts, "800", "AVALANCHE")!;
    expect(plan.totalPaid.minus(7800).minus(plan.totalInterest).abs().lt("0.05")).toBe(true);
  });

  it("avalanche paga menos intereses que snowball cuando la deuda cara es la grande", () => {
    const snowball = planDebtPayoff(debts, "800", "SNOWBALL")!;
    const avalanche = planDebtPayoff(debts, "800", "AVALANCHE")!;
    expect(avalanche.totalInterest.lte(snowball.totalInterest)).toBe(true);
  });

  it("es determinista", () => {
    const a = planDebtPayoff(debts, "800", "SNOWBALL")!;
    const b = planDebtPayoff(debts, "800", "SNOWBALL")!;
    expect(a.months).toBe(b.months);
    expect(a.totalInterest.toString()).toBe(b.totalInterest.toString());
  });

  it("devuelve null si el interés supera lo que se paga (no se liquida nunca)", () => {
    const stuck = [{ id: "s", name: "Cara", current_balance: "100000", interest_rate_percent: "60", minimum_payment: "100" }];
    expect(planDebtPayoff(stuck, "100", "AVALANCHE")).toBeNull();
  });

  it("más presupuesto reduce los meses", () => {
    const slow = planDebtPayoff(debts, "400", "AVALANCHE")!;
    const fast = planDebtPayoff(debts, "1000", "AVALANCHE")!;
    expect(fast.months).toBeLessThan(slow.months);
  });
});
