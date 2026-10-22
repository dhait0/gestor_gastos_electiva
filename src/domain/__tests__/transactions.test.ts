import { describe, it, expect } from "vitest";
import {
  validateTransaction,
  createTransferPair,
  calculateAccountBalance,
  calculateLiquidBalance,
  calculateAvailableToSpend,
  calculateMonthlyIncomeExpense,
  getCurrentMonthRange,
  TransactionType,
  TransactionDirection,
  Transaction,
} from "../transactions";
import { Decimal } from "decimal.js";

describe("domain/transactions", () => {
  describe("validateTransaction", () => {
    const validIncome: TransactionType = "INCOME";
    const validExpense: TransactionType = "EXPENSE";
    const validTransfer: TransactionType = "TRANSFER";

    it("valida INCOME correcto", () => {
      const input = {
        account_id: "acc-1",
        category_id: "cat-1",
        type: validIncome,
        direction: "INFLOW" as TransactionDirection,
        amount: "100000",
        currency_code: "COP",
        description: "Salario",
        transaction_date: "2026-01-15",
      };
      expect(validateTransaction(input)).toBeNull();
    });

    it("rechaza INCOME con direction OUTFLOW", () => {
      const input = {
        account_id: "acc-1",
        category_id: "cat-1",
        type: validIncome,
        direction: "OUTFLOW" as TransactionDirection,
        amount: "100000",
        currency_code: "COP",
        description: "Salario",
        transaction_date: "2026-01-15",
      };
      expect(validateTransaction(input)).toBe("INCOME debe tener direction INFLOW");
    });

    it("rechaza INCOME sin category_id", () => {
      const input = {
        account_id: "acc-1",
        type: validIncome,
        direction: "INFLOW" as TransactionDirection,
        amount: "100000",
        currency_code: "COP",
        description: "Salario",
        transaction_date: "2026-01-15",
      };
      expect(validateTransaction(input)).toBe("INCOME requiere category_id");
    });

    it("valida EXPENSE correcto", () => {
      const input = {
        account_id: "acc-1",
        category_id: "cat-2",
        type: validExpense,
        direction: "OUTFLOW" as TransactionDirection,
        amount: "50000",
        currency_code: "COP",
        description: "Almuerzo",
        transaction_date: "2026-01-15",
      };
      expect(validateTransaction(input)).toBeNull();
    });

    it("rechaza EXPENSE con direction INFLOW", () => {
      const input = {
        account_id: "acc-1",
        category_id: "cat-2",
        type: validExpense,
        direction: "INFLOW" as TransactionDirection,
        amount: "50000",
        currency_code: "COP",
        description: "Almuerzo",
        transaction_date: "2026-01-15",
      };
      expect(validateTransaction(input)).toBe("EXPENSE debe tener direction OUTFLOW");
    });

    it("rechaza EXPENSE sin category_id", () => {
      const input = {
        account_id: "acc-1",
        type: validExpense,
        direction: "OUTFLOW" as TransactionDirection,
        amount: "50000",
        currency_code: "COP",
        description: "Almuerzo",
        transaction_date: "2026-01-15",
      };
      expect(validateTransaction(input)).toBe("EXPENSE requiere category_id");
    });

    it("valida TRANSFER correcto (OUTFLOW)", () => {
      const input = {
        account_id: "acc-1",
        type: validTransfer,
        direction: "OUTFLOW" as TransactionDirection,
        amount: "200000",
        currency_code: "COP",
        description: "Transferencia a ahorros",
        transaction_date: "2026-01-15",
        transfer_group_id: "tg-1",
      };
      expect(validateTransaction(input)).toBeNull();
    });

    it("valida TRANSFER correcto (INFLOW)", () => {
      const input = {
        account_id: "acc-2",
        type: validTransfer,
        direction: "INFLOW" as TransactionDirection,
        amount: "200000",
        currency_code: "COP",
        description: "Transferencia a ahorros",
        transaction_date: "2026-01-15",
        transfer_group_id: "tg-1",
      };
      expect(validateTransaction(input)).toBeNull();
    });

    it("rechaza TRANSFER con category_id", () => {
      const input = {
        account_id: "acc-1",
        category_id: "cat-1",
        type: validTransfer,
        direction: "OUTFLOW" as TransactionDirection,
        amount: "200000",
        currency_code: "COP",
        description: "Transferencia",
        transaction_date: "2026-01-15",
        transfer_group_id: "tg-1",
      };
      expect(validateTransaction(input)).toBe("TRANSFER no debe tener category_id");
    });

    it("rechaza TRANSFER sin transfer_group_id", () => {
      const input = {
        account_id: "acc-1",
        type: validTransfer,
        direction: "OUTFLOW" as TransactionDirection,
        amount: "200000",
        currency_code: "COP",
        description: "Transferencia",
        transaction_date: "2026-01-15",
      };
      expect(validateTransaction(input)).toBe("TRANSFER requiere transfer_group_id");
    });

    it("rechaza amount <= 0", () => {
      const input = {
        account_id: "acc-1",
        category_id: "cat-1",
        type: validIncome,
        direction: "INFLOW" as TransactionDirection,
        amount: "0",
        currency_code: "COP",
        description: "Test",
        transaction_date: "2026-01-15",
      };
      expect(validateTransaction(input)).toBe("amount debe ser mayor a 0");
    });

    it("rechaza amount negativo", () => {
      const input = {
        account_id: "acc-1",
        category_id: "cat-1",
        type: validIncome,
        direction: "INFLOW" as TransactionDirection,
        amount: "-100",
        currency_code: "COP",
        description: "Test",
        transaction_date: "2026-01-15",
      };
      expect(validateTransaction(input)).toBe("amount debe ser mayor a 0");
    });

    it("rechaza currency_code inválido", () => {
      const input = {
        account_id: "acc-1",
        category_id: "cat-1",
        type: validIncome,
        direction: "INFLOW" as TransactionDirection,
        amount: "100000",
        currency_code: "CO",
        description: "Test",
        transaction_date: "2026-01-15",
      };
      expect(validateTransaction(input)).toBe("currency_code debe ser un código ISO de 3 caracteres");
    });

    it("rechaza description vacía", () => {
      const input = {
        account_id: "acc-1",
        category_id: "cat-1",
        type: validIncome,
        direction: "INFLOW" as TransactionDirection,
        amount: "100000",
        currency_code: "COP",
        description: "",
        transaction_date: "2026-01-15",
      };
      expect(validateTransaction(input)).toBe("description es requerida");
    });

    it("rechaza transaction_date faltante", () => {
      const input = {
        account_id: "acc-1",
        category_id: "cat-1",
        type: validIncome,
        direction: "INFLOW" as TransactionDirection,
        amount: "100000",
        currency_code: "COP",
        description: "Test",
        transaction_date: "",
      };
      expect(validateTransaction(input)).toBe("transaction_date es requerida");
    });
  });

  describe("createTransferPair", () => {
    it("crea par de transferencia válido", () => {
      const pair = createTransferPair(
        "acc-from",
        "acc-to",
        "150000",
        "COP",
        "Pago tarjeta",
        "2026-01-20"
      );

      expect(pair.outflow.account_id).toBe("acc-from");
      expect(pair.inflow.account_id).toBe("acc-to");
      expect(pair.outflow.direction).toBe("OUTFLOW");
      expect(pair.inflow.direction).toBe("INFLOW");
      expect(pair.outflow.type).toBe("TRANSFER");
      expect(pair.inflow.type).toBe("TRANSFER");
      expect(pair.outflow.transfer_group_id).toBe(pair.inflow.transfer_group_id);
      expect(new Decimal(pair.outflow.amount).equals(150000)).toBe(true);
      expect(new Decimal(pair.inflow.amount).equals(150000)).toBe(true);
      expect(pair.outflow.description).toBe("Pago tarjeta");
      expect(pair.inflow.description).toBe("Pago tarjeta");
    });

    it("lanza error si monto <= 0", () => {
      expect(() =>
        createTransferPair("a", "b", "0", "COP", "Test", "2026-01-01")
      ).toThrow("El monto de la transferencia debe ser mayor a 0");
    });

    it("lanza error si cuentas son iguales", () => {
      expect(() =>
        createTransferPair("acc-1", "acc-1", "100", "COP", "Test", "2026-01-01")
      ).toThrow("Las cuentas de origen y destino deben ser diferentes");
    });

    it("incluye notes en ambos movimientos", () => {
      const pair = createTransferPair("a", "b", "100", "COP", "Test", "2026-01-01", "Nota de prueba");
      expect(pair.outflow.notes).toBe("Nota de prueba");
      expect(pair.inflow.notes).toBe("Nota de prueba");
    });
  });

  describe("calculateAccountBalance", () => {
    const transactions = [
      {
        id: "t1",
        account_id: "acc-1",
        type: "INCOME" as TransactionType,
        direction: "INFLOW" as TransactionDirection,
        amount: "1000000",
        currency_code: "COP",
        description: "Salario",
        transaction_date: "2026-01-01",
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
        deleted_at: null,
        user_id: "user-1",
      },
      {
        id: "t2",
        account_id: "acc-1",
        type: "EXPENSE" as TransactionType,
        direction: "OUTFLOW" as TransactionDirection,
        amount: "300000",
        currency_code: "COP",
        description: "Compras",
        transaction_date: "2026-01-05",
        created_at: "2026-01-05T00:00:00Z",
        updated_at: "2026-01-05T00:00:00Z",
        deleted_at: null,
        user_id: "user-1",
      },
      {
        id: "t3",
        account_id: "acc-1",
        type: "EXPENSE" as TransactionType,
        direction: "OUTFLOW" as TransactionDirection,
        amount: "150000",
        currency_code: "COP",
        description: "Transporte",
        transaction_date: "2026-01-10",
        created_at: "2026-01-10T00:00:00Z",
        updated_at: "2026-01-10T00:00:00Z",
        deleted_at: null,
        user_id: "user-1",
      },
    ];

    it("calcula balance correctamente (INFLOW - OUTFLOW)", () => {
      const balance = calculateAccountBalance(transactions, "acc-1");
      expect(balance.equals(new Decimal(550000))).toBe(true);
    });

    it("ignora transacciones de otras cuentas", () => {
      const withOtherAccount = [
        ...transactions,
        {
          id: "t4",
          account_id: "acc-2",
          type: "INCOME" as TransactionType,
          direction: "INFLOW" as TransactionDirection,
          amount: "500000",
          currency_code: "COP",
          description: "Otro ingreso",
          transaction_date: "2026-01-01",
          created_at: "2026-01-01T00:00:00Z",
          updated_at: "2026-01-01T00:00:00Z",
          deleted_at: null,
          user_id: "user-1",
        },
      ];
      const balance = calculateAccountBalance(withOtherAccount, "acc-1");
      expect(balance.equals(new Decimal(550000))).toBe(true);
    });

    it("ignora transacciones soft-deleted", () => {
      const withDeleted = [
        ...transactions,
        {
          ...transactions[1],
          id: "t2-deleted",
          deleted_at: "2026-01-06T00:00:00Z",
        },
      ];
      const balance = calculateAccountBalance(withDeleted, "acc-1");
      // El original t2 (300k OUTFLOW) sigue activo, t2-deleted se ignora
      // Balance = 1,000,000 - 300,000 - 150,000 = 550,000
      expect(balance.equals(new Decimal(550000))).toBe(true);
    });

    it("retorna 0 para cuenta sin transacciones", () => {
      const balance = calculateAccountBalance(transactions, "acc-inexistente");
      expect(balance.equals(new Decimal(0))).toBe(true);
    });
  });

  describe("calculateLiquidBalance", () => {
    const accounts = [
      { id: "acc-cash", type: "CASH" },
      { id: "acc-checking", type: "CHECKING" },
      { id: "acc-savings", type: "SAVINGS" },
      { id: "acc-wallet", type: "DIGITAL_WALLET" },
      { id: "acc-credit", type: "CREDIT_CARD" },
      { id: "acc-other", type: "OTHER" },
    ];

    const transactions = [
      { id: "t1", account_id: "acc-cash", type: "INCOME" as TransactionType, direction: "INFLOW" as TransactionDirection, amount: "500000", currency_code: "COP", description: "Efectivo", transaction_date: "2026-01-01", created_at: "", updated_at: "", deleted_at: null, user_id: "u1" },
      { id: "t2", account_id: "acc-checking", type: "INCOME" as TransactionType, direction: "INFLOW" as TransactionDirection, amount: "1000000", currency_code: "COP", description: "Nómina", transaction_date: "2026-01-01", created_at: "", updated_at: "", deleted_at: null, user_id: "u1" },
      { id: "t3", account_id: "acc-savings", type: "INCOME" as TransactionType, direction: "INFLOW" as TransactionDirection, amount: "2000000", currency_code: "COP", description: "Ahorros", transaction_date: "2026-01-01", created_at: "", updated_at: "", deleted_at: null, user_id: "u1" },
      { id: "t4", account_id: "acc-wallet", type: "INCOME" as TransactionType, direction: "INFLOW" as TransactionDirection, amount: "300000", currency_code: "COP", description: "Nequi", transaction_date: "2026-01-01", created_at: "", updated_at: "", deleted_at: null, user_id: "u1" },
      { id: "t5", account_id: "acc-credit", type: "EXPENSE" as TransactionType, direction: "OUTFLOW" as TransactionDirection, amount: "400000", currency_code: "COP", description: "Compra TC", transaction_date: "2026-01-05", created_at: "", updated_at: "", deleted_at: null, user_id: "u1" },
      { id: "t6", account_id: "acc-other", type: "EXPENSE" as TransactionType, direction: "OUTFLOW" as TransactionDirection, amount: "100000", currency_code: "COP", description: "Otro", transaction_date: "2026-01-10", created_at: "", updated_at: "", deleted_at: null, user_id: "u1" },
    ];

    it("incluye solo cuentas líquidas (CASH, CHECKING, SAVINGS, DIGITAL_WALLET)", () => {
      const balance = calculateLiquidBalance(transactions, accounts);
      // 500000 + 1000000 + 2000000 + 300000 = 3,800,000
      expect(balance.equals(new Decimal(3800000))).toBe(true);
    });

    it("excluye CREDIT_CARD y OTHER", () => {
      const balance = calculateLiquidBalance(transactions, accounts);
      // La compra con tarjeta (400k) y otro (100k) NO restan del saldo líquido
      expect(balance.equals(new Decimal(3800000))).toBe(true);
    });

    it("maneja transacciones soft-deleted", () => {
      const withDeleted = [
        ...transactions,
        { ...transactions[0], id: "t1-deleted", deleted_at: "2026-01-02T00:00:00Z" },
      ];
      const balance = calculateLiquidBalance(withDeleted, accounts);
      // El original t1 (500k INFLOW en cash) sigue activo, t1-deleted se ignora
      // Balance = 3,800,000 (original)
      expect(balance.equals(new Decimal(3800000))).toBe(true);
    });
  });

  describe("calculateAvailableToSpend", () => {
    it("calcula disponible normal: saldo - obligaciones - reserva", () => {
      const result = calculateAvailableToSpend({
        liquidBalance: new Decimal(1800000),
        pendingObligations: new Decimal(600000),
        safetyReserve: new Decimal(200000),
      });
      expect(result.equals(new Decimal(1000000))).toBe(true);
    });

    it("calcula disponible en déficit: resultado negativo", () => {
      const result = calculateAvailableToSpend({
        liquidBalance: new Decimal(500000),
        pendingObligations: new Decimal(600000),
        safetyReserve: new Decimal(100000),
      });
      expect(result.equals(new Decimal(-200000))).toBe(true);
    });

    it("con cero obligaciones y cero reserva: disponible = saldo líquido", () => {
      const result = calculateAvailableToSpend({
        liquidBalance: new Decimal(1000000),
        pendingObligations: new Decimal(0),
        safetyReserve: new Decimal(0),
      });
      expect(result.equals(new Decimal(1000000))).toBe(true);
    });

    it("con solo reserva sin obligaciones", () => {
      const result = calculateAvailableToSpend({
        liquidBalance: new Decimal(1000000),
        pendingObligations: new Decimal(0),
        safetyReserve: new Decimal(300000),
      });
      expect(result.equals(new Decimal(700000))).toBe(true);
    });

    it("con solo obligaciones sin reserva", () => {
      const result = calculateAvailableToSpend({
        liquidBalance: new Decimal(1000000),
        pendingObligations: new Decimal(400000),
        safetyReserve: new Decimal(0),
      });
      expect(result.equals(new Decimal(600000))).toBe(true);
    });
  });
});
function txm(overrides: Partial<Transaction> & Pick<Transaction, "id" | "account_id" | "type" | "direction" | "amount" | "transaction_date">): Transaction {
  return {
    id: overrides.id,
    user_id: "user-1",
    account_id: overrides.account_id,
    type: overrides.type,
    direction: overrides.direction,
    amount: overrides.amount,
    currency_code: overrides.currency_code ?? "COP",
    description: "Movimiento",
    transaction_date: overrides.transaction_date,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    deleted_at: overrides.deleted_at ?? null,
  };
}

