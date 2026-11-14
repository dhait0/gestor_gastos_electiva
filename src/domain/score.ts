import { Decimal } from "decimal.js";

export type ScoreBand = "ATTENTION" | "ON_TRACK" | "HEALTHY";

export interface ScoreComponent {
  key: "available" | "obligations" | "savings" | "budgets" | "debt";
  label: string;
  /** 0–100, o null si no aplica por falta de datos (no cuenta en el promedio). */
  score: number | null;
  /** Explicación en lenguaje claro de cómo se calculó. */
  explanation: string;
}

export interface ScoreInput {
  liquidBalance: Decimal;
  availableToSpend: Decimal;
  overdueObligations: number;
  /** Ingresos y gastos del mes en curso (moneda base). */
  monthlyIncome: Decimal;
  monthlyExpense: Decimal;
  /** Presupuestos del mes: cuántos hay y cuántos están superados. */
  budgetsTotal: number;
  budgetsExceeded: number;
  /** Pagos mínimos mensuales de deudas activas (moneda base). */
  debtMinimumPayments: Decimal;
}

export interface FinancialScore {
  /** Siempre true: indicador interno de Lukiva, no un score bancario ni crediticio oficial. */
  isInternalIndicator: true;
  total: number | null;
  band: ScoreBand | null;
  components: ScoreComponent[];
}

/** Mínimo de componentes con datos para calcular un total. */
export const MIN_COMPONENTS = 2;

function clamp(value: Decimal, min = 0, max = 100): Decimal {
  return Decimal.min(Decimal.max(value, min), max);
}

function linear(value: Decimal, zeroAt: Decimal, hundredAt: Decimal): number {
  const ratio = value.minus(zeroAt).div(hundredAt.minus(zeroAt)).mul(100);
  return clamp(ratio).toDecimalPlaces(0).toNumber();
}

export function getScoreBand(total: number): ScoreBand {
  if (total >= 70) return "HEALTHY";
  if (total >= 40) return "ON_TRACK";
  return "ATTENTION";
}

export const SCORE_BAND_LABELS: Record<ScoreBand, string> = {
  ATTENTION: "Necesita atención",
  ON_TRACK: "En camino",
  HEALTHY: "Saludable",
};

/**
 * Financial Score de Lukiva (UC-40): promedio simple de los componentes que
 * tienen datos, cada uno de 0 a 100. No es un score bancario ni crediticio y
 * explica cada componente. Los umbrales son una decisión de producto
 * documentada aquí y ajustable.
 *
 *  - Disponible: 0 con disponible ≤ 0; 100 con disponible ≥ 30 % del saldo líquido.
 *  - Obligaciones: 100 sin vencidas; −25 por cada vencida.
 *  - Ahorro: tasa = (ingresos − gastos) / ingresos; 0 con tasa ≤ 0; 100 con tasa ≥ 20 %.
 *  - Presupuestos: % de presupuestos del mes que no están superados.
 *  - Deuda: pagos mínimos / ingresos; 100 con ≤ 15 %; 0 con ≥ 40 %.
 */
export function calculateFinancialScore(input: ScoreInput): FinancialScore {
  const components: ScoreComponent[] = [];

  components.push(
    input.liquidBalance.gt(0)
      ? {
          key: "available",
          label: "Dinero disponible",
          score: linear(input.availableToSpend.div(input.liquidBalance), new Decimal(0), new Decimal("0.3")),
          explanation: "Qué parte de tu saldo líquido queda libre tras obligaciones y reserva. 100 puntos si es al menos el 30 %.",
        }
      : { key: "available", label: "Dinero disponible", score: null, explanation: "No aplica: aún no tienes saldo líquido." }
  );

  components.push({
    key: "obligations",
    label: "Obligaciones al día",
    score: Math.max(0, 100 - 25 * input.overdueObligations),
    explanation:
      input.overdueObligations === 0
        ? "No tienes obligaciones vencidas."
        : `Tienes ${input.overdueObligations} obligación(es) vencida(s); cada una resta 25 puntos.`,
  });

  if (input.monthlyIncome.gt(0)) {
    const rate = input.monthlyIncome.minus(input.monthlyExpense).div(input.monthlyIncome);
    components.push({
      key: "savings",
      label: "Ahorro del mes",
      score: linear(rate, new Decimal(0), new Decimal("0.2")),
      explanation: `Ahorras el ${rate.mul(100).toDecimalPlaces(1).toString()} % de tus ingresos del mes. 100 puntos si llegas al 20 %.`,
    });
  } else {
    components.push({ key: "savings", label: "Ahorro del mes", score: null, explanation: "No aplica: no hay ingresos registrados este mes." });
  }

  components.push(
    input.budgetsTotal > 0
      ? {
          key: "budgets",
          label: "Presupuestos",
          score: new Decimal(input.budgetsTotal - input.budgetsExceeded).div(input.budgetsTotal).mul(100).toDecimalPlaces(0).toNumber(),
          explanation: `${input.budgetsTotal - input.budgetsExceeded} de ${input.budgetsTotal} presupuestos del mes no están superados.`,
        }
      : { key: "budgets", label: "Presupuestos", score: null, explanation: "No aplica: no tienes presupuestos este mes." }
  );

  if (input.debtMinimumPayments.gt(0) && input.monthlyIncome.gt(0)) {
    const ratio = input.debtMinimumPayments.div(input.monthlyIncome);
    components.push({
      key: "debt",
      label: "Carga de deudas",
      score: 100 - linear(ratio, new Decimal("0.15"), new Decimal("0.4")),
      explanation: `Tus pagos mínimos de deuda son el ${ratio.mul(100).toDecimalPlaces(1).toString()} % de tus ingresos. 100 puntos hasta el 15 %; 0 desde el 40 %.`,
    });
  } else {
    components.push({
      key: "debt",
      label: "Carga de deudas",
      score: null,
      explanation: input.debtMinimumPayments.gt(0) ? "No aplica: sin ingresos del mes no se puede medir." : "No aplica: no tienes pagos mínimos de deuda.",
    });
  }

  const scored = components.filter((c) => c.score !== null) as (ScoreComponent & { score: number })[];
  if (scored.length < MIN_COMPONENTS) {
    return { isInternalIndicator: true, total: null, band: null, components };
  }

  const total = Math.round(scored.reduce((sum, c) => sum + c.score, 0) / scored.length);
  return { isInternalIndicator: true, total, band: getScoreBand(total), components };
}
