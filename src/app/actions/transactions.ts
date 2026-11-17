"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { z } from "zod";
import { Decimal } from "decimal.js";
import { validateTransaction, createTransferPair } from "@/domain/transactions";
import { getDeleteScope, validateTransactionEdit } from "@/domain/transaction-edit";

const transactionTypeSchema = z.enum(["INCOME", "EXPENSE", "TRANSFER"]);
const transactionDirectionSchema = z.enum(["INFLOW", "OUTFLOW"]);

const createTransactionSchema = z.object({
  account_id: z.string().uuid(),
  category_id: z.string().uuid().optional(),
  type: transactionTypeSchema,
  direction: transactionDirectionSchema,
  amount: z.string().refine((val) => parseFloat(val) > 0, "El monto debe ser mayor a 0"),
  currency_code: z.string().length(3),
  description: z.string().trim().min(1, "La descripción es requerida").max(200),
  transaction_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido (YYYY-MM-DD)"),
  notes: z.string().optional(),
  transfer_group_id: z.string().uuid().optional(),
});

const createTransferSchema = z.object({
  from_account_id: z.string().uuid(),
  to_account_id: z.string().uuid(),
  amount: z.string().refine((val) => parseFloat(val) > 0, "El monto debe ser mayor a 0"),
  currency_code: z.string().length(3),
  description: z.string().trim().min(1, "La descripción es requerida").max(200),
  transaction_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido (YYYY-MM-DD)"),
  notes: z.string().optional(),
});

// Solo estos campos son editables: tipo, dirección y moneda no cambian (ver domain/transaction-edit.ts)
const updateTransactionSchema = z.object({
  id: z.string().uuid(),
  account_id: z.string().uuid().optional(),
  category_id: z.string().uuid().optional(),
  amount: z.string().refine((val) => parseFloat(val) > 0, "El monto debe ser mayor a 0").optional(),
  description: z.string().trim().min(1, "La descripción es requerida").max(200).optional(),
  transaction_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido (YYYY-MM-DD)").optional(),
  notes: z.string().max(500).optional().nullable(),
});

type FormState =
  | { error: string }
  | { error: Record<string, string[]> }
  | { data: { id: string } | { outflowId: string; inflowId: string } }
  | { error?: undefined; data?: undefined };

export async function createTransactionAction(_prevState: FormState, formData: FormData): Promise<FormState> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "No autorizado" };
  }

  const rawData = {
    account_id: formData.get("account_id"),
    category_id: formData.get("category_id") || undefined,
    type: formData.get("type"),
    direction: formData.get("direction"),
    amount: formData.get("amount"),
    currency_code: formData.get("currency_code") || "COP",
    description: formData.get("description"),
    transaction_date: formData.get("transaction_date"),
    notes: formData.get("notes") || undefined,
    transfer_group_id: formData.get("transfer_group_id") || undefined,
  };

  const parsed = createTransactionSchema.safeParse(rawData);

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const validationError = validateTransaction(parsed.data);
  if (validationError) {
    return { error: validationError };
  }

  // Política de monedas (§66-67): la moneda de la transacción debe coincidir
  // con la moneda de la cuenta. No hay conversión automática en V1.
  const { data: account, error: accountError } = await supabase
    .from("accounts")
    .select("currency_code")
    .eq("id", parsed.data.account_id)
    .eq("user_id", user.id)
    .single();

  if (accountError || !account) {
    return { error: "Cuenta no encontrada" };
  }

  if (account.currency_code !== parsed.data.currency_code) {
    return { error: "La moneda de la transacción debe coincidir con la de la cuenta" };
  }

  // Convert Decimal amount to number for database
  const dbData = {
    ...parsed.data,
    amount: new Decimal(parsed.data.amount).toNumber(),
  };

  const { data, error } = await supabase
    .from("transactions")
    .insert({
      user_id: user.id,
      ...dbData,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23514") {
      return { error: "Datos inválidos: verifica tipo, dirección y categoría" };
    }
    return { error: "Error al crear la transacción" };
  }

  return { data: { id: data.id } };
}

