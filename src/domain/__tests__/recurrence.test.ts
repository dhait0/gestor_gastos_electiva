import { describe, it, expect } from "vitest";
import { MAX_OCCURRENCES_PER_RUN, getDueOccurrences, getOccurrenceDate } from "../recurrence";

describe("getOccurrenceDate", () => {
  it("semanal suma 7 días por índice", () => {
    expect(getOccurrenceDate({ frequency: "WEEKLY", start_date: "2026-11-02" }, 3)).toBe("2026-11-23");
  });

  it("mensual desde el día 31 recorta al fin de mes sin derivar", () => {
    const rec = { frequency: "MONTHLY" as const, start_date: "2026-01-31" };
    expect(getOccurrenceDate(rec, 0)).toBe("2026-01-31");
    expect(getOccurrenceDate(rec, 1)).toBe("2026-02-28");
    expect(getOccurrenceDate(rec, 2)).toBe("2026-03-31"); // no 28
    expect(getOccurrenceDate(rec, 3)).toBe("2026-04-30");
  });

  it("año bisiesto: 29-feb anual cae el 28 en años comunes y 29 en bisiestos", () => {
    const rec = { frequency: "YEARLY" as const, start_date: "2028-02-29" };
    expect(getOccurrenceDate(rec, 1)).toBe("2029-02-28");
    expect(getOccurrenceDate(rec, 4)).toBe("2032-02-29");
  });

  it("trimestral suma 3 meses y cruza el año", () => {
    expect(getOccurrenceDate({ frequency: "QUARTERLY", start_date: "2026-11-15" }, 1)).toBe("2027-02-15");
  });

  it("cada N días", () => {
    expect(getOccurrenceDate({ frequency: "CUSTOM", custom_interval_days: 10, start_date: "2026-12-25" }, 2)).toBe("2027-01-14");
  });

  it("CUSTOM sin intervalo válido lanza error", () => {
    expect(() => getOccurrenceDate({ frequency: "CUSTOM", custom_interval_days: 0, start_date: "2026-01-01" }, 1)).toThrow();
  });
});

describe("getDueOccurrences", () => {
  const monthly = { frequency: "MONTHLY" as const, start_date: "2026-08-15", next_execution_date: "2026-08-15" };

  it("nada vencido si la próxima es futura", () => {
    const r = getDueOccurrences({ ...monthly, next_execution_date: "2026-12-15" }, "2026-11-14");
    expect(r.dates).toEqual([]);
    expect(r.nextExecutionDate).toBe("2026-12-15");
    expect(r.truncated).toBe(false);
  });

  it("incluye la fecha de hoy y avanza la próxima", () => {
    const r = getDueOccurrences({ ...monthly, next_execution_date: "2026-11-14", start_date: "2026-11-14" }, "2026-11-14");
    expect(r.dates).toEqual(["2026-11-14"]);
    expect(r.nextExecutionDate).toBe("2026-12-14");
  });

  it("pone al día varias ocurrencias atrasadas, en orden", () => {
    const r = getDueOccurrences(monthly, "2026-11-14");
    expect(r.dates).toEqual(["2026-08-15", "2026-09-15", "2026-10-15"]);
    expect(r.nextExecutionDate).toBe("2026-11-15");
  });

  it("es idempotente: reaplicar el resultado no genera nuevas ocurrencias", () => {
    const first = getDueOccurrences(monthly, "2026-11-14");
    const second = getDueOccurrences({ ...monthly, next_execution_date: first.nextExecutionDate }, "2026-11-14");
    expect(second.dates).toEqual([]);
    expect(second.nextExecutionDate).toBe(first.nextExecutionDate);
  });

  it("parte de next_execution_date aunque sea posterior al inicio (no repite las ya registradas)", () => {
    const r = getDueOccurrences({ ...monthly, next_execution_date: "2026-10-15" }, "2026-11-14");
    expect(r.dates).toEqual(["2026-10-15"]);
  });

  it("el día 31 mantiene el ancla al ponerse al día", () => {
    const r = getDueOccurrences(
      { frequency: "MONTHLY", start_date: "2026-01-31", next_execution_date: "2026-01-31" },
      "2026-04-30"
    );
    expect(r.dates).toEqual(["2026-01-31", "2026-02-28", "2026-03-31", "2026-04-30"]);
    expect(r.nextExecutionDate).toBe("2026-05-31");
  });

  it("limita las ocurrencias por ejecución y avisa que quedan más", () => {
    const r = getDueOccurrences(
      { frequency: "CUSTOM", custom_interval_days: 1, start_date: "2020-01-01", next_execution_date: "2020-01-01" },
      "2026-11-14"
    );
    expect(r.dates).toHaveLength(MAX_OCCURRENCES_PER_RUN);
    expect(r.truncated).toBe(true);
    expect(r.nextExecutionDate > r.dates[r.dates.length - 1]).toBe(true);
  });

  it("next_execution_date que no cae en el calendario se alinea a la siguiente ocurrencia", () => {
    const r = getDueOccurrences({ ...monthly, next_execution_date: "2026-10-20" }, "2026-11-30");
    expect(r.dates).toEqual(["2026-11-15"]);
  });
});

import { getFirstOccurrenceOnOrAfter } from "../recurrence";

describe("getFirstOccurrenceOnOrAfter", () => {
  const rec = { frequency: "MONTHLY" as const, start_date: "2026-01-31" };
  it("devuelve la misma fecha si coincide con una ocurrencia", () => {
    expect(getFirstOccurrenceOnOrAfter(rec, "2026-03-31")).toBe("2026-03-31");
  });
  it("salta las ocurrencias perdidas y devuelve la siguiente", () => {
    expect(getFirstOccurrenceOnOrAfter(rec, "2026-11-14")).toBe("2026-11-30");
  });
});
