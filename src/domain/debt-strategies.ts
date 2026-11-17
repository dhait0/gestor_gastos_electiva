import { Decimal } from "decimal.js";
import { monthlyInterest } from "./debts";

export type DebtStrategy = "SNOWBALL" | "AVALANCHE";

export interface StrategyDebt {
  id: string;
  name: string;
  current_balance: string | number | Decimal;
  interest_rate_percent: string | number | Decimal;
  minimum_payment: string | number | Decimal;
}

export const STRATEGY_LABELS: Record<DebtStrategy, string> = {
  SNOWBALL: "Bola de nieve (menor saldo primero)",
  AVALANCHE: "Avalancha (mayor tasa primero)",
};

/**
 * Orden de ataque (UC-35/36). Snowball: menor saldo primero. Avalanche: mayor
 * tasa primero. Los empates se resuelven por el criterio contrario y luego por
 * nombre, para que el resultado sea determinista. No ejecuta pagos.
 */
export function orderDebts<T extends StrategyDebt>(debts: T[], strategy: DebtStrategy): T[] {
  return [...debts].sort((a, b) => {
    const balance = new Decimal(a.current_balance).comparedTo(b.current_balance);
    const rate = new Decimal(b.interest_rate_percent).comparedTo(a.interest_rate_percent);
    const primary = strategy === "SNOWBALL" ? balance : rate;
    const secondary = strategy === "SNOWBALL" ? rate : balance;
    return primary || secondary || a.name.localeCompare(b.name);
  });
}

export interface PayoffStep {
  id: string;
  name: string;
  /** Mes (1 = el primero) en el que queda liquidada. */
  paidOffMonth: number;
}

export interface PayoffPlan {
  strategy: DebtStrategy;
  months: number;
  totalInterest: Decimal;
  totalPaid: Decimal;
  order: PayoffStep[];
}

/**
 * Plan de pago mensual: cada mes se paga el mínimo de todas las deudas y todo el
 * excedente del presupuesto va a la deuda prioritaria; al liquidar una, su pago
 * mínimo pasa a engrosar el excedente ("bola de nieve").
 *
 * Devuelve null si el presupuesto mensual no cubre los mínimos, si no hay
 * deudas por pagar o si no se liquidan en `maxMonths`.
 */
export function planDebtPayoff(
  debts: StrategyDebt[],
  monthlyBudget: string | number | Decimal,
  strategy: DebtStrategy,
  maxMonths = 600
): PayoffPlan | null {
  const ordered = orderDebts(debts, strategy).filter((d) => new Decimal(d.current_balance).gt(0));
  if (ordered.length === 0) return null;

  const budget = new Decimal(monthlyBudget);
  const minimums = ordered.reduce((s, d) => s.plus(d.minimum_payment), new Decimal(0));
  if (budget.lt(minimums)) return null;

  const state = ordered.map((d) => ({
    id: d.id,
    name: d.name,
    balance: new Decimal(d.current_balance),
    rate: new Decimal(d.interest_rate_percent),
    minimum: new Decimal(d.minimum_payment),
  }));

  let months = 0;
  let totalInterest = new Decimal(0);
  let totalPaid = new Decimal(0);
  const order: PayoffStep[] = [];

  while (state.some((d) => d.balance.gt(0))) {
    if (++months > maxMonths) return null;

    // Interés del mes sobre cada saldo
    for (const d of state) {
      if (d.balance.lte(0)) continue;
      const interest = monthlyInterest(d.balance, d.rate);
      d.balance = d.balance.plus(interest);
      totalInterest = totalInterest.plus(interest);
    }

    let available = budget;

    // 1) Mínimos de todas las deudas vivas (sin pasarse del saldo)
    for (const d of state) {
      if (d.balance.lte(0)) continue;
      const pay = Decimal.min(d.minimum, d.balance, available);
      d.balance = d.balance.minus(pay);
      available = available.minus(pay);
      totalPaid = totalPaid.plus(pay);
    }

    // 2) El excedente, en orden de prioridad
    for (const d of state) {
      if (available.lte(0)) break;
      if (d.balance.lte(0)) continue;
      const pay = Decimal.min(available, d.balance);
      d.balance = d.balance.minus(pay);
      available = available.minus(pay);
      totalPaid = totalPaid.plus(pay);
    }

    for (const d of state) {
      if (d.balance.lt("0.005")) d.balance = new Decimal(0);
      if (d.balance.isZero() && !order.some((o) => o.id === d.id)) {
        order.push({ id: d.id, name: d.name, paidOffMonth: months });
      }
    }

    // Sin amortización posible (mínimos que no cubren intereses y sin excedente): evitar bucle largo
    if (months === maxMonths) return null;
  }

  return { strategy, months, totalInterest, totalPaid, order };
}
