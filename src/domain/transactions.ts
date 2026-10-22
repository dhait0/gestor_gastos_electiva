import { Decimal } from "decimal.js";

export type TransactionType = "INCOME" | "EXPENSE" | "TRANSFER";
export type TransactionDirection = "INFLOW" | "OUTFLOW";

export interface TransactionInput {
  account_id: string;
  category_id?: string;
  type: TransactionType;
  direction: TransactionDirection;
  amount: string | number | Decimal;
  currency_code: string;
  description: string;
  transaction_date: string;
  notes?: string;
  transfer_group_id?: string;
}

export interface Transaction extends TransactionInput {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface TransferPair {
  outflow: TransactionInput;
  inflow: TransactionInput;
}

/**
 * Valor monetario admisible por el dominio. Se normaliza siempre con
 * `decimal.js`; nunca se usan flotantes para calcular saldos.
 */
export type Money = string | number | Decimal;

/**
 * Cuenta con los datos mínimos para agregar saldos (estrategia B).
 *
 * `opening_balance` es un **atributo de la cuenta**, no una transacción: es el
 * saldo con el que la cuenta empieza a existir y se contabiliza exactamente
 * una vez (ver `contexto/arquitectura/MODELO_DATOS_Y_SEGURIDAD.md` §12.1-12.2).
 */
export interface BalanceAccount {
  id: string;
  type: string;
  opening_balance?: Money | null;
  is_archived?: boolean | null;
}

/** Tipos de cuenta que componen el saldo líquido (dinero disponible). */
export const LIQUID_ACCOUNT_TYPES: string[] = ["CASH", "CHECKING", "SAVINGS", "DIGITAL_WALLET"];

/** Normaliza cualquier entrada monetaria a `Decimal`; vacío equivale a cero. */
function toDecimal(value: Money | null | undefined): Decimal {
  if (value === null || value === undefined || value === "") {
    return new Decimal(0);
  }
  return new Decimal(value);
}

export function validateTransaction(input: TransactionInput): string | null {
  if (!input.account_id) {
    return "account_id es requerido";
  }

  if (!input.type) {
    return "type es requerido";
  }

  if (!input.direction) {
    return "direction es requerido";
  }

  if (!input.currency_code || input.currency_code.length !== 3) {
    return "currency_code debe ser un código ISO de 3 caracteres";
  }

  if (!input.description || input.description.trim().length === 0) {
    return "description es requerida";
  }

  if (!input.transaction_date) {
    return "transaction_date es requerida";
  }

  const amount = new Decimal(input.amount);
  if (amount.lte(0)) {
    return "amount debe ser mayor a 0";
  }

  if (input.type === "INCOME") {
    if (input.direction !== "INFLOW") {
      return "INCOME debe tener direction INFLOW";
    }
    if (!input.category_id) {
      return "INCOME requiere category_id";
    }
  }

  if (input.type === "EXPENSE") {
    if (input.direction !== "OUTFLOW") {
      return "EXPENSE debe tener direction OUTFLOW";
    }
    if (!input.category_id) {
      return "EXPENSE requiere category_id";
    }
  }

  if (input.type === "TRANSFER") {
    if (input.category_id) {
      return "TRANSFER no debe tener category_id";
    }
    if (!input.transfer_group_id) {
      return "TRANSFER requiere transfer_group_id";
    }
    if (input.direction !== "INFLOW" && input.direction !== "OUTFLOW") {
      return "TRANSFER debe tener direction INFLOW u OUTFLOW";
    }
  }

  return null;
}

export function createTransferPair(
  fromAccountId: string,
  toAccountId: string,
  amount: string | number | Decimal,
  currencyCode: string,
  description: string,
  transactionDate: string,
  notes?: string
): TransferPair {
  const transferGroupId = crypto.randomUUID();
  const decimalAmount = new Decimal(amount);

  if (decimalAmount.lte(0)) {
    throw new Error("El monto de la transferencia debe ser mayor a 0");
  }

  if (fromAccountId === toAccountId) {
    throw new Error("Las cuentas de origen y destino deben ser diferentes");
  }

  return {
    outflow: {
      account_id: fromAccountId,
      type: "TRANSFER",
      direction: "OUTFLOW",
      amount: decimalAmount,
      currency_code: currencyCode,
      description,
      transaction_date: transactionDate,
      notes,
      transfer_group_id: transferGroupId,
    },
    inflow: {
      account_id: toAccountId,
      type: "TRANSFER",
      direction: "INFLOW",
      amount: decimalAmount,
      currency_code: currencyCode,
      description,
      transaction_date: transactionDate,
      notes,
      transfer_group_id: transferGroupId,
    },
  };
}

/**
 * Saldo actual de una cuenta (estrategia B).
 *
 *   saldo actual = opening_balance + entradas − salidas
 *
 * El saldo inicial se contabiliza **una sola vez**: es un atributo de la
 * cuenta, no un movimiento, de modo que nunca se duplica por tener
 * transacciones registradas.
 */
export function calculateAccountBalance(
  transactions: Transaction[],
  accountId: string,
  openingBalance: Money = 0
): Decimal {
  const movements = transactions
    .filter((t) => t.account_id === accountId && !t.deleted_at)
    .reduce((balance, t) => {
      const amount = new Decimal(t.amount);
      if (t.direction === "INFLOW") {
        return balance.plus(amount);
      }
      return balance.minus(amount);
    }, new Decimal(0));

  return movements.plus(toDecimal(openingBalance));
}

/**
 * Saldo líquido: suma el saldo actual de las cuentas líquidas y no archivadas.
 *
 * Las cuentas archivadas se excluyen (defensa en profundidad: el filtro de
 * `is_archived` en las consultas no debe ser la única barrera).
 */
export function calculateLiquidBalance(
  transactions: Transaction[],
  accounts: BalanceAccount[]
): Decimal {
  const liquidAccounts = accounts.filter(
    (a) => LIQUID_ACCOUNT_TYPES.includes(a.type) && !a.is_archived
  );
  const liquidAccountIds = liquidAccounts.map((a) => a.id);

  const movements = transactions
    .filter((t) => liquidAccountIds.includes(t.account_id) && !t.deleted_at)
    .reduce((balance, t) => {
      const amount = new Decimal(t.amount);
      if (t.direction === "INFLOW") {
        return balance.plus(amount);
      }
      return balance.minus(amount);
    }, new Decimal(0));

  const openingBalances = liquidAccounts.reduce(
    (balance, a) => balance.plus(toDecimal(a.opening_balance)),
    new Decimal(0)
  );

  return movements.plus(openingBalances);
}

export interface AvailableToSpendInput {
  liquidBalance: Decimal;
  pendingObligations: Decimal;
  safetyReserve: Decimal;
}

export function calculateAvailableToSpend(input: AvailableToSpendInput): Decimal {
  return input.liquidBalance.minus(input.pendingObligations).minus(input.safetyReserve);
}