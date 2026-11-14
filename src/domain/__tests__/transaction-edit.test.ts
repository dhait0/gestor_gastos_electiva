import { describe, it, expect } from "vitest";
import { getDeleteScope, validateTransactionEdit } from "../transaction-edit";

const expense = { type: "EXPENSE" as const, currency_code: "COP" };
const income = { type: "INCOME" as const, currency_code: "COP" };

describe("validateTransactionEdit (UC-11)", () => {
  it("rechaza editar una transferencia", () => {
    expect(validateTransactionEdit({ type: "TRANSFER", currency_code: "COP", transfer_group_id: "g" }, { amount: 5 })).toContain("transferencias no se editan");
  });
  it("acepta cambios válidos de monto, descripción y fecha", () => {
    expect(validateTransactionEdit(expense, { amount: "10.5", description: "Café", transaction_date: "2026-11-02" })).toBeNull();
  });
  it("rechaza monto no positivo, descripción vacía y fecha inválida", () => {
    expect(validateTransactionEdit(expense, { amount: 0 })).toContain("mayor a 0");
    expect(validateTransactionEdit(expense, { amount: "-3" })).toContain("mayor a 0");
    expect(validateTransactionEdit(expense, { description: "   " })).toContain("descripción");
    expect(validateTransactionEdit(expense, { transaction_date: "02/11/2026" })).toContain("fecha");
  });
  it("cambiar de cuenta exige la misma moneda", () => {
    expect(validateTransactionEdit(expense, { account_id: "a2" }, { accountCurrency: "USD" })).toContain("misma moneda");
    expect(validateTransactionEdit(expense, { account_id: "a2" }, { accountCurrency: "COP" })).toBeNull();
    expect(validateTransactionEdit(expense, { account_id: "a2" }, {})).toContain("misma moneda");
  });
  it("la categoría debe ser del mismo tipo que el movimiento", () => {
    expect(validateTransactionEdit(expense, { category_id: "c" }, { categoryType: "INCOME" })).toContain("tipo gasto");
    expect(validateTransactionEdit(income, { category_id: "c" }, { categoryType: "EXPENSE" })).toContain("tipo ingreso");
    expect(validateTransactionEdit(expense, { category_id: "c" }, { categoryType: "EXPENSE" })).toBeNull();
  });
  it("sin cambios no hay error de validación", () => {
    expect(validateTransactionEdit(expense, {})).toBeNull();
  });
});

describe("getDeleteScope (UC-12)", () => {
  it("una transferencia se elimina completa", () => {
    expect(getDeleteScope({ type: "TRANSFER", transfer_group_id: "g1" })).toBe("TRANSFER_PAIR");
  });
  it("ingresos y gastos se eliminan solos", () => {
    expect(getDeleteScope({ type: "EXPENSE", transfer_group_id: null })).toBe("SINGLE");
    expect(getDeleteScope({ type: "INCOME" })).toBe("SINGLE");
  });
});
