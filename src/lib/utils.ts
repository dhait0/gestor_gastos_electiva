import { type ClassValue } from "clsx";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currencyCode: string = "COP"): string {
  // Un -0 (p. ej. el negativo de una reserva en 0) o un valor que se redondea a 0 no debe verse como «-$ 0».
  if (Math.round(amount) === 0) amount = 0;
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formatea una fecha "solo día" (YYYY-MM-DD, como `transaction_date` o `due_date`).
 *
 * `new Date("2026-11-30")` se interpreta como medianoche UTC y, en una zona con
 * desfase negativo (Colombia, UTC-5), se mostraba como el 29. Aquí el día se
 * construye en hora local, así que la fecha mostrada es siempre la guardada.
 */
export function formatDateOnly(
  date: string,
  options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" }
): string {
  const [y, m, d] = date.slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es-CO", options);
}
