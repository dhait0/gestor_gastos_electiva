import type { Decimal } from "decimal.js";
import { daysBetween } from "./subscriptions";
import type { BudgetStatus } from "./budgets";

export type AlertSeverity = "INFO" | "WARNING" | "CRITICAL" | "SUCCESS";

export interface AlertDraft {
  type: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  /** Clave de deduplicación: la misma situación no vuelve a crear la alerta. */
  dedupKey: string;
  metadata: Record<string, string | number>;
}

export interface AlertInput {
  /** Hoy en la zona horaria del perfil (YYYY-MM-DD). */
  today: string;
  currencyCode: string;
  liquidBalance: Decimal;
  availableToSpend: Decimal;
  budgets: { id: string; categoryName: string; percent: number; status: BudgetStatus; period_month: string }[];
  obligations: { id: string; name: string; due_date: string; status: "PENDING" | "PAID" | "CANCELLED" }[];
  goals: {
    id: string;
    name: string;
    status: "ACTIVE" | "COMPLETED" | "PAUSED" | "CANCELLED";
    percent: number;
    isOverdue: boolean;
    monthsRemaining: number | null;
  }[];
}

/** Días de antelación con los que se avisa de una obligación próxima. */
export const OBLIGATION_WARNING_DAYS = 3;
/** Bajo este porcentaje del saldo líquido se considera "disponible bajo". */
export const LOW_AVAILABLE_RATIO = 0.1;

/**
 * Reglas de alertas (UC-37). Es una función pura: devuelve borradores y el
 * llamador los guarda con deduplicación; no envía nada fuera de la app.
 */
export function generateAlerts(input: AlertInput): AlertDraft[] {
  const alerts: AlertDraft[] = [];
  const month = input.today.slice(0, 7);

  for (const b of input.budgets) {
    if (b.status === "WARNING" || b.status === "HIGH") {
      alerts.push({
        type: "BUDGET_NEAR_LIMIT",
        title: `Presupuesto de ${b.categoryName} cerca del límite`,
        message: `Llevas el ${b.percent}% de tu presupuesto de ${b.categoryName}.`,
        severity: "WARNING",
        dedupKey: `budget:${b.id}:${b.status}`,
        metadata: { budgetId: b.id, percent: b.percent, month: b.period_month },
      });
    } else if (b.status === "EXCEEDED") {
      alerts.push({
        type: "BUDGET_EXCEEDED",
        title: `Superaste tu presupuesto de ${b.categoryName}`,
        message: `Ya vas en el ${b.percent}% del límite de ${b.categoryName}.`,
        severity: "CRITICAL",
        dedupKey: `budget:${b.id}:EXCEEDED`,
        metadata: { budgetId: b.id, percent: b.percent, month: b.period_month },
      });
    }
  }

  for (const o of input.obligations) {
    if (o.status !== "PENDING") continue;
    const days = daysBetween(input.today, o.due_date);
    if (days < 0) {
      alerts.push({
        type: "OBLIGATION_OVERDUE",
        title: `Obligación vencida: ${o.name}`,
        message: `«${o.name}» venció hace ${-days} ${-days === 1 ? "día" : "días"}.`,
        severity: "CRITICAL",
        dedupKey: `obligation:${o.id}:overdue`,
        metadata: { obligationId: o.id, dueDate: o.due_date },
      });
    } else if (days <= OBLIGATION_WARNING_DAYS) {
      alerts.push({
        type: "OBLIGATION_DUE_SOON",
        title: `Obligación próxima: ${o.name}`,
        message: days === 0 ? `«${o.name}» vence hoy.` : `«${o.name}» vence en ${days} ${days === 1 ? "día" : "días"}.`,
        severity: "WARNING",
        dedupKey: `obligation:${o.id}:due-soon`,
        metadata: { obligationId: o.id, dueDate: o.due_date },
      });
    }
  }

  if (input.availableToSpend.isNegative()) {
    alerts.push({
      type: "AVAILABLE_NEGATIVE",
      title: "Tus compromisos superan tu saldo",
      message: "Tu dinero disponible está en negativo: revisa obligaciones y reserva.",
      severity: "CRITICAL",
      dedupKey: `available:negative:${month}`,
      metadata: { month },
    });
  } else if (
    input.liquidBalance.gt(0) &&
    input.availableToSpend.lt(input.liquidBalance.mul(LOW_AVAILABLE_RATIO))
  ) {
    alerts.push({
      type: "AVAILABLE_LOW",
      title: "Te queda poco dinero disponible",
      message: "Tu disponible es menos del 10% de tu saldo líquido.",
      severity: "WARNING",
      dedupKey: `available:low:${month}`,
      metadata: { month },
    });
  }

  for (const g of input.goals) {
    if (g.status !== "ACTIVE") continue;
    if (g.isOverdue) {
      alerts.push({
        type: "GOAL_OVERDUE",
        title: `Meta vencida: ${g.name}`,
        message: `La fecha objetivo de «${g.name}» ya pasó y llevas el ${g.percent}%.`,
        severity: "WARNING",
        dedupKey: `goal:${g.id}:overdue`,
        metadata: { goalId: g.id, percent: g.percent },
      });
    } else if (g.monthsRemaining !== null && g.monthsRemaining <= 2 && g.percent < 50) {
      alerts.push({
        type: "GOAL_AT_RISK",
        title: `Tu meta ${g.name} está en riesgo`,
        message: `Quedan ${g.monthsRemaining} ${g.monthsRemaining === 1 ? "mes" : "meses"} y vas en el ${g.percent}%.`,
        severity: "WARNING",
        dedupKey: `goal:${g.id}:at-risk`,
        metadata: { goalId: g.id, percent: g.percent },
      });
    }
  }

  return alerts;
}
