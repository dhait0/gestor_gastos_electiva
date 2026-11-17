/**
 * CONTRATO DE SALDO INICIAL — estrategia B (Lukiva, B01 → implementado en B02)
 *
 * Especificación ejecutable del comportamiento bajo la decisión de
 * arquitectura "el saldo inicial es un atributo de la cuenta, no una transacción
 * de ingreso":
 *
 *   Saldo actual = saldo inicial + entradas − salidas
 *
 * Desde B02 el contrato se verifica contra la implementación real: si la
 * firma o la fórmula cambian, el typecheck falla.
 *
 * Este archivo se ejecuta con la configuración de contrato:
 *   pnpm exec vitest run --config vitest.contract.config.mts
 *
 * También forma parte de la suite por defecto (`pnpm test`).
 */
import { describe, it, expect } from "vitest";
import { Decimal } from "decimal.js";
import {
  calculateAccountBalance,
  calculateLiquidBalance,
  calculateAvailableToSpend,
  type Transaction,
} from "../transactions";

/** Valor monetario admisible como saldo inicial (misma política que `amount`). */
type Money = string | number | Decimal;

/** Cuenta mínima para el agregado de saldo líquido. */
type BalanceAccount = {
  id: string;
  type: string;
  opening_balance?: Money;
  is_archived?: boolean;
};

/** Contrato de `calculateAccountBalance`. */
type AccountBalanceWithOpening = (
  transactions: Transaction[],
  accountId: string,
  openingBalance?: Money
) => Decimal;

/** Contrato de `calculateLiquidBalance`. */
type LiquidBalanceWithOpening = (
  transactions: Transaction[],
  accounts: BalanceAccount[],
  baseCurrency: string
) => Decimal;

// La asignación verifica en tiempo de compilación que la implementación
// satisfacen el contrato (no se usa ningún cast).
const accountBalance: AccountBalanceWithOpening = calculateAccountBalance;
const liquidBalance: LiquidBalanceWithOpening = calculateLiquidBalance;

function tx(
  overrides: Partial<Transaction> &
    Pick<Transaction, "id" | "account_id" | "type" | "direction" | "amount">
): Transaction {
  return {
    user_id: "user-1",
    currency_code: "COP",
    description: "Movimiento",
    transaction_date: "2026-01-01",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    deleted_at: null,
    ...overrides,
  };
}

const INCOME = tx({
  id: "t-income",
  account_id: "acc-1",
  type: "INCOME",
  direction: "INFLOW",
  amount: "500000",
  description: "Salario",
});

const EXPENSE = tx({
  id: "t-expense",
  account_id: "acc-1",
  type: "EXPENSE",
  direction: "OUTFLOW",
  amount: "200000",
  description: "Compras",
});

