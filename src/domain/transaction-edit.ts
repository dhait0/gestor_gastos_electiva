import type { TransactionType } from "./transactions";

export interface EditableTransaction {
  type: TransactionType;
  currency_code: string;
  transfer_group_id?: string | null;
}

export interface TransactionChanges {
  amount?: string | number;
  description?: string;
  transaction_date?: string;
  account_id?: string;
  category_id?: string;
}

export interface EditContext {
  /** Moneda de la cuenta destino si `account_id` cambia. */
  accountCurrency?: string | null;
  /** Tipo de la categoría elegida si `category_id` cambia. */
  categoryType?: "INCOME" | "EXPENSE" | null;
}

/**
 * Reglas de edición de un movimiento (UC-11). Devuelve un mensaje de error o null.
 *  - Las transferencias no se editan: son un par que debe permanecer neutral;
 *    se eliminan (ambas patas) y se vuelven a crear.
 *  - El tipo y la dirección no cambian: un ingreso sigue siendo un ingreso.
 *  - Cambiar de cuenta exige la misma moneda; la categoría debe ser del mismo tipo.
 */
export function validateTransactionEdit(
  existing: EditableTransaction,
  changes: TransactionChanges,
  ctx: EditContext = {}
): string | null {
  if (existing.type === "TRANSFER") {
    return "Las transferencias no se editan: elimínala y créala de nuevo";
  }
  if (changes.amount !== undefined && !(Number(changes.amount) > 0)) {
    return "El monto debe ser mayor a 0";
  }
  if (changes.description !== undefined && changes.description.trim().length === 0) {
    return "La descripción es requerida";
  }
  if (changes.transaction_date !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(changes.transaction_date)) {
    return "Formato de fecha inválido (YYYY-MM-DD)";
  }
  if (changes.account_id !== undefined && ctx.accountCurrency !== existing.currency_code) {
    return "La cuenta debe estar en la misma moneda del movimiento";
  }
  if (changes.category_id !== undefined && ctx.categoryType !== existing.type) {
    return existing.type === "INCOME"
      ? "La categoría debe ser de tipo ingreso"
      : "La categoría debe ser de tipo gasto";
  }
  return null;
}

/**
 * Qué se elimina al borrar un movimiento (UC-12): una transferencia se elimina
 * completa (ambas patas) para no dejar un saldo descuadrado.
 */
export function getDeleteScope(tx: Pick<EditableTransaction, "type" | "transfer_group_id">): "SINGLE" | "TRANSFER_PAIR" {
  return tx.type === "TRANSFER" && tx.transfer_group_id ? "TRANSFER_PAIR" : "SINGLE";
}
