"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { z } from "zod";
import { Decimal } from "decimal.js";
import { validateTransaction, createTransferPair } from "@/domain/transactions";

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

const updateTransactionSchema = z.object({
  id: z.string().uuid(),
  account_id: z.string().uuid().optional(),
  category_id: z.string().uuid().optional().nullable(),
  type: transactionTypeSchema.optional(),
  direction: transactionDirectionSchema.optional(),
  amount: z.string().refine((val) => parseFloat(val) > 0, "El monto debe ser mayor a 0").optional(),
  currency_code: z.string().length(3).optional(),
  description: z.string().trim().min(1).max(200).optional(),
  transaction_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  notes: z.string().optional().nullable(),
  transfer_group_id: z.string().uuid().optional().nullable(),
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
    .select("*, accounts(name, type, color, icon), categories(name, type, color, icon)")
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
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }
  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
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

  const rawData = {
    id: formData.get("id"),
    account_id: formData.get("account_id") || undefined,
    category_id: formData.get("category_id") || undefined,
    type: formData.get("type") || undefined,
    direction: formData.get("direction") || undefined,
    amount: formData.get("amount") || undefined,
    currency_code: formData.get("currency_code") || undefined,
    description: formData.get("description") || undefined,
    transaction_date: formData.get("transaction_date") || undefined,
    notes: formData.get("notes") || undefined,
    transfer_group_id: formData.get("transfer_group_id") || undefined,
  };

  const parsed = updateTransactionSchema.safeParse(rawData);

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { id, ...updates } = parsed.data;

  const cleanUpdates: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(updates)) {
    if (value !== undefined) {
      if (key === "amount") {
        cleanUpdates[key] = new Decimal(value as string).toNumber();
      } else {
        cleanUpdates[key] = value;
      }
    }
  }

  if (Object.keys(cleanUpdates).length === 0) {
    return { error: "No hay cambios para actualizar" };
  }

  const { data, error } = await supabase
    .from("transactions")
    // @ts-expect-error Supabase generated types are too strict for dynamic updates
    .update(cleanUpdates)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    if (error.code === "23514") {
      return { error: "Datos inválidos: verifica tipo, dirección y categoría" };
    }
    return { error: "Error al actualizar la transacción" };
  }

  return { data: { id: data.id } };
}

export async function deleteTransactionAction(transactionId: string) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "No autorizado" };
  }

  const { error } = await supabase
    .from("transactions")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", transactionId)
    .eq("user_id", user.id);

  if (error) {
    return { error: "Error al eliminar la transacción" };
  }

  return { success: true };
}