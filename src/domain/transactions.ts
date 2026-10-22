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
  /** Moneda de la cuenta. Si se omite, se asume la moneda base del agregado. */
  currency_code?: string | null;
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
/**
 * Saldo actual de una cuenta (estrategia B).
 *
 * Precondición de moneda: se asume que todas las transacciones del `accountId`
 * comparten la moneda de la cuenta (validado en `createTransactionAction` y
 * `createTransferAction`). Esta función no filtra por moneda ni convierte; si se
 * le pasan movimientos en otra moneda, los sumará sin distinción.
 *
 *   saldo actual = opening_balance + entradas − salidas
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
/**
 * Saldo líquido: suma el saldo actual de las cuentas líquidas y no archivadas,
 * **filtrando internamente por `baseCurrency`** para no mezclar monedas.
 *
 * Las cuentas archivadas se excluyen (defensa en profundidad). Las cuentas y
 * transacciones cuya moneda no coincida con `baseCurrency` se excluyen del
 * agregado; no se realiza conversión.
 */
export function calculateLiquidBalance(
  transactions: Transaction[],
  accounts: BalanceAccount[],
  baseCurrency: string
): Decimal {
  const liquidAccounts = accounts.filter(
    (a) =>
      LIQUID_ACCOUNT_TYPES.includes(a.type) &&
      !a.is_archived &&
      (a.currency_code ?? baseCurrency) === baseCurrency
  );
  const liquidAccountIds = liquidAccounts.map((a) => a.id);

  const movements = transactions
    .filter(
      (t) =>
        liquidAccountIds.includes(t.account_id) &&
        !t.deleted_at &&
        t.currency_code === baseCurrency
    )
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

export interface MonthlyIncomeExpense {
  income: Decimal;
  expense: Decimal;
}

/**
 * Calcula el rango del mes actual (inicio y fin) en la zona horaria indicada.
 * Devuelve fechas ISO (YYYY-MM-DD) para comparar con `transaction_date` (tipo date).
 */
export function calculateAvailableToSpend(input: AvailableToSpendInput): Decimal {
  return input.liquidBalance.minus(input.pendingObligations).minus(input.safetyReserve);
}

export function getCurrentMonthRange(
  timezone: string,
  now: Date = new Date()
): { start: string; end: string } {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
  });
  const parts = formatter.formatToParts(now);
  const year = parts.find((p) => p.type === "year")!.value;
  const month = parts.find((p) => p.type === "month")!.value;

  const start = `${year}-${month}-01`;
  // Día último del mes (independiente de zona horaria: solo depende del mes)
  const lastDay = new Date(Number(year), Number(month), 0).getDate();
  const end = `${year}-${month}-${String(lastDay).padStart(2, "0")}`;

  return { start, end };
}

/**
 * Calcula los ingresos y gastos reales del mes actual para la moneda base.
 *
 * Reglas:
 * - Excluye transacciones eliminadas lógicamente (deleted_at != null).
 * - Excluye transferencias internas (type === "TRANSFER").
 * - Excluye transacciones en monedas distintas a baseCurrency.
 * - No considera opening_balance como ingreso (es atributo de cuenta).
 * - Solo suma INCOME (INFLOW) y EXPENSE (OUTFLOW) del mes actual
 *   según la zona horaria del perfil.
 */
export function calculateMonthlyIncomeExpense(
  transactions: Transaction[],
  baseCurrency: string,
  timezone: string,
  now: Date = new Date()
): MonthlyIncomeExpense {
  const { start, end } = getCurrentMonthRange(timezone, now);

  let income = new Decimal(0);
  let expense = new Decimal(0);

  for (const t of transactions) {
    if (t.deleted_at) continue;
    if (t.currency_code !== baseCurrency) continue;
    if (t.type === "TRANSFER") continue;
    if (t.transaction_date < start || t.transaction_date > end) continue;

    const amount = new Decimal(t.amount);
    if (t.type === "INCOME") {
      income = income.plus(amount);
    } else if (t.type === "EXPENSE") {
      expense = expense.plus(amount);
    }
  }

  return { income, expense };
}
export interface MonthlyTrendPoint {
  month: string; // YYYY-MM
  income: Decimal;
  expense: Decimal;
}

/**
 * Agrega ingresos y gastos por mes para los últimos `months` meses (incluido el actual),
 * respetando la zona horaria del perfil, la moneda base, transferencias excluidas y
 * transacciones eliminadas lógicamente.
 */
export function calculateMonthlyTrend(
  transactions: Transaction[],
  baseCurrency: string,
  timezone: string,
  months: number = 6,
  now: Date = new Date()
): MonthlyTrendPoint[] {
  // Determinar el mes actual en la zona horaria del perfil
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
  });
  const parts = formatter.formatToParts(now);
  const curYear = Number(parts.find((p) => p.type === "year")!.value);
  const curMonth = Number(parts.find((p) => p.type === "month")!.value);

  // Generar los últimos `months` meses
  const monthKeys: string[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(curYear, curMonth - 1 - i, 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    monthKeys.push(`${y}-${m}`);
  }

  const map = new Map<string, { income: Decimal; expense: Decimal }>();
  for (const key of monthKeys) {
    map.set(key, { income: new Decimal(0), expense: new Decimal(0) });
  }

  for (const t of transactions) {
    if (t.deleted_at) continue;
    if (t.currency_code !== baseCurrency) continue;
    if (t.type === "TRANSFER") continue;
    if (t.type !== "INCOME" && t.type !== "EXPENSE") continue;

    // Determinar el mes de la transacción en la zona horaria del perfil
    const txDate = new Date(t.transaction_date + "T00:00:00Z");
    const txParts = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
    }).formatToParts(txDate);
    const txYear = txParts.find((p) => p.type === "year")!.value;
    const txMonth = txParts.find((p) => p.type === "month")!.value;
    const key = `${txYear}-${txMonth}`;

    if (!map.has(key)) continue;

    const entry = map.get(key)!;
    const amount = new Decimal(t.amount);
    if (t.type === "INCOME") {
      entry.income = entry.income.plus(amount);
    } else {
      entry.expense = entry.expense.plus(amount);
    }
  }

  return monthKeys.map((key) => {
    const entry = map.get(key)!;
    return { month: key, income: entry.income, expense: entry.expense };
  });
}