describe("estrategia B — saldo inicial como atributo de la cuenta", () => {
  describe("calculateAccountBalance", () => {
    it("devuelve el saldo inicial de una cuenta sin movimientos", () => {
      const balance = accountBalance([], "acc-1", 1000000);
      expect(balance.equals(new Decimal(1000000))).toBe(true);
    });

    it("devuelve cero cuando el saldo inicial es cero y no hay movimientos", () => {
      const balance = accountBalance([], "acc-1", 0);
      expect(balance.equals(new Decimal(0))).toBe(true);
    });

    it("con saldo inicial cero solo suma los movimientos", () => {
      const balance = accountBalance([INCOME, EXPENSE], "acc-1", 0);
      expect(balance.equals(new Decimal(300000))).toBe(true);
    });

    it("suma el saldo inicial con ingresos y gastos", () => {
      // 1.000.000 (saldo inicial) + 500.000 (ingreso) - 200.000 (gasto) = 1.300.000
      const balance = accountBalance([INCOME, EXPENSE], "acc-1", 1000000);
      expect(balance.equals(new Decimal(1300000))).toBe(true);
    });

    it("conserva la precisión decimal del saldo inicial", () => {
      const balance = accountBalance([], "acc-1", "12345.6789");
      expect(balance.equals(new Decimal("12345.6789"))).toBe(true);
    });

    it("cada cuenta usa su propio saldo inicial", () => {
      const transactions = [
        INCOME,
        tx({
          id: "t-income-2",
          account_id: "acc-2",
          type: "INCOME",
          direction: "INFLOW",
          amount: "100000",
        }),
      ];

      expect(accountBalance(transactions, "acc-1", 1000000).equals(new Decimal(1500000))).toBe(true);
      expect(accountBalance(transactions, "acc-2", 250000).equals(new Decimal(350000))).toBe(true);
    });

    it("un ingreso real se suma al saldo inicial y no lo reemplaza", () => {
      const balance = accountBalance([INCOME], "acc-1", 1000000);
      expect(balance.equals(new Decimal(1500000))).toBe(true);
    });

    it("no duplica el saldo inicial en cuentas que ya tienen movimientos", () => {
      // Cuenta existente: saldo inicial 1.000.000 + ingreso real 500.000.
      // El saldo inicial se contabiliza una sola vez: 1.500.000 (no 2.000.000).
      const balance = accountBalance([INCOME], "acc-1", 1000000);
      expect(balance.equals(new Decimal(1500000))).toBe(true);
    });

    it("ignora los movimientos con borrado lógico junto con el saldo inicial", () => {
      const deleted = tx({
        ...EXPENSE,
        id: "t-expense-deleted",
        deleted_at: "2026-01-02T00:00:00Z",
      });
      const balance = accountBalance([INCOME, deleted], "acc-1", 1000000);
      expect(balance.equals(new Decimal(1500000))).toBe(true);
    });
  });

  describe("calculateLiquidBalance", () => {
    it("suma los saldos iniciales de las cuentas líquidas", () => {
      const accounts: BalanceAccount[] = [
        { id: "acc-cash", type: "CASH", opening_balance: 500000 },
        { id: "acc-checking", type: "CHECKING", opening_balance: 1000000 },
        { id: "acc-savings", type: "SAVINGS", opening_balance: 2000000 },
      ];

      const balance = liquidBalance([], accounts, "COP");
      expect(balance.equals(new Decimal(3500000))).toBe(true);
    });

    it("excluye el saldo inicial de las cuentas no líquidas", () => {
      const accounts: BalanceAccount[] = [
        { id: "acc-checking", type: "CHECKING", opening_balance: 1000000 },
        { id: "acc-credit", type: "CREDIT_CARD", opening_balance: 5000000 },
        { id: "acc-other", type: "OTHER", opening_balance: 700000 },
      ];

      const balance = liquidBalance([], accounts, "COP");
      expect(balance.equals(new Decimal(1000000))).toBe(true);
    });

    it("excluye las cuentas archivadas del saldo líquido", () => {
      const accounts: BalanceAccount[] = [
        { id: "acc-checking", type: "CHECKING", opening_balance: 1000000 },
        { id: "acc-archivada", type: "CHECKING", opening_balance: 9000000, is_archived: true },
      ];

      const balance = liquidBalance([], accounts, "COP");
      expect(balance.equals(new Decimal(1000000))).toBe(true);
    });

    it("combina saldos iniciales y movimientos de varias cuentas", () => {
      const accounts: BalanceAccount[] = [
        { id: "acc-1", type: "CHECKING", opening_balance: 1000000 },
        { id: "acc-2", type: "SAVINGS", opening_balance: 250000 },
      ];

      const transactions = [
        INCOME,
        tx({
          id: "t-gasto-2",
          account_id: "acc-2",
          type: "EXPENSE",
          direction: "OUTFLOW",
          amount: "50000",
        }),
      ];

      // (1.000.000 + 500.000) + (250.000 - 50.000) = 1.700.000
      const balance = liquidBalance(transactions, accounts, "COP");
      expect(balance.equals(new Decimal(1700000))).toBe(true);
    });

    it("una transferencia entre cuentas no altera el saldo total", () => {
      const accounts: BalanceAccount[] = [
        { id: "acc-1", type: "CHECKING", opening_balance: 1000000 },
        { id: "acc-2", type: "SAVINGS", opening_balance: 250000 },
      ];

      const sinTransferencia = liquidBalance([], accounts, "COP");

      const transferencia = [
        tx({
          id: "t-transfer-out",
          account_id: "acc-1",
          type: "TRANSFER",
          direction: "OUTFLOW",
          amount: "300000",
          transfer_group_id: "tg-1",
        }),
        tx({
          id: "t-transfer-in",
          account_id: "acc-2",
          type: "TRANSFER",
          direction: "INFLOW",
          amount: "300000",
          transfer_group_id: "tg-1",
        }),
      ];

      const conTransferencia = liquidBalance(transferencia, accounts, "COP");

      // El patrimonio total se conserva...
      expect(conTransferencia.equals(sinTransferencia)).toBe(true);
      // ...y las cuentas origen/destination se ven afectadas por separado.
      expect(accountBalance(transferencia, "acc-1", 1000000).equals(new Decimal(700000))).toBe(true);
      expect(accountBalance(transferencia, "acc-2", 250000).equals(new Decimal(550000))).toBe(true);
    });
  });

  describe("calculateAvailableToSpend sobre el saldo con saldo inicial", () => {
    it("el disponible se calcula sobre el saldo líquido que incluye el saldo inicial", () => {
      const accounts: BalanceAccount[] = [{ id: "acc-1", type: "CHECKING", opening_balance: 1000000 }];

      const liquid = liquidBalance([INCOME], accounts, "COP");

      const disponible = calculateAvailableToSpend({
        liquidBalance: liquid,
        pendingObligations: new Decimal(300000),
        safetyReserve: new Decimal(200000),
      });

      // (1.000.000 + 500.000) - 300.000 - 200.000 = 1.000.000
      expect(disponible.equals(new Decimal(1000000))).toBe(true);
    });
  });
});
