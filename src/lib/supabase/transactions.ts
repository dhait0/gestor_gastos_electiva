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
  type: TransactionType;
  direction: TransactionDirection;
  amount: string | number;
  currency_code: string;
  deleted_at: string | null;
}

/**
 * Proyecta filas de `transactions` al modelo de dominio.
 *
 * El saldo de una cuenta depende únicamente de `account_id`, `direction`,
 * `amount` y `deleted_at`; el resto de metadatos (descripción, fechas) se
 * completan con valores neutros porque no intervienen en el cálculo.
 */
export function toDomainTransactions(
  rows: TransactionBalanceRecord[],
  userId: string
): Transaction[] {
  const now = new Date().toISOString();
  const today = now.split("T")[0];

  return rows.map((row) => ({
    ...row,
    amount: row.amount.toString(),
    user_id: userId,
    description: "",
    transaction_date: today,
    created_at: now,
    updated_at: now,
  }));
}
