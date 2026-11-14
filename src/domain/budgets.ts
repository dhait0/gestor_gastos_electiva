import { Decimal } from "decimal.js";
import type { Transaction } from "./transactions";

export type BudgetStatus = "NORMAL" | "WARNING" | "HIGH" | "EXCEEDED";

export interface BudgetLike {
  category_id: string;
  /** Primer día del mes (YYYY-MM-DD). */
  period_month: string;
  limit_amount: string | number | Decimal;
  currency_code: string;
}

export interface BudgetUsage {
  spent: Decimal;
  remaining: Decimal;
  /** Porcentaje consumido con un decimal (puede superar 100). */
  percent: number;
  status: BudgetStatus;
}

/** Primer y último día (YYYY-MM-DD) del mes de `periodMonth`. */
export function getBudgetMonthRange(periodMonth: string): { start: string; end: string } {
  const year = Number(periodMonth.slice(0, 4));
  const month = Number(periodMonth.slice(5, 7));
  const lastDay = new Date(year, month, 0).getDate();
  const mm = String(month).padStart(2, "0");
  return { start: `${year}-${mm}-01`, end: `${year}-${mm}-${String(lastDay).padStart(2, "0")}` };
}

/**
 * Estado por porcentaje consumido (UC-23):
 * 0–69 NORMAL · 70–89 WARNING · 90–99 HIGH · ≥100 EXCEEDED.
 */
export function getBudgetStatus(percent: Decimal | number): BudgetStatus {
  const p = new Decimal(percent);
  if (p.gte(100)) return "EXCEEDED";
  if (p.gte(90)) return "HIGH";
  if (p.gte(70)) return "WARNING";
  return "NORMAL";
}

/**
 * Consumo de un presupuesto: Σ de gastos (EXPENSE) del mes en la categoría y
 * moneda del presupuesto. Las transferencias, los movimientos eliminados y los
 * de otras monedas/categorías no consumen. El consumo se deriva siempre; no se
 * persiste.
 */
export function calculateBudgetUsage(transactions: Transaction[], budget: BudgetLike): BudgetUsage {
  const { start, end } = getBudgetMonthRange(budget.period_month);
  const limit = new Decimal(budget.limit_amount);

  const spent = transactions.reduce((sum, t) => {
    if (t.deleted_at || t.type !== "EXPENSE") return sum;
    if (t.category_id !== budget.category_id) return sum;
    if (t.currency_code !== budget.currency_code) return sum;
    if (t.transaction_date < start || t.transaction_date > end) return sum;
    return sum.plus(new Decimal(t.amount));
  }, new Decimal(0));

  const percentDecimal = limit.isZero() ? new Decimal(0) : spent.div(limit).mul(100);

  return {
    spent,
    remaining: limit.minus(spent),
    percent: percentDecimal.toDecimalPlaces(1).toNumber(),
    // El estado usa el porcentaje exacto: 99,96 % sigue siendo HIGH aunque se muestre 100,0
    status: getBudgetStatus(percentDecimal),
  };
}
