import type {
  Transaction,
  TransactionDirection,
  TransactionType,
} from "@/domain/transactions";

/**
 * Fila mínima de `transactions` necesaria para calcular saldos.
 * Es la proyección que usan las consultas de saldos; no es el modelo de
 * dominio completo.
 */
export interface TransactionBalanceRecord {
  id: string;
  account_id: string;
  /** Solo hace falta para desgloses por categoría. */
  category_id?: string | null;
  type: TransactionType;
  direction: TransactionDirection;
  amount: string | number;
  currency_code: string;
  /** Imprescindible para cualquier cálculo por período (YYYY-MM-DD). */
  transaction_date?: string;
  deleted_at: string | null;
}

/**
 * Proyecta filas de `transactions` al modelo de dominio.
 *
 * El saldo de una cuenta depende únicamente de `account_id`, `direction`,
 * `amount` y `deleted_at`. Los cálculos por período además exigen
 * `transaction_date` (se conserva si viene en la fila; si falta, se usa hoy y
 * la consulta NO debe usarse para períodos). `category_id` se conserva para
 * los desgloses. El resto de metadatos se completan con valores neutros.
 */
export function toDomainTransactions(
  rows: TransactionBalanceRecord[],
  userId: string
): Transaction[] {
  const now = new Date().toISOString();
  const today = now.split("T")[0];

  return rows.map(({ category_id, transaction_date, ...row }) => ({
    ...row,
    category_id: category_id ?? undefined,
    amount: row.amount.toString(),
    user_id: userId,
    description: "",
    transaction_date: transaction_date ?? today,
    created_at: now,
    updated_at: now,
  }));
}
