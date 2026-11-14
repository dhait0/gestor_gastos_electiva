"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { toDomainTransactions } from "@/lib/supabase/transactions";
import { calculateBudgetUsage, getBudgetMonthRange, type BudgetUsage } from "@/domain/budgets";
import { getCurrentMonthRange } from "@/domain/transactions";
import { z } from "zod";

const monthSchema = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Mes inválido (YYYY-MM)");

const createBudgetSchema = z.object({
  category_id: z.string().uuid("Selecciona una categoría"),
  month: monthSchema,
  limit_amount: z.coerce.number().positive("El límite debe ser mayor a 0"),
});

const updateBudgetSchema = z.object({
  id: z.string().uuid(),
  limit_amount: z.coerce.number().positive("El límite debe ser mayor a 0"),
});

type FormState =
  | { error: string }
  | { error: Record<string, string[]> }
  | { data: { id: string } }
  | { error?: undefined; data?: undefined };

export interface BudgetWithUsage {
  id: string;
  category_id: string;
  category_name: string;
  category_color: string | null;
  period_month: string;
  limit_amount: string;
  currency_code: string;
  usage: BudgetUsage;
}

/** Normaliza un mes `YYYY-MM` al primer día (YYYY-MM-01). */
function toPeriodMonth(month: string): string {
  return `${month}-01`;
}

export async function createBudgetAction(_prevState: FormState, formData: FormData): Promise<FormState> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "No autorizado" };
  }

  const parsed = createBudgetSchema.safeParse({
    category_id: formData.get("category_id"),
    month: formData.get("month"),
    limit_amount: formData.get("limit_amount"),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("currency_code")
    .eq("id", user.id)
    .single();

  const { data, error } = await supabase
    .from("budgets")
    .insert({
      user_id: user.id,
      category_id: parsed.data.category_id,
      period_month: toPeriodMonth(parsed.data.month),
      limit_amount: parsed.data.limit_amount,
      currency_code: profile?.currency_code ?? "COP",
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return { error: "Ya existe un presupuesto para esa categoría en ese mes" };
    }
    if (error.code === "23514" || error.code === "23503") {
      return { error: "La categoría debe ser una categoría de gasto tuya" };
    }
    return { error: "Error al crear el presupuesto" };
  }

  return { data: { id: data.id } };
}

export async function updateBudgetAction(_prevState: FormState, formData: FormData): Promise<FormState> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "No autorizado" };
  }

  const parsed = updateBudgetSchema.safeParse({
    id: formData.get("id"),
    limit_amount: formData.get("limit_amount"),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { data, error } = await supabase
    .from("budgets")
    .update({ limit_amount: parsed.data.limit_amount })
    .eq("id", parsed.data.id)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .select("id")
    .single();

  if (error || !data) {
    return { error: "Error al actualizar el presupuesto" };
  }

  return { data: { id: data.id } };
}

export async function deleteBudgetAction(budgetId: string) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "No autorizado" };
  }

  const { error } = await supabase
    .from("budgets")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", budgetId)
    .eq("user_id", user.id)
    .is("deleted_at", null);

  if (error) {
    return { error: "Error al eliminar el presupuesto" };
  }

  return { success: true };
}

/**
 * Presupuestos del mes (`YYYY-MM`, por defecto el actual según la zona horaria
 * del perfil) con su consumo derivado de las transacciones.
 */
export async function getBudgetsWithUsageAction(month?: string): Promise<
  | { data: { month: string; budgets: BudgetWithUsage[] } }
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

  if (month !== undefined && !monthSchema.safeParse(month).success) {
    return { error: "Mes inválido" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("timezone")
    .eq("id", user.id)
    .single();

  const resolvedMonth = month ?? getCurrentMonthRange(profile?.timezone || "America/Bogota").start.slice(0, 7);
  const periodMonth = toPeriodMonth(resolvedMonth);
  const range = getBudgetMonthRange(periodMonth);

  const { data: budgets, error: budgetsError } = await supabase
    .from("budgets")
    .select("id, category_id, period_month, limit_amount, currency_code, categories!inner(name, color)")
    .eq("user_id", user.id)
    .eq("period_month", periodMonth)
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  if (budgetsError) {
    return { error: "Error al obtener los presupuestos" };
  }

  const { data: transactions, error: transactionsError } = await supabase
    .from("transactions")
    .select("id, account_id, category_id, type, direction, amount, currency_code, transaction_date, deleted_at")
    .eq("user_id", user.id)
    .eq("type", "EXPENSE")
    .gte("transaction_date", range.start)
    .lte("transaction_date", range.end);

  if (transactionsError) {
    return { error: "Error al obtener los gastos" };
  }

  const domainTransactions = toDomainTransactions(transactions ?? [], user.id);

  const result: BudgetWithUsage[] = (budgets ?? []).map((b) => {
    const category = Array.isArray(b.categories) ? b.categories[0] : b.categories;
    return {
      id: b.id,
      category_id: b.category_id,
      category_name: category?.name ?? "Categoría",
      category_color: category?.color ?? null,
      period_month: b.period_month,
      limit_amount: String(b.limit_amount),
      currency_code: b.currency_code,
      usage: calculateBudgetUsage(domainTransactions, {
        category_id: b.category_id,
        period_month: b.period_month,
        limit_amount: String(b.limit_amount),
        currency_code: b.currency_code,
      }),
    };
  });

  return { data: { month: resolvedMonth, budgets: result } };
}