export async function createTransferAction(_prevState: FormState, formData: FormData): Promise<FormState> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "No autorizado" };
  }

  const rawData = {
    from_account_id: formData.get("from_account_id"),
    to_account_id: formData.get("to_account_id"),
    amount: formData.get("amount"),
    currency_code: formData.get("currency_code") || "COP",
    description: formData.get("description"),
    transaction_date: formData.get("transaction_date"),
    notes: formData.get("notes") || undefined,
  };

  const parsed = createTransferSchema.safeParse(rawData);

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  if (parsed.data.from_account_id === parsed.data.to_account_id) {
    return { error: "Las cuentas de origen y destino deben ser diferentes" };
  }

  // Política de monedas (§66-67): las transferencias solo se permiten entre
  // cuentas de la misma moneda. No hay conversión automática en V1.
  const { data: transferAccounts, error: accountsError } = await supabase
    .from("accounts")
    .select("id, currency_code")
    .in("id", [parsed.data.from_account_id, parsed.data.to_account_id])
    .eq("user_id", user.id);

  if (accountsError || !transferAccounts || transferAccounts.length !== 2) {
    return { error: "No se pudieron verificar las cuentas de la transferencia" };
  }

  const fromAcc = transferAccounts.find((a) => a.id === parsed.data.from_account_id);
  const toAcc = transferAccounts.find((a) => a.id === parsed.data.to_account_id);

  if (!fromAcc || !toAcc || fromAcc.currency_code !== toAcc.currency_code) {
    return { error: "Las cuentas de origen y destino deben tener la misma moneda" };
  }

  if (parsed.data.currency_code !== fromAcc.currency_code) {
    return { error: "La moneda de la transferencia debe coincidir con la de las cuentas" };
  }

  const transferPair = createTransferPair(
    parsed.data.from_account_id,
    parsed.data.to_account_id,
    parsed.data.amount,
    parsed.data.currency_code,
    parsed.data.description,
    parsed.data.transaction_date,
    parsed.data.notes
  );

  const outflowValidation = validateTransaction(transferPair.outflow);
  if (outflowValidation) {
    return { error: outflowValidation };
  }

  const inflowValidation = validateTransaction(transferPair.inflow);
  if (inflowValidation) {
    return { error: inflowValidation };
  }

  // Convert Decimal amounts to numbers for database
  const outflowDb = {
    ...transferPair.outflow,
    amount: new Decimal(transferPair.outflow.amount).toNumber(),
  };
  const inflowDb = {
    ...transferPair.inflow,
    amount: new Decimal(transferPair.inflow.amount).toNumber(),
  };

  const { data, error } = await supabase
    .from("transactions")
    .insert([
      { user_id: user.id, ...outflowDb },
      { user_id: user.id, ...inflowDb },
    ])
    .select();

  if (error) {
    return { error: "Error al crear la transferencia" };
  }

  return { data: { outflowId: data[0].id, inflowId: data[1].id } };
}

export async function getTransactionsAction(filters?: {
  accountId?: string;
  categoryId?: string;
  type?: "INCOME" | "EXPENSE" | "TRANSFER";
  startDate?: string;
  endDate?: string;
  /** Texto a buscar en la descripción. */
  search?: string;
  limit?: number;
  offset?: number;
}) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "No autorizado" };
  }

  let query = supabase
    .from("transactions")
    .select("*, accounts(name, type, color, icon), categories(name, type, color, icon)", { count: "exact" })
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .order("transaction_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (filters?.accountId) {
    query = query.eq("account_id", filters.accountId);
  }
  if (filters?.categoryId) {
    query = query.eq("category_id", filters.categoryId);
  }
  if (filters?.type) {
    query = query.eq("type", filters.type);
  }
  if (filters?.startDate) {
    query = query.gte("transaction_date", filters.startDate);
  }
  if (filters?.endDate) {
    query = query.lte("transaction_date", filters.endDate);
  }
  if (filters?.search) {
    // Se escapan los comodines de LIKE para que el texto se busque literalmente
    const escaped = filters.search.replace(/[\\%_]/g, (c) => `\\${c}`);
    query = query.ilike("description", `%${escaped}%`);
  }
  if (filters?.offset !== undefined) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
  } else if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error, count } = await query;

  if (error) {
    return { error: "Error al obtener las transacciones" };
  }

  return { data, count };
}

