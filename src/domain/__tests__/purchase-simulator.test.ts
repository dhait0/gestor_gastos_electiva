import { describe, it, expect } from "vitest";
import { Decimal } from "decimal.js";
import { simulatePurchase, type SimulationInput } from "../purchase-simulator";

const D = (v: string | number) => new Decimal(v);
const base: SimulationInput = {
  amount: "200",
  accountType: "CHECKING",
  liquidBalance: D(1000),
  availableToSpend: D(600),
  budget: null,
  projectedEndLiquid: D(400),
  goalMonthlyCommitments: D(100),
};

describe("simulatePurchase (UC-39)", () => {
  it("no persiste nada y compara antes y después", () => {
    const r = simulatePurchase(base);
    expect(r.persisted).toBe(false);
    expect(r.liquidBefore.toString()).toBe("1000");
    expect(r.liquidAfter.toString()).toBe("800");
    expect(r.availableBefore.toString()).toBe("600");
    expect(r.availableAfter.toString()).toBe("400");
    expect(r.projectedEndLiquidAfter!.toString()).toBe("200");
    expect(r.warnings).toEqual([]);
  });

  it("no muta los datos de entrada", () => {
    const input = { ...base, liquidBalance: D(1000), availableToSpend: D(600) };
    simulatePurchase(input);
    expect(input.liquidBalance.toString()).toBe("1000");
    expect(input.availableToSpend.toString()).toBe("600");
  });

  it("rechaza montos no positivos", () => {
    expect(() => simulatePurchase({ ...base, amount: 0 })).toThrow();
    expect(() => simulatePurchase({ ...base, amount: "-5" })).toThrow();
  });

  it("tarjeta de crédito: no baja el saldo líquido, avisa del aumento de deuda", () => {
    const r = simulatePurchase({ ...base, accountType: "CREDIT_CARD" });
    expect(r.usesCredit).toBe(true);
    expect(r.liquidAfter.toString()).toBe("1000");
    expect(r.availableAfter.toString()).toBe("600");
    expect(r.warnings.some((w) => w.includes("tarjeta"))).toBe(true);
  });

  it("cuenta no líquida no afecta al saldo líquido", () => {
    expect(simulatePurchase({ ...base, accountType: "OTHER" }).liquidAfter.toString()).toBe("1000");
  });

  it("avisa cuando el disponible quedaría negativo y cuando supera el saldo líquido", () => {
    const r = simulatePurchase({ ...base, amount: 700 });
    expect(r.availableAfter.toString()).toBe("-100");
    expect(r.warnings.some((w) => w.includes("negativo"))).toBe(true);
    const big = simulatePurchase({ ...base, amount: 1500 });
    expect(big.warnings.some((w) => w.includes("saldo líquido"))).toBe(true);
  });

  it("presupuesto: cambia de estado y avisa al superarlo", () => {
    const r = simulatePurchase({ ...base, amount: 300, budget: { limit: D(1000), spent: D(750) } });
    expect(r.budget!.percentBefore).toBe(75);
    expect(r.budget!.percentAfter).toBe(105);
    expect(r.budget!.statusBefore).toBe("WARNING");
    expect(r.budget!.statusAfter).toBe("EXCEEDED");
    expect(r.budget!.remainingAfter.toString()).toBe("-50");
    expect(r.warnings.some((w) => w.includes("presupuesto"))).toBe(true);
  });

  it("presupuesto ya superado: no repite el aviso", () => {
    const r = simulatePurchase({ ...base, amount: 50, budget: { limit: D(1000), spent: D(1200) } });
    expect(r.warnings.some((w) => w.includes("presupuesto"))).toBe(false);
  });

  it("avisa si el disponible deja de cubrir los aportes a metas", () => {
    const r = simulatePurchase({ ...base, amount: 550, goalMonthlyCommitments: D(100) });
    expect(r.availableAfter.toString()).toBe("50");
    expect(r.coversGoalCommitments).toBe(false);
    expect(r.warnings.some((w) => w.includes("metas"))).toBe(true);
  });

  it("avisa si el forecast pasaría a negativo", () => {
    const r = simulatePurchase({ ...base, amount: 500, projectedEndLiquid: D(300) });
    expect(r.projectedEndLiquidAfter!.toString()).toBe("-200");
    expect(r.warnings.some((w) => w.includes("estimación"))).toBe(true);
  });

  it("sin forecast conocido no lo inventa", () => {
    expect(simulatePurchase({ ...base, projectedEndLiquid: null }).projectedEndLiquidAfter).toBeNull();
  });
});
