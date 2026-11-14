import { Decimal } from "decimal.js";
import { getFirstOccurrenceOnOrAfter, type RecurrenceFrequency } from "./recurrence";

type Money = string | number | Decimal;

export interface SubscriptionLike {
  amount: Money;
  currency_code: string;
  frequency: RecurrenceFrequency;
  custom_interval_days?: number | null;
  next_payment_date: string;
  status: "ACTIVE" | "PAUSED" | "CANCELLED";
}

/** Cuántos cobros hay en un año para la frecuencia dada. */
export function paymentsPerYear(frequency: RecurrenceFrequency, customIntervalDays?: number | null): Decimal {
  switch (frequency) {
    case "WEEKLY":
      return new Decimal(52);
    case "MONTHLY":
      return new Decimal(12);
    case "QUARTERLY":
      return new Decimal(4);
    case "YEARLY":
      return new Decimal(1);
    case "CUSTOM":
      if (!customIntervalDays || customIntervalDays <= 0) {
        throw new Error("custom_interval_days debe ser mayor a 0 para frecuencia CUSTOM");
      }
      return new Decimal(365).div(customIntervalDays);
  }
}

/** Costo anual estimado: monto × cobros por año. */
export function annualCost(sub: Pick<SubscriptionLike, "amount" | "frequency" | "custom_interval_days">): Decimal {
  return new Decimal(sub.amount).mul(paymentsPerYear(sub.frequency, sub.custom_interval_days));
}

/** Costo mensual equivalente: costo anual / 12. */
export function monthlyEquivalent(sub: Pick<SubscriptionLike, "amount" | "frequency" | "custom_interval_days">): Decimal {
  return annualCost(sub).div(12);
}

/** Fecha del próximo cobro en o después de hoy, avanzando desde `next_payment_date`. */
export function getNextRenewal(
  sub: Pick<SubscriptionLike, "frequency" | "custom_interval_days" | "next_payment_date">,
  today: string
): string {
  return getFirstOccurrenceOnOrAfter(
    { frequency: sub.frequency, custom_interval_days: sub.custom_interval_days, start_date: sub.next_payment_date },
    today
  );
}

/** Días naturales entre dos fechas YYYY-MM-DD (negativo si `date` ya pasó). */
export function daysBetween(today: string, date: string): number {
  const a = Date.UTC(Number(today.slice(0, 4)), Number(today.slice(5, 7)) - 1, Number(today.slice(8, 10)));
  const b = Date.UTC(Number(date.slice(0, 4)), Number(date.slice(5, 7)) - 1, Number(date.slice(8, 10)));
  return Math.round((b - a) / 86400000);
}

export interface SubscriptionTotals {
  monthly: Decimal;
  annual: Decimal;
  count: number;
}

/** Totales de las suscripciones ACTIVAS en la moneda base (sin mezclar monedas). */
export function summarizeSubscriptions(subs: SubscriptionLike[], baseCurrency: string): SubscriptionTotals {
  const active = subs.filter((s) => s.status === "ACTIVE" && s.currency_code === baseCurrency);
  const annual = active.reduce((sum, s) => sum.plus(annualCost(s)), new Decimal(0));
  return { monthly: annual.div(12), annual, count: active.length };
}
