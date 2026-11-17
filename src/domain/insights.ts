import { Decimal } from "decimal.js";
import type { BreakdownItem } from "./analytics";

export type InsightSeverity = "INFO" | "WARNING" | "SUCCESS";

export interface Insight {
  id: string;
  severity: InsightSeverity;
  title: string;
  message: string;
  /** Cómo se calculó, para que el usuario pueda verificarlo (nunca una caja negra). */
  explanation: string;
}

export interface InsightInput {
  income: Decimal;
  expense: Decimal;
  breakdown: BreakdownItem[];
  /** Gasto del mes anterior completo y proyección del mes en curso (moneda base). */
  previousMonthExpense: Decimal;
  projectedMonthExpense: Decimal;
  dayOfMonth: number;
  /** Costo mensual equivalente de suscripciones activas. */
  subscriptionsMonthly: Decimal;
  /** Intereses mensuales aproximados de deudas activas. */
  debtMonthlyInterest: Decimal;
}

const pct = (v: Decimal) => v.toDecimalPlaces(1).toString();

/** Reglas de insights deterministas con explicación; ver cada `explanation`. */
export function generateInsights(input: InsightInput): Insight[] {
  const insights: Insight[] = [];

  const top = input.breakdown[0];
  if (top && top.percent >= 40) {
    insights.push({
      id: "top-category",
      severity: "INFO",
      title: `${top.name} concentra tu gasto`,
      message: `El ${top.percent}% de tus gastos del período fue en ${top.name}.`,
      explanation: `Gasto en ${top.name} ÷ gasto total del período. Se muestra cuando supera el 40 %.`,
    });
  }

  if (input.income.gt(0)) {
    const rate = input.income.minus(input.expense).div(input.income).mul(100);
    if (rate.isNegative()) {
      insights.push({
        id: "overspending",
        severity: "WARNING",
        title: "Estás gastando más de lo que ingresas",
        message: `En este período tus gastos superan tus ingresos en un ${pct(rate.abs())}%.`,
        explanation: "(Ingresos − gastos) ÷ ingresos del período; negativo significa que gastaste más de lo que entró.",
      });
    } else if (rate.gte(20)) {
      insights.push({
        id: "saving-well",
        severity: "SUCCESS",
        title: "Buen ritmo de ahorro",
        message: `Estás ahorrando el ${pct(rate)}% de tus ingresos.`,
        explanation: "(Ingresos − gastos) ÷ ingresos del período. Se celebra desde el 20 %, una referencia común.",
      });
    }
  }

  if (
    input.dayOfMonth >= 10 &&
    input.previousMonthExpense.gt(0) &&
    input.projectedMonthExpense.gte(input.previousMonthExpense.mul("1.2"))
  ) {
    const increase = input.projectedMonthExpense.div(input.previousMonthExpense).minus(1).mul(100);
    insights.push({
      id: "spending-trend",
      severity: "WARNING",
      title: "Vas camino a gastar más que el mes pasado",
      message: `Tu gasto proyectado es ${pct(increase)}% mayor al del mes anterior.`,
      explanation:
        "Gasto proyectado del mes (promedio diario × días del mes) frente al gasto del mes anterior. Solo desde el día 10 y con un aumento de al menos 20 %. Es una estimación.",
    });
  }

  if (input.income.gt(0) && input.subscriptionsMonthly.gt(0)) {
    const share = input.subscriptionsMonthly.div(input.income).mul(100);
    if (share.gte(10)) {
      insights.push({
        id: "subscriptions-weight",
        severity: "INFO",
        title: "Tus suscripciones pesan en tu presupuesto",
        message: `Tus suscripciones equivalen al ${pct(share)}% de tus ingresos del período.`,
        explanation: "Costo mensual equivalente de suscripciones activas ÷ ingresos del período. Se muestra desde el 10 %.",
      });
    }
  }

  if (input.debtMonthlyInterest.gt(0)) {
    insights.push({
      id: "debt-interest",
      severity: "INFO",
      title: "Tus deudas generan intereses cada mes",
      message: "Pagar primero la deuda con mayor tasa (estrategia avalancha) suele reducir el total de intereses.",
      explanation: "Saldo × tasa anual ÷ 12 de cada deuda activa con tasa mayor a 0. Compara estrategias en Deudas → Estrategia.",
    });
  }

  return insights;
}
