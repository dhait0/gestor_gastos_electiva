import { Decimal } from "decimal.js";

type Money = string | number | Decimal;

export interface GoalLike {
  target_amount: Money;
  initial_amount?: Money | null;
  /** Fecha objetivo (YYYY-MM-DD), opcional. */
  target_date?: string | null;
}

export interface ContributionLike {
  amount: Money;
  deleted_at?: string | null;
}

export interface GoalProgress {
  /** initial_amount + Σ aportes activos. */
  current: Decimal;
  /** Lo que falta para la meta (nunca negativo). */
  remaining: Decimal;
  /** Porcentaje alcanzado con un decimal, tope 100. */
  percent: number;
  isCompleted: boolean;
  /** Meses que quedan hasta la fecha objetivo (mínimo 1); null sin fecha o ya vencida. */
  monthsRemaining: number | null;
  isOverdue: boolean;
  /** Aporte mensual sugerido: remaining / monthsRemaining; null si no hay fecha futura. */
  recommendedMonthly: Decimal | null;
}

/** "YYYY-MM-DD" de hoy en la zona horaria indicada. */
function todayInTimezone(timezone: string, now: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/**
 * Progreso de una meta. El monto actual se deriva siempre (no se persiste) y
 * los aportes eliminados lógicamente no cuentan. Un aporte no es un
 * movimiento bancario: no afecta al saldo de ninguna cuenta.
 */
export function calculateGoalProgress(
  goal: GoalLike,
  contributions: ContributionLike[],
  timezone = "America/Bogota",
  now: Date = new Date()
): GoalProgress {
  const target = new Decimal(goal.target_amount);
  const contributed = contributions.reduce(
    (sum, c) => (c.deleted_at ? sum : sum.plus(new Decimal(c.amount))),
    new Decimal(0)
  );
  const current = new Decimal(goal.initial_amount ?? 0).plus(contributed);
  const remaining = Decimal.max(target.minus(current), 0);
  const percent = Decimal.min(current.div(target).mul(100), 100).toDecimalPlaces(1).toNumber();
  const isCompleted = current.gte(target);

  let monthsRemaining: number | null = null;
  let isOverdue = false;
  let recommendedMonthly: Decimal | null = null;

  if (goal.target_date && !isCompleted) {
    const today = todayInTimezone(timezone, now);
    if (goal.target_date < today) {
      isOverdue = true;
    } else {
      const months =
        (Number(goal.target_date.slice(0, 4)) - Number(today.slice(0, 4))) * 12 +
        (Number(goal.target_date.slice(5, 7)) - Number(today.slice(5, 7)));
      monthsRemaining = Math.max(1, months);
      recommendedMonthly = remaining.div(monthsRemaining).toDecimalPlaces(2, Decimal.ROUND_UP);
    }
  }

  return { current, remaining, percent, isCompleted, monthsRemaining, isOverdue, recommendedMonthly };
}
