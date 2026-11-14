import { describe, it, expect } from "vitest";
import { countActiveFilters, getTotalPages, parseTransactionFilters } from "../transaction-filters";

const UUID = "123e4567-e89b-42d3-a456-426614174000";

describe("parseTransactionFilters (UC-21)", () => {
  it("sin parámetros: sin filtros y página 1", () => {
    expect(parseTransactionFilters({})).toEqual({ page: 1 });
  });
  it("acepta tipo, cuenta, categoría, fechas y búsqueda válidos", () => {
    const f = parseTransactionFilters({ type: "EXPENSE", account: UUID, category: UUID, from: "2026-11-01", to: "2026-11-30", q: " café " });
    expect(f).toEqual({ type: "EXPENSE", accountId: UUID, categoryId: UUID, from: "2026-11-01", to: "2026-11-30", search: "café", page: 1 });
  });
  it("descarta valores inválidos sin fallar", () => {
    const f = parseTransactionFilters({ type: "HACK", account: "no-uuid", category: "' or 1=1", from: "2026-13-45", to: "ayer", page: "-4" });
    expect(f).toEqual({ page: 1 });
  });
  it("rechaza fechas imposibles que parecen válidas", () => {
    expect(parseTransactionFilters({ from: "2026-02-30" }).from).toBeUndefined();
    expect(parseTransactionFilters({ from: "2028-02-29" }).from).toBe("2028-02-29");
  });
  it("ordena un rango invertido", () => {
    const f = parseTransactionFilters({ from: "2026-12-01", to: "2026-11-01" });
    expect([f.from, f.to]).toEqual(["2026-11-01", "2026-12-01"]);
  });
  it("toma el primer valor si el parámetro se repite", () => {
    expect(parseTransactionFilters({ type: ["INCOME", "EXPENSE"] }).type).toBe("INCOME");
  });
  it("recorta la búsqueda a 100 caracteres y ignora la vacía", () => {
    expect(parseTransactionFilters({ q: "x".repeat(300) }).search).toHaveLength(100);
    expect(parseTransactionFilters({ q: "   " }).search).toBeUndefined();
  });
  it("página: entero ≥ 1 con tope", () => {
    expect(parseTransactionFilters({ page: "3" }).page).toBe(3);
    expect(parseTransactionFilters({ page: "abc" }).page).toBe(1);
    expect(parseTransactionFilters({ page: "99999999" }).page).toBe(10000);
  });
});

describe("helpers", () => {
  it("cuenta filtros activos sin contar la página", () => {
    expect(countActiveFilters(parseTransactionFilters({ type: "INCOME", q: "x", page: "2" }))).toBe(2);
    expect(countActiveFilters(parseTransactionFilters({}))).toBe(0);
  });
  it("total de páginas", () => {
    expect(getTotalPages(0)).toBe(1);
    expect(getTotalPages(25)).toBe(1);
    expect(getTotalPages(26)).toBe(2);
    expect(getTotalPages(100, 10)).toBe(10);
  });
});
