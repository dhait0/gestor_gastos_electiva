import { Decimal } from "decimal.js";
import { getCurrentMonthRange, type Transaction } from "./transactions";

/** Períodos que ofrece el dashboard. */
export type DashboardPeriod = "current" | "previous" | "last3" | "year";

export const DASHBOARD_PERIODS: { value: DashboardPeriod; label: string }[] = [
  { value: "current", label: "Este mes" },
  { value: "previous", label: "Mes anterior" },
  { value: "last3", label: "3 meses" },
  { value: "year", label: "Este año" },
];

export function parseDashboardPeriod(value: string | string[] | undefined): DashboardPeriod {
  const v = Array.isArray(value) ? value[0] : value;
  return DASHBOARD_PERIODS.some((p) => p.value === v) ? (v as DashboardPeriod) : "current";
}

export interface DateRange {
  start: string; // YYYY-MM-DD, inclusivo
  end: string; // YYYY-MM-DD, inclusivo
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function lastDayOfMonth(year: number, month: number): string {
  return `${year}-${pad(month)}-${pad(new Date(year, month, 0).getDate())}`;
}

/**
 * Rango de fechas de un período según la zona horaria del perfil.
 * Siempre termina en el último día del mes que cierra el período.
 */
export function getPeriodRange(
  period: DashboardPeriod,
  timezone: string,
  now: Date = new Date()
): DateRange {
  const current = getCurrentMonthRange(timezone, now);
  const year = Number(current.start.slice(0, 4));
  const month = Number(current.start.slice(5, 7));

  switch (period) {
    case "current":
      return current;
    case "previous": {
      const d = new Date(year, month - 2, 1);
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      return { start: `${y}-${pad(m)}-01`, end: lastDayOfMonth(y, m) };
    }
    case "last3": {
      const d = new Date(year, month - 3, 1);
      return { start: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-01`, end: current.end };
    }
    case "year":
      return { start: `${year}-01-01`, end: current.end };
  }
}

function inRange(t: Transaction, range: DateRange): boolean {
  return t.transaction_date >= range.start && t.transaction_date <= range.end;
}

/**
 * Ingresos y gastos reales dentro de un rango. Mismas reglas que
 * `calculateMonthlyIncomeExpense`: sin eliminados, sin transferencias, solo
 * moneda base y sin saldos iniciales.
 */
export function calculateIncomeExpenseInRange(
  transactions: Transaction[],
  baseCurrency: string,
  range: DateRange
): { income: Decimal; expense: Decimal } {
  let income = new Decimal(0);
  let expense = new Decimal(0);

  for (const t of transactions) {
    if (t.deleted_at || t.currency_code !== baseCurrency || t.type === "TRANSFER") continue;
    if (!inRange(t, range)) continue;
    const amount = new Decimal(t.amount);
    if (t.type === "INCOME") income = income.plus(amount);
    else if (t.type === "EXPENSE") expense = expense.plus(amount);
  }

  return { income, expense };
}

export interface CategoryRef {
  id: string;
  name: string;
  color?: string | null;
}

export interface BreakdownItem {
  categoryId: string | null;
  name: string;
  color: string | null;
  amount: Decimal;
  /** Porcentaje del gasto total del período, con un decimal. */
  percent: number;
}

/**
 * Desglose del gasto por categoría en un rango, de mayor a menor.
 * Los gastos sin categoría (o con una categoría desconocida) se agrupan en
 * "Sin categoría". Los porcentajes se calculan con Decimal sobre el total.
 */
export function calculateExpenseBreakdown(
  transactions: Transaction[],
  categories: CategoryRef[],
  baseCurrency: string,
  range: DateRange
): BreakdownItem[] {
  const byId = new Map(categories.map((c) => [c.id, c]));
  const totals = new Map<string | null, Decimal>();
  let total = new Decimal(0);

  for (const t of transactions) {
    if (t.deleted_at || t.currency_code !== baseCurrency || t.type !== "EXPENSE") continue;
    if (!inRange(t, range)) continue;
    const key = t.category_id && byId.has(t.category_id) ? t.category_id : null;
    const amount = new Decimal(t.amount);
    totals.set(key, (totals.get(key) ?? new Decimal(0)).plus(amount));
    total = total.plus(amount);
  }

  if (total.isZero()) return [];

  return [...totals.entries()]
    .map(([categoryId, amount]) => ({
      categoryId,
      name: categoryId ? byId.get(categoryId)!.name : "Sin categoría",
      color: categoryId ? byId.get(categoryId)!.color ?? null : null,
      amount,
      percent: amount.div(total).mul(100).toDecimalPlaces(1).toNumber(),
    }))
    .sort((a, b) => b.amount.comparedTo(a.amount));
}
