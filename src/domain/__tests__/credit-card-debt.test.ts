import { describe, it, expect } from "vitest";
import {
  calculateAccountBalance,
  calculateCreditCardDebt,
  calculateAccountCurrentValue,
  calculateLiquidBalance,
  type Transaction,
  type TransactionDirection,
  type TransactionType,
} from "../transactions";

function tx(
  id: string,
  accountId: string,
  direction: TransactionDirection,
  amount: string,
  type: TransactionType = direction === "INFLOW" ? "INCOME" : "EXPENSE",
  deletedAt: string | null = null
): Transaction {
  return {
    id,
    account_id: accountId,
    type,
    direction,
    amount,
    currency_code: "COP",
    description: id,
    transaction_date: "2026-01-10",
    created_at: "2026-01-10T00:00:00Z",
    updated_at: "2026-01-10T00:00:00Z",
    deleted_at: deletedAt,
    user_id: "u1",
  };
}

describe("tarjeta de crédito (B02-02): deuda = saldo inicial + salidas − entradas", () => {
  it("sin movimientos, la deuda es el saldo inicial", () => {
    expect(calculateCreditCardDebt([], "cc", "500000").toString()).toBe("500000");
  });

  it("una compra (salida) aumenta la deuda", () => {
    const debt = calculateCreditCardDebt([tx("t1", "cc", "OUTFLOW", "200000")], "cc", "500000");
    expect(debt.toString()).toBe("700000");
  });

  it("un pago (entrada) reduce la deuda", () => {
    const debt = calculateCreditCardDebt([tx("t1", "cc", "INFLOW", "150000", "TRANSFER")], "cc", "500000");
    expect(debt.toString()).toBe("350000");
  });

  it("el saldo inicial cuenta una sola vez aunque haya movimientos", () => {
    const debt = calculateCreditCardDebt(
      [tx("t1", "cc", "OUTFLOW", "100000"), tx("t2", "cc", "OUTFLOW", "50000")],
      "cc",
      "500000"
    );
    expect(debt.toString()).toBe("650000");
  });

  it("ignora movimientos eliminados y de otras cuentas", () => {
    const debt = calculateCreditCardDebt(
      [
        tx("t1", "cc", "OUTFLOW", "100000", "EXPENSE", "2026-01-11T00:00:00Z"),
        tx("t2", "otra", "OUTFLOW", "999999"),
      ],
      "cc",
      "0"
    );
    expect(debt.toString()).toBe("0");
  });

  it("conserva precisión decimal", () => {
    const debt = calculateCreditCardDebt([tx("t1", "cc", "OUTFLOW", "0.1")], "cc", "0.2");
    expect(debt.toString()).toBe("0.3");
  });
});

describe("calculateAccountCurrentValue despacha por tipo de cuenta", () => {
  const movements = [tx("t1", "a", "INFLOW", "100000"), tx("t2", "a", "OUTFLOW", "30000")];

  it("cuenta de activo: saldo inicial + entradas − salidas", () => {
    const v = calculateAccountCurrentValue(movements, { id: "a", type: "CHECKING", opening_balance: "1000" });
    expect(v.toString()).toBe("71000");
    expect(v.toString()).toBe(calculateAccountBalance(movements, "a", "1000").toString());
  });

  it("tarjeta de crédito: saldo inicial + salidas − entradas", () => {
    const v = calculateAccountCurrentValue(movements, { id: "a", type: "CREDIT_CARD", opening_balance: "1000" });
    expect(v.toString()).toBe("-69000");
  });
});

describe("la tarjeta de crédito no forma parte del saldo líquido", () => {
  it("excluye la tarjeta aunque tenga saldo inicial y movimientos", () => {
    const liquid = calculateLiquidBalance(
      [tx("t1", "cc", "OUTFLOW", "100000"), tx("t2", "bank", "INFLOW", "40000")],
      [
        { id: "cc", type: "CREDIT_CARD", opening_balance: "500000", currency_code: "COP" },
        { id: "bank", type: "CHECKING", opening_balance: "1000000", currency_code: "COP" },
      ],
      "COP"
    );
    expect(liquid.toString()).toBe("1040000");
  });
});
