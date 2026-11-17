export type RecurrenceFrequency = "WEEKLY" | "MONTHLY" | "QUARTERLY" | "YEARLY" | "CUSTOM";

export interface RecurrenceLike {
  frequency: RecurrenceFrequency;
  custom_interval_days?: number | null;
  /** Ancla del calendario (YYYY-MM-DD): las fechas se calculan siempre desde aquí. */
  start_date: string;
  /** Próxima ocurrencia aún no registrada (YYYY-MM-DD). */
  next_execution_date: string;
}

export const FREQUENCY_LABELS: Record<RecurrenceFrequency, string> = {
  WEEKLY: "Semanal",
  MONTHLY: "Mensual",
  QUARTERLY: "Trimestral",
  YEARLY: "Anual",
  CUSTOM: "Cada N días",
};

/** Máximo de ocurrencias que se registran de una sola vez (protege ante fechas lejanas). */
export const MAX_OCCURRENCES_PER_RUN = 366;

function parse(date: string): { y: number; m: number; d: number } {
  return { y: Number(date.slice(0, 4)), m: Number(date.slice(5, 7)), d: Number(date.slice(8, 10)) };
}

function format(y: number, m: number, d: number): string {
  return `${String(y).padStart(4, "0")}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function daysInMonth(y: number, m: number): number {
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

function addMonths(start: string, months: number): string {
  const { y, m, d } = parse(start);
  const total = y * 12 + (m - 1) + months;
  const ny = Math.floor(total / 12);
  const nm = (total % 12) + 1;
  // Se recorta al último día del mes: 31-ene + 1 mes = 28/29-feb
  return format(ny, nm, Math.min(d, daysInMonth(ny, nm)));
}

function addDays(start: string, days: number): string {
  const { y, m, d } = parse(start);
  const date = new Date(Date.UTC(y, m - 1, d + days));
  return format(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
}

/**
 * Fecha de la ocurrencia número `index` (0 = la de `start_date`), calculada
 * desde el ancla y nunca encadenando la anterior, para que el día de mes no
 * derive (31-ene → 28-feb → 31-mar, no 28-mar).
 */
export function getOccurrenceDate(rec: Pick<RecurrenceLike, "frequency" | "custom_interval_days" | "start_date">, index: number): string {
  switch (rec.frequency) {
    case "WEEKLY":
      return addDays(rec.start_date, 7 * index);
    case "MONTHLY":
      return addMonths(rec.start_date, index);
    case "QUARTERLY":
      return addMonths(rec.start_date, 3 * index);
    case "YEARLY":
      return addMonths(rec.start_date, 12 * index);
    case "CUSTOM": {
      if (!rec.custom_interval_days || rec.custom_interval_days <= 0) {
        throw new Error("custom_interval_days debe ser mayor a 0 para frecuencia CUSTOM");
      }
      return addDays(rec.start_date, rec.custom_interval_days * index);
    }
  }
}

export interface DueOccurrences {
  /** Fechas vencidas (≤ hoy) por registrar, en orden. */
  dates: string[];
  /** Próxima ocurrencia posterior a hoy (o a la última registrada). */
  nextExecutionDate: string;
  /** true si se alcanzó MAX_OCCURRENCES_PER_RUN y quedan vencidas por registrar. */
  truncated: boolean;
}

/**
 * Ocurrencias vencidas de una recurrencia hasta `today` (inclusive), a partir
 * de `next_execution_date`. Es determinista: ejecutarla dos veces con el mismo
 * estado produce lo mismo, y el índice único de la base de datos impide
 * duplicados si se reintenta tras un fallo parcial.
 */
export function getDueOccurrences(rec: RecurrenceLike, today: string): DueOccurrences {
  // Localizar el índice de la ocurrencia que corresponde a next_execution_date
  let index = 0;
  let guard = 0;
  while (getOccurrenceDate(rec, index) < rec.next_execution_date) {
    index++;
    if (++guard > 100000) throw new Error("next_execution_date inalcanzable desde start_date");
  }

  const dates: string[] = [];
  let date = getOccurrenceDate(rec, index);
  while (date <= today && dates.length < MAX_OCCURRENCES_PER_RUN) {
    dates.push(date);
    index++;
    date = getOccurrenceDate(rec, index);
  }

  return { dates, nextExecutionDate: date, truncated: date <= today };
}

/**
 * Primera ocurrencia en o después de `date`. Se usa al reanudar una recurrencia
 * pausada: las fechas perdidas durante la pausa no se registran de golpe.
 */
export function getFirstOccurrenceOnOrAfter(
  rec: Pick<RecurrenceLike, "frequency" | "custom_interval_days" | "start_date">,
  date: string
): string {
  let index = 0;
  let current = getOccurrenceDate(rec, index);
  while (current < date) {
    index++;
    current = getOccurrenceDate(rec, index);
    if (index > 100000) throw new Error("No se encontró una ocurrencia futura");
  }
  return current;
}
