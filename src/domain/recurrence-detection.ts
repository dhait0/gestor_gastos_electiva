import { Decimal } from "decimal.js";
import { getFirstOccurrenceOnOrAfter, getOccurrenceDate, type RecurrenceFrequency } from "./recurrence";
import { daysBetween } from "./subscriptions";

export interface DetectableTransaction {
  id: string;
  type: "INCOME" | "EXPENSE" | "TRANSFER";
  description: string;
  amount: string | number | Decimal;
  currency_code: string;
  category_id?: string | null;
  account_id: string;
  transaction_date: string;
  deleted_at?: string | null;
  /** Si ya fue generado por una recurrencia no se vuelve a proponer. */
  recurring_transaction_id?: string | null;
}

export interface RecurrenceSuggestion {
  /** Clave estable para identificar la sugerencia. */
  key: string;
  type: "INCOME" | "EXPENSE";
  description: string;
  amount: Decimal;
  currency_code: string;
  category_id: string;
  account_id: string;
  frequency: Exclude<RecurrenceFrequency, "CUSTOM">;
  occurrences: number;
  lastDate: string;
  /** Primera fecha a partir de hoy según el patrón: así activarla no registra movimientos atrasados. */
  nextDate: string;
  /** MEDIUM con 3 repeticiones, HIGH desde 4. */
  confidence: "MEDIUM" | "HIGH";
}

export const MIN_OCCURRENCES = 3;
/** Variación máxima del importe respecto a la mediana (10 %). */
export const AMOUNT_TOLERANCE = 0.1;

type Frequency = RecurrenceSuggestion["frequency"];

/** Intervalo esperado en días y holgura permitida por frecuencia. */
const PATTERNS: { frequency: Frequency; min: number; max: number }[] = [
  { frequency: "WEEKLY", min: 6, max: 8 },
  { frequency: "MONTHLY", min: 27, max: 33 },
  { frequency: "QUARTERLY", min: 85, max: 96 },
  { frequency: "YEARLY", min: 360, max: 371 },
];

/** Minúsculas, sin tildes, sin números ni puntuación: "Netflix 11/2026" → "netflix". */
export function normalizeDescription(description: string): string {
  return description
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function median(values: Decimal[]): Decimal {
  const sorted = [...values].sort((a, b) => a.comparedTo(b));
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : sorted[mid - 1].plus(sorted[mid]).div(2);
}

function mostCommon<T extends string>(values: T[]): T {
  const counts = new Map<T, number>();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0])))[0][0];
}

function detectFrequency(sortedDates: string[]): Frequency | null {
  const gaps = sortedDates.slice(1).map((d, i) => daysBetween(sortedDates[i], d));
  return (
    PATTERNS.find((p) => gaps.every((g) => g >= p.min && g <= p.max))?.frequency ?? null
  );
}

/**
 * Detecta posibles movimientos recurrentes (UC-30) a partir del historial.
 * Criterios: misma descripción normalizada, misma categoría y moneda, importe
 * dentro del 10 % de la mediana, intervalo regular (semanal, mensual, trimestral
 * o anual) y al menos tres repeticiones. Solo propone patrones todavía activos
 * (la última ocurrencia está dentro de dos intervalos de hoy). Nunca crea nada:
 * el usuario debe confirmar (UC-31).
 *
 * @param existingKeys descripciones normalizadas + tipo de recurrencias ya
 *   existentes ("expense|netflix"), para no volver a sugerirlas.
 */
export function detectRecurrences(
  transactions: DetectableTransaction[],
  today: string,
  existingKeys: Iterable<string> = []
): RecurrenceSuggestion[] {
  const existing = new Set(existingKeys);
  const groups = new Map<string, DetectableTransaction[]>();

  for (const t of transactions) {
    if (t.deleted_at || t.recurring_transaction_id) continue;
    if (t.type === "TRANSFER" || !t.category_id) continue;
    const normalized = normalizeDescription(t.description);
    if (!normalized) continue;
    const key = `${t.type.toLowerCase()}|${normalized}|${t.category_id}|${t.currency_code}`;
    (groups.get(key) ?? groups.set(key, []).get(key)!).push(t);
  }

  const suggestions: RecurrenceSuggestion[] = [];

  for (const [key, group] of groups) {
    if (group.length < MIN_OCCURRENCES) continue;

    const sorted = [...group].sort((a, b) => a.transaction_date.localeCompare(b.transaction_date) || a.id.localeCompare(b.id));
    const dates = sorted.map((t) => t.transaction_date);
    // Dos movimientos el mismo día no forman un intervalo
    if (new Set(dates).size !== dates.length) continue;

    const amounts = sorted.map((t) => new Decimal(t.amount));
    const mid = median(amounts);
    if (mid.lte(0)) continue;
    if (amounts.some((a) => a.minus(mid).abs().div(mid).gt(AMOUNT_TOLERANCE))) continue;

    const frequency = detectFrequency(dates);
    if (!frequency) continue;

    const lastDate = dates[dates.length - 1];
    const pattern = PATTERNS.find((p) => p.frequency === frequency)!;
    // Patrón inactivo: la última ocurrencia quedó atrás por más de dos intervalos
    if (daysBetween(lastDate, today) > pattern.max * 2) continue;

    const [type, normalized] = key.split("|");
    if (existing.has(`${type}|${normalized}`)) continue;

    const latest = sorted[sorted.length - 1];
    const anchored = { frequency, start_date: lastDate } as const;
    const nextDate = getFirstOccurrenceOnOrAfter(anchored, today);
    // Si la próxima coincide con la última (hoy mismo), se pasa a la siguiente
    const safeNext = nextDate === lastDate ? getOccurrenceDate(anchored, 1) : nextDate;

    suggestions.push({
      key,
      type: latest.type as "INCOME" | "EXPENSE",
      description: latest.description.trim(),
      amount: mid.toDecimalPlaces(4),
      currency_code: latest.currency_code,
      category_id: latest.category_id!,
      account_id: mostCommon(sorted.map((t) => t.account_id)),
      frequency,
      occurrences: sorted.length,
      lastDate,
      nextDate: safeNext,
      confidence: sorted.length >= 4 ? "HIGH" : "MEDIUM",
    });
  }

  return suggestions.sort((a, b) => b.occurrences - a.occurrences || a.description.localeCompare(b.description));
}
