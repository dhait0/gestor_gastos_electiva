import { Decimal } from "decimal.js";

export interface MonthProgress {
  day: number;
  daysInMonth: number;
}

/** Día del mes y total de días del mes de una fecha YYYY-MM-DD. */
export function getMonthProgress(today: string): MonthProgress {
  const year = Number(today.slice(0, 4));
  const month = Number(today.slice(5, 7));
  return { day: Number(today.slice(8, 10)), daysInMonth: new Date(Date.UTC(year, month, 0)).getUTCDate() };
}

export interface ForecastInput {
  /** Gastos reales del mes en curso hasta hoy (moneda base). */
  spentToDate: Decimal;
  day: number;
  daysInMonth: number;
  liquidBalance: Decimal;
  /** Obligaciones PENDING con vencimiento entre hoy y fin de mes (moneda base). */
  pendingObligationsDueThisMonth: Decimal;
}

export interface Forecast {
  /** Siempre true: el forecast es una estimación, nunca una certeza (UC-29). */
  isEstimate: true;
  dailyAverage: Decimal;
  projectedMonthExpense: Decimal;
  projectedRemainingExpense: Decimal;
  pendingObligations: Decimal;
  projectedEndLiquid: Decimal;
  isNegative: boolean;
  /** Con pocos días transcurridos el promedio diario es poco fiable. */
  lowConfidence: boolean;
}

/** Días mínimos transcurridos para considerar fiable el promedio diario. */
export const MIN_DAYS_FOR_CONFIDENCE = 5;

/**
 * Forecast de fin de mes (UC-29):
 *   gastoDiarioPromedio = gastosMes / díasTranscurridos
 *   gastoProyectado     = gastoDiarioPromedio × díasTotalesMes
 *   saldoLíquidoFinal   = líquido − gastoRestanteProyectado − obligacionesPendientes
 *
 * Supuesto declarado: el gasto habitual puede ya incluir pagos parecidos a las
 * obligaciones, por lo que el resultado puede ser conservador (doble conteo
 * parcial posible). Por eso se presenta siempre como estimación.
 */
export function calculateForecast(input: ForecastInput): Forecast {
  const day = Math.min(Math.max(input.day, 1), input.daysInMonth);
  const dailyAverage = input.spentToDate.div(day);
  const projectedMonthExpense = dailyAverage.mul(input.daysInMonth);
  const projectedRemainingExpense = Decimal.max(projectedMonthExpense.minus(input.spentToDate), 0);
  const projectedEndLiquid = input.liquidBalance
    .minus(projectedRemainingExpense)
    .minus(input.pendingObligationsDueThisMonth);

  return {
    isEstimate: true,
    dailyAverage,
    projectedMonthExpense,
    projectedRemainingExpense,
    pendingObligations: input.pendingObligationsDueThisMonth,
    projectedEndLiquid,
    isNegative: projectedEndLiquid.isNegative(),
    lowConfidence: day < MIN_DAYS_FOR_CONFIDENCE,
  };
}
