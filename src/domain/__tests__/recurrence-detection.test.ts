import { describe, it, expect } from "vitest";
import { detectRecurrences, normalizeDescription, type DetectableTransaction } from "../recurrence-detection";

const TODAY = "2026-11-14";
let n = 0;
function tx(description: string, date: string, amount: string | number = 30000, extra: Partial<DetectableTransaction> = {}): DetectableTransaction {
  return { id: `t${++n}`, type: "EXPENSE", description, amount, currency_code: "COP", category_id: "c1", account_id: "a1", transaction_date: date, ...extra };
}
const monthly = (desc: string, amount: string | number = 30000, extra: Partial<DetectableTransaction> = {}) => [
  tx(desc, "2026-08-05", amount, extra),
  tx(desc, "2026-09-05", amount, extra),
  tx(desc, "2026-10-05", amount, extra),
];

describe("normalizeDescription", () => {
  it("ignora mayúsculas, tildes, números y puntuación", () => {
    expect(normalizeDescription("  Suscripción NETFLIX 11/2026 ")).toBe("suscripcion netflix");
    expect(normalizeDescription("Arriendo #3")).toBe("arriendo");
    expect(normalizeDescription("123 ---")).toBe("");
  });
});

describe("detectRecurrences (UC-30)", () => {
  it("detecta un gasto mensual con tres repeticiones y propone la próxima fecha futura", () => {
    const [s] = detectRecurrences(monthly("Netflix"), TODAY);
    expect(s.frequency).toBe("MONTHLY");
    expect(s.occurrences).toBe(3);
    expect(s.confidence).toBe("MEDIUM");
    expect(s.amount.toString()).toBe("30000");
    expect(s.lastDate).toBe("2026-10-05");
    expect(s.nextDate).toBe("2026-12-05");
  });

  it("no sugiere con menos de tres repeticiones", () => {
    expect(detectRecurrences(monthly("Netflix").slice(0, 2), TODAY)).toEqual([]);
  });

  it("con cuatro o más repeticiones la confianza es alta", () => {
    const four = [tx("Gym", "2026-07-01", 80000), ...monthly("Gym", 80000).map((t) => ({ ...t, transaction_date: t.transaction_date.replace("-05", "-01") }))];
    expect(detectRecurrences(four, TODAY)[0].confidence).toBe("HIGH");
  });

  it("tolera descripciones con distinto número, tilde o mayúsculas", () => {
    const txs = [tx("Spotify 08", "2026-08-10"), tx("SPOTIFY 09", "2026-09-10"), tx("spotifý 10", "2026-10-10")];
    expect(detectRecurrences(txs, TODAY)).toHaveLength(1);
  });

  it("detecta semanal, trimestral y anual", () => {
    const weekly = ["2026-10-20", "2026-10-27", "2026-11-03", "2026-11-10"].map((d) => tx("Mercado", d));
    expect(detectRecurrences(weekly, TODAY)[0].frequency).toBe("WEEKLY");
    const quarterly = ["2026-01-15", "2026-04-15", "2026-07-15"].map((d) => tx("Seguro", d, 200000));
    const q = detectRecurrences(quarterly, TODAY)[0];
    expect(q.frequency).toBe("QUARTERLY");
    expect(q.nextDate).toBe("2027-01-15"); // 15-oct ya pasó: se propone la siguiente futura
    const yearly = ["2024-11-20", "2025-11-20", "2026-11-20"].map((d) => tx("Dominio web", d, 90000));
    expect(detectRecurrences(yearly, TODAY)[0].frequency).toBe("YEARLY");
  });

  it("descarta si el importe varía más del 10 %", () => {
    expect(detectRecurrences([tx("Luz", "2026-08-05", 100000), tx("Luz", "2026-09-05", 100000), tx("Luz", "2026-10-05", 125000)], TODAY)).toEqual([]);
  });

  it("acepta una variación pequeña y propone la mediana", () => {
    const [s] = detectRecurrences([tx("Agua", "2026-08-05", 100000), tx("Agua", "2026-09-05", 105000), tx("Agua", "2026-10-05", 98000)], TODAY);
    expect(s.amount.toString()).toBe("100000");
  });

  it("descarta intervalos irregulares", () => {
    expect(detectRecurrences([tx("Taxi", "2026-08-05"), tx("Taxi", "2026-08-20"), tx("Taxi", "2026-10-05")], TODAY)).toEqual([]);
  });

  it("no mezcla categorías, tipos ni monedas distintas", () => {
    const mixed = [tx("Netflix", "2026-08-05"), tx("Netflix", "2026-09-05", 30000, { category_id: "c2" }), tx("Netflix", "2026-10-05", 30000, { currency_code: "USD" })];
    expect(detectRecurrences(mixed, TODAY)).toEqual([]);
  });

  it("ignora eliminados, transferencias, sin categoría y los ya generados por una recurrencia", () => {
    expect(detectRecurrences(monthly("Netflix", 30000, { deleted_at: "x" }), TODAY)).toEqual([]);
    expect(detectRecurrences(monthly("Netflix", 30000, { type: "TRANSFER" }), TODAY)).toEqual([]);
    expect(detectRecurrences(monthly("Netflix", 30000, { category_id: null }), TODAY)).toEqual([]);
    expect(detectRecurrences(monthly("Netflix", 30000, { recurring_transaction_id: "r1" }), TODAY)).toEqual([]);
  });

  it("no vuelve a sugerir una recurrencia que ya existe", () => {
    expect(detectRecurrences(monthly("Netflix"), TODAY, ["expense|netflix"])).toEqual([]);
    expect(detectRecurrences(monthly("Netflix"), TODAY, ["income|netflix"])).toHaveLength(1);
  });

  it("no propone patrones ya inactivos (última ocurrencia hace más de dos intervalos)", () => {
    const old = [tx("Gimnasio", "2026-01-05"), tx("Gimnasio", "2026-02-05"), tx("Gimnasio", "2026-03-05")];
    expect(detectRecurrences(old, TODAY)).toEqual([]);
  });

  it("la fecha propuesta nunca es pasada: activar no registra movimientos atrasados", () => {
    const [s] = detectRecurrences([tx("Renta", "2026-09-14"), tx("Renta", "2026-10-14"), tx("Renta", "2026-11-14")], TODAY);
    expect(s.nextDate > TODAY).toBe(true);
    expect(s.nextDate).toBe("2026-12-14");
  });

  it("ingresos recurrentes también se detectan", () => {
    const salary = ["2026-08-30", "2026-09-30", "2026-10-30"].map((d) => tx("Salario", d, 3000000, { type: "INCOME" }));
    const [s] = detectRecurrences(salary, TODAY);
    expect(s.type).toBe("INCOME");
    expect(s.frequency).toBe("MONTHLY");
  });

  it("dos movimientos el mismo día no forman un patrón", () => {
    expect(detectRecurrences([tx("Café", "2026-10-05"), tx("Café", "2026-10-05"), tx("Café", "2026-10-05")], TODAY)).toEqual([]);
  });

  it("es determinista, no muta la entrada y ordena por repeticiones", () => {
    const input = [...monthly("Netflix"), ...["2026-07-01", "2026-08-01", "2026-09-01", "2026-10-01"].map((d) => tx("Arriendo", d, 900000))];
    const copy = JSON.stringify(input);
    const a = detectRecurrences(input, TODAY);
    expect(JSON.stringify(input)).toBe(copy);
    expect(a.map((s) => s.description)).toEqual(["Arriendo", "Netflix"]);
    expect(JSON.stringify(detectRecurrences(input, TODAY))).toBe(JSON.stringify(a));
  });
});
