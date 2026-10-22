"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { toDomainTransactions } from "@/lib/supabase/transactions";
import type { Database } from "@/lib/supabase/types";
import { calculateAccountBalance } from "@/domain/transactions";
import { Decimal } from "decimal.js";
import { z } from "zod";

const accountTypeSchema = z.enum(["CASH", "CHECKING", "SAVINGS", "CREDIT_CARD", "DIGITAL_WALLET", "OTHER"]);

const createAccountSchema = z.object({
  name: z.string().trim().min(1, "El nombre es requerido").max(50),
  type: accountTypeSchema,
  opening_balance: z.coerce.number().min(0, "El saldo inicial no puede ser negativo").default(0),
  currency_code: z.string().length(3).default("COP"),
  color: z.string().optional(),
  icon: z.string().optional(),
  credit_limit: z.coerce.number().positive().optional(),
  payment_due_day: z.coerce.number().int().min(1).max(31).optional(),
  statement_closing_day: z.coerce.number().int().min(1).max(31).optional(),
});

const updateAccountSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1, "El nombre es requerido").max(50).optional(),
  type: accountTypeSchema.optional(),
  opening_balance: z.coerce.number().min(0).optional(),
  currency_code: z.string().length(3).optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
  credit_limit: z.coerce.number().positive().optional().nullable(),
  payment_due_day: z.coerce.number().int().min(1).max(31).optional().nullable(),
  statement_closing_day: z.coerce.number().int().min(1).max(31).optional().nullable(),
  is_archived: z.boolean().optional(),
});

type CreateAccountInput = z.infer<typeof createAccountSchema>;
type UpdateAccountInput = z.infer<typeof updateAccountSchema>;

type AccountRow = Database["public"]["Tables"]["accounts"]["Row"];

/** Cuenta con su saldo actual calculado (estrategia B). */
export interface AccountWithBalance extends AccountRow {
  current_balance: Decimal;
}

type FormState =
  | { error: string }
  | { error: Record<string, string[]> }
  | { data: { id: string } }
  | { error?: undefined; data?: undefined };

export async function createAccountAction(_prevState: FormState, formData: FormData): Promise<FormState> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "No autorizado" };
  }

  const rawData = {
    name: formData.get("name"),
    type: formData.get("type"),
    opening_balance: formData.get("opening_balance") || 0,
    currency_code: formData.get("currency_code") || "COP",
    color: formData.get("color") || undefined,
    icon: formData.get("icon") || undefined,
    credit_limit: formData.get("credit_limit") || undefined,
    payment_due_day: formData.get("payment_due_day") || undefined,
    statement_closing_day: formData.get("statement_closing_day") || undefined,
  };

  const parsed = createAccountSchema.safeParse(rawData);

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { name, type, opening_balance, currency_code, color, icon, credit_limit, payment_due_day, statement_closing_day } = parsed.data;

  if (type !== "CREDIT_CARD" && (credit_limit || payment_due_day || statement_closing_day)) {
    return { error: "Los campos de tarjeta de crédito solo aplican para cuentas tipo CREDIT_CARD" };
  }

  const { data, error } = await supabase
    .from("accounts")
    .insert({
      user_id: user.id,
      name,
      type,
      opening_balance,
      currency_code,
      color,
      icon,
      credit_limit: type === "CREDIT_CARD" ? credit_limit : null,
      payment_due_day: type === "CREDIT_CARD" ? payment_due_day : null,
      statement_closing_day: type === "CREDIT_CARD" ? statement_closing_day : null,
    })
    .select()
    .single();

  if (error) {
    return { error: "Error al crear la cuenta" };
  }

  // Estrategia B: el saldo inicial es un atributo de la cuenta (`opening_balance`).
  // NO se registra ninguna transacción compensatoria: el saldo inicial ya está
  // guardado en la cuenta y una transacción de ingreso lo contabilizaría dos
  // veces (además la base la rechaza por `transactions_income_rules`).
  return { data: { id: data.id } };
}

export async function getAccountsAction() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "No autorizado" };
  }

  const { data, error } = await supabase
    .from("accounts")
    .select("*")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    return { error: "Error al obtener las cuentas" };
  }

  return { data };
}

/**
 * Cuentas del usuario con su **saldo actual** calculado:
 *
 *   saldo actual = opening_balance + entradas − salidas
 *
 * El saldo inicial se toma de la propia cuenta (`opening_balance`), nunca de
 * una transacción compensatoria, de modo que se contabiliza exactamente una vez.
 */
export async function getAccountsWithBalancesAction(): Promise<
  | { data: AccountWithBalance[] }
  | { error: string }
> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "No autorizado" };
  }

  const { data: accounts, error: accountsError } = await supabase
    .from("accounts")
    .select("*")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (accountsError) {
    return { error: "Error al obtener las cuentas" };
  }

  const { data: transactions, error: transactionsError } = await supabase
    .from("transactions")
    .select("id, account_id, type, direction, amount, currency_code, deleted_at")
    .eq("user_id", user.id);

  if (transactionsError) {
    return { error: "Error al obtener las transacciones" };
  }

  const typedTransactions = toDomainTransactions(transactions ?? [], user.id);

  const data: AccountWithBalance[] = (accounts ?? []).map((account) => ({
    ...account,
    current_balance: calculateAccountBalance(
      typedTransactions,
      account.id,
      account.opening_balance
    ),
  }));

  return { data };
}

export async function updateAccountAction(_prevState: FormState, formData: FormData): Promise<FormState> {
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
    name: formData.get("name"),
    type: formData.get("type"),
    opening_balance: formData.get("opening_balance"),
    currency_code: formData.get("currency_code"),
    color: formData.get("color"),
    icon: formData.get("icon"),
    credit_limit: formData.get("credit_limit"),
    payment_due_day: formData.get("payment_due_day"),
    statement_closing_day: formData.get("statement_closing_day"),
    is_archived: formData.get("is_archived"),
  };

  const parsed = updateAccountSchema.safeParse(rawData);

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { id, ...updates } = parsed.data;

  if (updates.type !== "CREDIT_CARD" && (updates.credit_limit || updates.payment_due_day || updates.statement_closing_day)) {
    return { error: "Los campos de tarjeta de crédito solo aplican para cuentas tipo CREDIT_CARD" };
  }

  const cleanUpdates: Partial<UpdateAccountInput> = {};
  for (const [key, value] of Object.entries(updates)) {
    if (value !== undefined) {
      (cleanUpdates as Record<string, unknown>)[key] = value;
    }
  }

  if (cleanUpdates.type === "CREDIT_CARD") {
    cleanUpdates.credit_limit = cleanUpdates.credit_limit ?? null;
    cleanUpdates.payment_due_day = cleanUpdates.payment_due_day ?? null;
    cleanUpdates.statement_closing_day = cleanUpdates.statement_closing_day ?? null;
  } else {
    cleanUpdates.credit_limit = null;
    cleanUpdates.payment_due_day = null;
    cleanUpdates.statement_closing_day = null;
  }

  const { data, error } = await supabase
    .from("accounts")
    .update(cleanUpdates)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    return { error: "Error al actualizar la cuenta" };
  }

  return { data: { id: data.id } };
}

export async function archiveAccountAction(accountId: string) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "No autorizado" };
  }

  const { error } = await supabase
    .from("accounts")
    .update({ is_archived: true, deleted_at: new Date().toISOString() })
    .eq("id", accountId)
    .eq("user_id", user.id);

  if (error) {
    return { error: "Error al archivar la cuenta" };
  }

  return { success: true };
}