export async function getTransactionByIdAction(id: string) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "No autorizado" };
  }

  const { data, error } = await supabase
    .from("transactions")
    .select("*, accounts(name, type, color, icon), categories(name, type, color, icon)")
    .eq("id", id)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .single();

  if (error) {
    return { error: "Transacción no encontrada" };
  }

  return { data };
}

export async function updateTransactionAction(_prevState: FormState, formData: FormData): Promise<FormState> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "No autorizado" };
  }

  const parsed = updateTransactionSchema.safeParse({
    id: formData.get("id"),
    account_id: formData.get("account_id") || undefined,
    category_id: formData.get("category_id") || undefined,
    amount: formData.get("amount") || undefined,
    description: formData.get("description") || undefined,
    transaction_date: formData.get("transaction_date") || undefined,
    notes: formData.has("notes") ? ((formData.get("notes") as string) || null) : undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { id, ...changes } = parsed.data;

  const { data: existing } = await supabase
    .from("transactions")
    .select("type, currency_code, transfer_group_id, account_id, category_id")
    .eq("id", id)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .single();

  if (!existing) {
    return { error: "Transacción no encontrada" };
  }

  // Contexto para validar: moneda de la cuenta destino y tipo de la categoría elegida
  const accountChanged = changes.account_id !== undefined && changes.account_id !== existing.account_id;
  const categoryChanged = changes.category_id !== undefined && changes.category_id !== existing.category_id;

  let accountCurrency: string | null = null;
  if (accountChanged) {
    const { data: account } = await supabase
      .from("accounts")
      .select("currency_code")
      .eq("id", changes.account_id!)
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .single();
    accountCurrency = account?.currency_code ?? null;
  }

  let categoryType: "INCOME" | "EXPENSE" | null = null;
  if (categoryChanged) {
    const { data: category } = await supabase
      .from("categories")
      .select("type")
      .eq("id", changes.category_id!)
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .single();
    categoryType = category?.type ?? null;
  }

  const validationError = validateTransactionEdit(
    existing,
    {
      amount: changes.amount,
      description: changes.description,
      transaction_date: changes.transaction_date,
      account_id: accountChanged ? changes.account_id : undefined,
      category_id: categoryChanged ? changes.category_id : undefined,
    },
    { accountCurrency, categoryType }
  );
  if (validationError) {
    return { error: validationError };
  }

  const updates: {
    amount?: number;
    description?: string;
    transaction_date?: string;
    account_id?: string;
    category_id?: string;
    notes?: string | null;
  } = {};
  if (changes.amount !== undefined) updates.amount = new Decimal(changes.amount).toNumber();
  if (changes.description !== undefined) updates.description = changes.description;
  if (changes.transaction_date !== undefined) updates.transaction_date = changes.transaction_date;
  if (accountChanged) updates.account_id = changes.account_id!;
  if (categoryChanged) updates.category_id = changes.category_id!;
  if (changes.notes !== undefined) updates.notes = changes.notes;

  if (Object.keys(updates).length === 0) {
    return { error: "No hay cambios para actualizar" };
  }

  const { data, error } = await supabase
    .from("transactions")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .select("id")
    .single();

  if (error || !data) {
    if (error?.code === "23514") {
      return { error: "Datos inválidos: verifica tipo, dirección y categoría" };
    }
    return { error: "Error al actualizar la transacción" };
  }

  return { data: { id: data.id } };
}

/**
 * Elimina (borrado lógico) un movimiento. Una transferencia se elimina completa:
 * ambas patas, para no dejar saldos descuadrados.
 */
export async function deleteTransactionAction(transactionId: string) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "No autorizado" };
  }

  const { data: existing } = await supabase
    .from("transactions")
    .select("type, transfer_group_id")
    .eq("id", transactionId)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .single();

  if (!existing) {
    return { error: "Transacción no encontrada" };
  }

  let query = supabase
    .from("transactions")
    .update({ deleted_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .is("deleted_at", null);

  query =
    getDeleteScope(existing) === "TRANSFER_PAIR"
      ? query.eq("transfer_group_id", existing.transfer_group_id!)
      : query.eq("id", transactionId);

  const { error } = await query;

  if (error) {
    return { error: "Error al eliminar la transacción" };
  }

  return { success: true };
}
