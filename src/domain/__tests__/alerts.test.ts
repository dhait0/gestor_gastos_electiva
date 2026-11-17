import { describe, it, expect } from "vitest";
import { Decimal } from "decimal.js";
import { generateAlerts, type AlertInput } from "../alerts";

const base: AlertInput = {
  today: "2026-11-14",
  currencyCode: "COP",
  liquidBalance: new Decimal(1000),
  availableToSpend: new Decimal(800),
  budgets: [],
  obligations: [],
  goals: [],
};

describe("generateAlerts", () => {
  it("sin situaciones de riesgo no genera alertas", () => {
    expect(generateAlerts(base)).toEqual([]);
  });

  it("presupuesto: WARNING/HIGH avisa y EXCEEDED es crítico, con claves distintas", () => {
    const alerts = generateAlerts({
      ...base,
      budgets: [
        { id: "b1", categoryName: "Comida", percent: 75, status: "WARNING", period_month: "2026-11-01" },
        { id: "b2", categoryName: "Ocio", percent: 120, status: "EXCEEDED", period_month: "2026-11-01" },
        { id: "b3", categoryName: "Hogar", percent: 10, status: "NORMAL", period_month: "2026-11-01" },
      ],
    });
    expect(alerts.map((a) => [a.type, a.severity, a.dedupKey])).toEqual([
      ["BUDGET_NEAR_LIMIT", "WARNING", "budget:b1:WARNING"],
      ["BUDGET_EXCEEDED", "CRITICAL", "budget:b2:EXCEEDED"],
    ]);
  });

  it("subir de WARNING a EXCEEDED genera una alerta nueva (otra clave)", () => {
    const warn = generateAlerts({ ...base, budgets: [{ id: "b1", categoryName: "C", percent: 80, status: "WARNING", period_month: "2026-11-01" }] });
    const exceeded = generateAlerts({ ...base, budgets: [{ id: "b1", categoryName: "C", percent: 105, status: "EXCEEDED", period_month: "2026-11-01" }] });
    expect(warn[0].dedupKey).not.toBe(exceeded[0].dedupKey);
  });

  it("obligaciones: vencida es crítica; próxima (≤3 días) es advertencia; lejanas, pagadas y canceladas no", () => {
    const alerts = generateAlerts({
      ...base,
      obligations: [
        { id: "o1", name: "Luz", due_date: "2026-11-12", status: "PENDING" },
        { id: "o2", name: "Agua", due_date: "2026-11-14", status: "PENDING" },
        { id: "o3", name: "Gas", due_date: "2026-11-17", status: "PENDING" },
        { id: "o4", name: "Net", due_date: "2026-11-18", status: "PENDING" },
        { id: "o5", name: "Pagada", due_date: "2026-11-10", status: "PAID" },
        { id: "o6", name: "Cancelada", due_date: "2026-11-10", status: "CANCELLED" },
      ],
    });
    expect(alerts.map((a) => [a.dedupKey, a.severity])).toEqual([
      ["obligation:o1:overdue", "CRITICAL"],
      ["obligation:o2:due-soon", "WARNING"],
      ["obligation:o3:due-soon", "WARNING"],
    ]);
    expect(alerts[1].message).toContain("vence hoy");
  });

  it("disponible negativo es crítico y la clave incluye el mes", () => {
    const [a] = generateAlerts({ ...base, availableToSpend: new Decimal(-1) });
    expect(a.type).toBe("AVAILABLE_NEGATIVE");
    expect(a.severity).toBe("CRITICAL");
    expect(a.dedupKey).toBe("available:negative:2026-11");
  });

  it("disponible bajo (<10% del líquido) avisa; exactamente 10% no", () => {
    const low = generateAlerts({ ...base, availableToSpend: new Decimal(99) });
    expect(low[0].type).toBe("AVAILABLE_LOW");
    expect(generateAlerts({ ...base, availableToSpend: new Decimal(100) })).toEqual([]);
  });

  it("sin saldo líquido no se avisa de 'disponible bajo'", () => {
    expect(generateAlerts({ ...base, liquidBalance: new Decimal(0), availableToSpend: new Decimal(0) })).toEqual([]);
  });

  it("metas: vencida o en riesgo (≤2 meses y <50%); completada o pausada no", () => {
    const alerts = generateAlerts({
      ...base,
      goals: [
        { id: "g1", name: "Viaje", status: "ACTIVE", percent: 20, isOverdue: true, monthsRemaining: null },
        { id: "g2", name: "Moto", status: "ACTIVE", percent: 30, isOverdue: false, monthsRemaining: 2 },
        { id: "g3", name: "Casa", status: "ACTIVE", percent: 60, isOverdue: false, monthsRemaining: 1 },
        { id: "g4", name: "Pausada", status: "PAUSED", percent: 0, isOverdue: true, monthsRemaining: null },
        { id: "g5", name: "Lejos", status: "ACTIVE", percent: 5, isOverdue: false, monthsRemaining: 10 },
      ],
    });
    expect(alerts.map((a) => a.dedupKey)).toEqual(["goal:g1:overdue", "goal:g2:at-risk"]);
  });

  it("las claves de deduplicación son únicas dentro de una misma ejecución", () => {
    const alerts = generateAlerts({
      ...base,
      availableToSpend: new Decimal(-5),
      budgets: [{ id: "b1", categoryName: "C", percent: 95, status: "HIGH", period_month: "2026-11-01" }],
      obligations: [{ id: "o1", name: "Luz", due_date: "2026-11-15", status: "PENDING" }],
    });
    const keys = alerts.map((a) => a.dedupKey);
    expect(new Set(keys).size).toBe(keys.length);
  });
});