describe("calculateMonthlyIncomeExpense", () => {
  const tz = "America/Bogota";
  const now = new Date("2026-10-15T12:00:00Z");

  it("suma ingresos y gastos del mes actual", () => {
    const txs = [
      txm({ id: "1", account_id: "a1", type: "INCOME", direction: "INFLOW", amount: "1000", transaction_date: "2026-10-10" }),
      txm({ id: "2", account_id: "a1", type: "EXPENSE", direction: "OUTFLOW", amount: "300", transaction_date: "2026-10-12" }),
    ];
    const res = calculateMonthlyIncomeExpense(txs, "COP", tz, now);
    expect(res.income.toString()).toBe("1000");
    expect(res.expense.toString()).toBe("300");
  });

  it("excluye transferencias", () => {
    const txs = [
      txm({ id: "1", account_id: "a1", type: "TRANSFER", direction: "OUTFLOW", amount: "500", transaction_date: "2026-10-10" }),
      txm({ id: "2", account_id: "a1", type: "TRANSFER", direction: "INFLOW", amount: "500", transaction_date: "2026-10-10" }),
    ];
    const res = calculateMonthlyIncomeExpense(txs, "COP", tz, now);
    expect(res.income.toString()).toBe("0");
    expect(res.expense.toString()).toBe("0");
  });

  it("excluye monedas distintas a la base", () => {
    const txs = [
      txm({ id: "1", account_id: "a1", type: "INCOME", direction: "INFLOW", amount: "100", currency_code: "USD", transaction_date: "2026-10-10" }),
    ];
    const res = calculateMonthlyIncomeExpense(txs, "COP", tz, now);
    expect(res.income.toString()).toBe("0");
  });

  it("excluye transacciones eliminadas lógicamente", () => {
    const txs = [
      txm({ id: "1", account_id: "a1", type: "INCOME", direction: "INFLOW", amount: "1000", transaction_date: "2026-10-10", deleted_at: "2026-10-11T00:00:00Z" }),
    ];
    const res = calculateMonthlyIncomeExpense(txs, "COP", tz, now);
    expect(res.income.toString()).toBe("0");
  });

  it("excluye movimientos de meses anteriores", () => {
    const txs = [
      txm({ id: "1", account_id: "a1", type: "INCOME", direction: "INFLOW", amount: "1000", transaction_date: "2026-09-30" }),
    ];
    const res = calculateMonthlyIncomeExpense(txs, "COP", tz, now);
    expect(res.income.toString()).toBe("0");
  });

  it("sin transacciones devuelve 0/0", () => {
    const res = calculateMonthlyIncomeExpense([], "COP", tz, now);
    expect(res.income.toString()).toBe("0");
    expect(res.expense.toString()).toBe("0");
  });

  it("solo ingresos: gastos 0", () => {
    const txs = [
      txm({ id: "1", account_id: "a1", type: "INCOME", direction: "INFLOW", amount: "500", transaction_date: "2026-10-05" }),
    ];
    const res = calculateMonthlyIncomeExpense(txs, "COP", tz, now);
    expect(res.income.toString()).toBe("500");
    expect(res.expense.toString()).toBe("0");
  });

  it("solo gastos: ingresos 0", () => {
    const txs = [
      txm({ id: "1", account_id: "a1", type: "EXPENSE", direction: "OUTFLOW", amount: "200", transaction_date: "2026-10-05" }),
    ];
    const res = calculateMonthlyIncomeExpense(txs, "COP", tz, now);
    expect(res.income.toString()).toBe("0");
    expect(res.expense.toString()).toBe("200");
  });

  it("movimiento cerca del cambio de mes en zona horaria del usuario", () => {
    // Medianoche UTC del 1 de noviembre = 31 de octubre en Bogotá (UTC-5)
    const nowNov = new Date("2026-11-01T02:00:00Z"); // 31 oct 21:00 Bogotá
    const txs = [
      txm({ id: "1", account_id: "a1", type: "INCOME", direction: "INFLOW", amount: "700", transaction_date: "2026-10-31" }),
    ];
    const res = calculateMonthlyIncomeExpense(txs, "COP", tz, nowNov);
    expect(res.income.toString()).toBe("700");
  });
});

describe("getCurrentMonthRange", () => {
  it("devuelve rango correcto para octubre 2026 en Bogotá", () => {
    const r = getCurrentMonthRange("America/Bogota", new Date("2026-10-15T12:00:00Z"));
    expect(r.start).toBe("2026-10-01");
    expect(r.end).toBe("2026-10-31");
  });

  it("devuelve rango correcto para febrero (28 días)", () => {
    const r = getCurrentMonthRange("America/Bogota", new Date("2026-02-10T12:00:00Z"));
    expect(r.start).toBe("2026-02-01");
    expect(r.end).toBe("2026-02-28");
  });
});
