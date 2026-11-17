import { describe, it, expect } from "vitest";
import { calculateGoalProgress } from "../goals";

const NOW = new Date("2026-11-14T12:00:00Z");

describe("calculateGoalProgress", () => {
  it("sin aportes: el actual es el monto inicial", () => {
    const p = calculateGoalProgress({ target_amount: "1000", initial_amount: "100" }, [], "America/Bogota", NOW);
    expect(p.current.toString()).toBe("100");
    expect(p.remaining.toString()).toBe("900");
    expect(p.percent).toBe(10);
    expect(p.isCompleted).toBe(false);
  });

  it("suma los aportes activos al monto inicial", () => {
    const p = calculateGoalProgress(
      { target_amount: "1000", initial_amount: "100" },
      [{ amount: "200" }, { amount: "50.5" }],
      "America/Bogota",
      NOW
    );
    expect(p.current.toString()).toBe("350.5");
    expect(p.percent).toBe(35.1);
  });

  it("los aportes eliminados no cuentan", () => {
    const p = calculateGoalProgress(
      { target_amount: "1000" },
      [{ amount: "300" }, { amount: "700", deleted_at: "2026-11-01T00:00:00Z" }],
      "America/Bogota",
      NOW
    );
    expect(p.current.toString()).toBe("300");
  });

  it("al alcanzar o superar la meta: completada, restante 0 y tope 100 %", () => {
    const p = calculateGoalProgress({ target_amount: "1000" }, [{ amount: "1500" }], "America/Bogota", NOW);
    expect(p.isCompleted).toBe(true);
    expect(p.remaining.toString()).toBe("0");
    expect(p.percent).toBe(100);
    expect(p.recommendedMonthly).toBeNull();
  });

  it("conserva precisión decimal", () => {
    const p = calculateGoalProgress({ target_amount: "1", initial_amount: "0.1" }, [{ amount: "0.2" }], "America/Bogota", NOW);
    expect(p.current.toString()).toBe("0.3");
  });

  it("recomienda un aporte mensual = restante / meses (redondeo hacia arriba)", () => {
    const p = calculateGoalProgress(
      { target_amount: "1000", initial_amount: "0", target_date: "2027-02-20" },
      [],
      "America/Bogota",
      NOW
    );
    // noviembre → febrero = 3 meses
    expect(p.monthsRemaining).toBe(3);
    expect(p.recommendedMonthly!.toString()).toBe("333.34");
  });

  it("fecha objetivo este mes: mínimo 1 mes", () => {
    const p = calculateGoalProgress({ target_amount: "600", target_date: "2026-11-30" }, [], "America/Bogota", NOW);
    expect(p.monthsRemaining).toBe(1);
    expect(p.recommendedMonthly!.toString()).toBe("600");
  });

  it("fecha vencida: marca vencida y no recomienda aporte mensual", () => {
    const p = calculateGoalProgress({ target_amount: "600", target_date: "2026-10-01" }, [], "America/Bogota", NOW);
    expect(p.isOverdue).toBe(true);
    expect(p.monthsRemaining).toBeNull();
    expect(p.recommendedMonthly).toBeNull();
  });

  it("sin fecha objetivo no hay recomendación", () => {
    const p = calculateGoalProgress({ target_amount: "600" }, [], "America/Bogota", NOW);
    expect(p.monthsRemaining).toBeNull();
    expect(p.recommendedMonthly).toBeNull();
    expect(p.isOverdue).toBe(false);
  });

  it("usa la zona horaria del perfil para 'hoy'", () => {
    // 1 de diciembre 02:00 UTC sigue siendo 30 de noviembre en Bogotá: la meta del 30-nov no está vencida
    const p = calculateGoalProgress(
      { target_amount: "100", target_date: "2026-11-30" },
      [],
      "America/Bogota",
      new Date("2026-12-01T02:00:00Z")
    );
    expect(p.isOverdue).toBe(false);
  });
});
