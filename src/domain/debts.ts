import { Decimal } from "decimal.js";

type Money = string | number | Decimal;

export interface DebtLike {
  original_amount: Money;
  current_balance: Money;
  currency_code: string;
  minimum_payment?: Money | null;
  status: "ACTIVE" | "PAID" | "PAUSED" | "CANCELLED";
}

/** Porcentaje ya pagado de la deuda (capital), con un decimal. */
export function paidPercent(debt: Pick<DebtLike, "original_amount" | "current_balance">): number {
  const original = new Decimal(debt.original_amount);
  if (original.isZero()) return 0;
  const paid = original.minus(debt.current_balance);
  return Decimal.max(Decimal.min(paid.div(original).mul(100), 100), 0).toDecimalPlaces(1).toNumber();
}

/** Interés mensual aproximado: saldo × tasa anual % / 12. */
export function monthlyInterest(balance: Money, annualRatePercent: Money): Decimal {
  return new Decimal(balance).mul(annualRatePercent).div(100).div(12);
}

/**
 * Valida un abono con las mismas reglas que la base de datos
 * (`record_debt_payment`) para dar un error claro antes de llamarla.
 * Devuelve el capital que se descontará del saldo, o un mensaje de error.
 */
export function validateDebtPayment(
  debt: Pick<DebtLike, "current_balance" | "status">,
  amount: Money,
  interest: Money = 0
): { principal: Decimal } | { error: string } {
  const a = new Decimal(amount);
  const i = new Decimal(interest);
  if (a.lte(0)) return { error: "El abono debe ser mayor a 0" };
  if (i.lt(0) || i.gt(a)) return { error: "El interés debe estar entre 0 y el monto del abono" };
  if (debt.status === "PAID" || debt.status === "CANCELLED") return { error: "La deuda no admite abonos" };
  const principal = a.minus(i);
  if (principal.gt(debt.current_balance)) return { error: "El abono a capital supera el saldo pendiente" };
  return { principal };
}

export interface PayoffSimulation {
  months: number;
  totalInterest: Decimal;
  totalPaid: Decimal;
}

/**
 * Cuántos meses toma liquidar una deuda con un pago mensual fijo, aplicando
 * interés mensual sobre el saldo. Devuelve null si el pago no cubre el interés
 * (la deuda nunca baja) o si supera `maxMonths`.
 */
export function simulatePayoff(
  balance: Money,
  annualRatePercent: Money,
  monthlyPayment: Money,
  maxMonths = 600
): PayoffSimulation | null {
  let remaining = new Decimal(balance);
  const payment = new Decimal(monthlyPayment);
  if (remaining.lte(0)) return { months: 0, totalInterest: new Decimal(0), totalPaid: new Decimal(0) };
  if (payment.lte(monthlyInterest(remaining, annualRatePercent))) return null;

  let months = 0;
  let totalInterest = new Decimal(0);
  let totalPaid = new Decimal(0);

  while (remaining.gt(0)) {
    if (++months > maxMonths) return null;
    const interest = monthlyInterest(remaining, annualRatePercent);
    const due = remaining.plus(interest);
    const paid = Decimal.min(payment, due);
    totalInterest = totalInterest.plus(interest);
    totalPaid = totalPaid.plus(paid);
    remaining = due.minus(paid);
    // Evita residuos de redondeo infinitesimales
    if (remaining.lt("0.005")) remaining = new Decimal(0);
  }

  return { months, totalInterest, totalPaid };
}

export interface DebtTotals {
  balance: Decimal;
  minimumPayments: Decimal;
  count: number;
}

/** Totales de deudas ACTIVAS en la moneda base (sin mezclar monedas). */
export function summarizeDebts(debts: DebtLike[], baseCurrency: string): DebtTotals {
  const active = debts.filter((d) => d.status === "ACTIVE" && d.currency_code === baseCurrency);
  return {
    balance: active.reduce((s, d) => s.plus(d.current_balance), new Decimal(0)),
    minimumPayments: active.reduce((s, d) => s.plus(d.minimum_payment ?? 0), new Decimal(0)),
    count: active.length,
  };
}
