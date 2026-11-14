"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { todayInTimezone } from "@/domain/dates";
import {
  getDueOccurrences,
  getFirstOccurrenceOnOrAfter,
  type RecurrenceFrequency,
} from "@/domain/recurrence";
import { detectRecurrences, normalizeDescription, type RecurrenceSuggestion } from "@/domain/recurrence-detection";
import { z } from "zod";

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido (YYYY-MM-DD)");

const createRecurringSchema = z
  .object({
    name: z.string().trim().min(1, "El nombre es requerido").max(100),
    type: z.enum(["INCOME", "EXPENSE"]),
    amount: z.coerce.number().positive("El monto debe ser mayor a 0"),
    account_id: z.string().uuid("Selecciona una cuenta"),
    category_id: z.string().uuid("Selecciona una categoría"),
    frequency: z.enum(["WEEKLY", "MONTHLY", "QUARTERLY", "YEARLY", "CUSTOM"]),
    custom_interval_days: z.coerce.number().int().positive("Debe ser mayor a 0").optional(),
    start_date: dateSchema,
    is_automatic: z.boolean().default(false),
  })
  .refine((v) => v.frequency !== "CUSTOM" || v.custom_interval_days !== undefined, {
    path: ["custom_interval_days"],
    message: "Indica cada cuántos días se repite",
  });

type FormState =
  | { error: string }
  | { error: Record<string, string[]> }
  | { data: { id: string } }
  | { error?: undefined; data?: undefined };

type Supabase = Awaited<ReturnType<typeof createSupabaseServerClient>>;

export interface RecurringRow {
  id: string;
  name: string;
  type: "INCOME" | "EXPENSE";
  amount: string;
  currency_code: string;
  account_name: string;
  category_name: string;
  frequency: RecurrenceFrequency;
  custom_interval_days: number | null;
  next_execution_date: string;
  is_automatic: boolean;
  status: "ACTIVE" | "PAUSED" | "CANCELLED";
  dueCount: number;
}

export interface RegisterResult {
  registered: number;
  skipped: number;
  error?: string;
}

async function getUser(supabase: Supabase) {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  return error || !user ? null : user;
}

async function getTimezone(supabase: Supabase, userId: string): Promise<string> {
  const { data } = await supabase.from("profiles").select("timezone").eq("id", userId).single();
  return data?.timezone || "America/Bogota";
}

export async function createRecurringAction(_prevState: FormState, formData: FormData): Promise<FormState> {
  const supabase = await createSupabaseServerClient();
  const user = await getUser(supabase);
  if (!user) return { error: "No autorizado" };

  const parsed = createRecurringSchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    amount: formData.get("amount"),
    account_id: formData.get("account_id"),
    category_id: formData.get("category_id"),
    frequency: formData.get("frequency"),
    custom_interval_days: formData.get("custom_interval_days") || undefined,
    start_date: formData.get("start_date"),
    is_automatic: formData.get("is_automatic") === "on",
  });
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  // La moneda de la recurrencia es la de su cuenta (una transacción debe coincidir con su cuenta)
  const { data: account } = await supabase
    .from("accounts")
    .select("currency_code")
    .eq("id", parsed.data.account_id)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .single();
  if (!account) return { error: "Cuenta no encontrada" };

  const { data, error } = await supabase
    .from("recurring_transactions")
    .insert({
      user_id: user.id,
      ...parsed.data,
      custom_interval_days: parsed.data.frequency === "CUSTOM" ? parsed.data.custom_interval_days : null,
      currency_code: account.currency_code,
      next_execution_date: parsed.data.start_date,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23514" || error.code === "23503") {
      return { error: "La categoría debe ser del mismo tipo (ingreso/gasto) y tuya" };
    }
    return { error: "Error al crear el movimiento recurrente" };
  }
  return { data: { id: data.id } };
}

export async function setRecurringStatusAction(id: string, status: "ACTIVE" | "PAUSED" | "CANCELLED") {
  const supabase = await createSupabaseServerClient();
  const user = await getUser(supabase);
  if (!user) return { error: "No autorizado" };

  const update: { status: typeof status; next_execution_date?: string } = { status };

  if (status === "ACTIVE") {
    // Al reanudar no se registran de golpe las fechas perdidas durante la pausa
    const { data: rec } = await supabase
      .from("recurring_transactions")
      .select("frequency, custom_interval_days, start_date, next_execution_date")
      .eq("id", id)
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .single();
    if (!rec) return { error: "No encontrado" };
    const today = todayInTimezone(await getTimezone(supabase, user.id));
    const resumed = getFirstOccurrenceOnOrAfter(rec, today);
    if (resumed > rec.next_execution_date) update.next_execution_date = resumed;
  }

  const { error } = await supabase
    .from("recurring_transactions")
    .update(update)
    .eq("id", id)
    .eq("user_id", user.id)
    .is("deleted_at", null);

  if (error) return { error: "Error al actualizar" };
  return { success: true };
}

export async function deleteRecurringAction(id: string) {
  const supabase = await createSupabaseServerClient();
  const user = await getUser(supabase);
  if (!user) return { error: "No autorizado" };

  const { error } = await supabase
    .from("recurring_transactions")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id)
    .is("deleted_at", null);

  if (error) return { error: "Error al eliminar" };
  return { success: true };
}

export async function getRecurringAction(): Promise<{ data: RecurringRow[] } | { error: string }> {
  const supabase = await createSupabaseServerClient();
  const user = await getUser(supabase);
  if (!user) return { error: "No autorizado" };

  const { data, error } = await supabase
    .from("recurring_transactions")
    .select(
      "id, name, type, amount, currency_code, frequency, custom_interval_days, start_date, next_execution_date, is_automatic, status, accounts!inner(name), categories!inner(name)"
    )
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .order("next_execution_date", { ascending: true });

  if (error) return { error: "Error al obtener los movimientos recurrentes" };

  const today = todayInTimezone(await getTimezone(supabase, user.id));
  const one = <T,>(v: T | T[]): T => (Array.isArray(v) ? v[0] : v);

  return {
    data: (data ?? []).map((r) => ({
      id: r.id,
      name: r.name,
      type: r.type,
      amount: String(r.amount),
      currency_code: r.currency_code,
      account_name: one(r.accounts)?.name ?? "",
      category_name: one(r.categories)?.name ?? "",
      frequency: r.frequency,
      custom_interval_days: r.custom_interval_days,
      next_execution_date: r.next_execution_date,
      is_automatic: r.is_automatic,
      status: r.status,
      dueCount:
        r.status === "ACTIVE"
          ? getDueOccurrences(
              {
                frequency: r.frequency,
                custom_interval_days: r.custom_interval_days,
                start_date: r.start_date,
                next_execution_date: r.next_execution_date,
              },
              today
            ).dates.length
          : 0,
    })),
  };
}

/**
 * Registra como movimientos las ocurrencias vencidas de las recurrencias activas
 * (todas, una concreta, o solo las automáticas). Es idempotente: el índice
 * único (recurrencia, fecha) en `transactions` impide duplicados y un conflicto
 * se cuenta como ya registrado. No ejecuta pagos externos.
 */
export async function registerDueOccurrencesAction(
  options: { recurringId?: string; onlyAutomatic?: boolean } = {}
): Promise<RegisterResult> {
  const supabase = await createSupabaseServerClient();
  const user = await getUser(supabase);
  if (!user) return { registered: 0, skipped: 0, error: "No autorizado" };

  let query = supabase
    .from("recurring_transactions")
    .select("id, name, type, amount, currency_code, account_id, category_id, frequency, custom_interval_days, start_date, next_execution_date")
    .eq("user_id", user.id)
    .eq("status", "ACTIVE")
    .is("deleted_at", null);
  if (options.recurringId) query = query.eq("id", options.recurringId);
  if (options.onlyAutomatic) query = query.eq("is_automatic", true);

  const { data: recurrences, error } = await query;
  if (error) return { registered: 0, skipped: 0, error: "Error al leer las recurrencias" };

  const today = todayInTimezone(await getTimezone(supabase, user.id));
  let registered = 0;
  let skipped = 0;

  for (const rec of recurrences ?? []) {
    const due = getDueOccurrences(rec, today);
    if (due.dates.length === 0) continue;

    let handled = 0;
    for (const date of due.dates) {
      const { error: insertError } = await supabase.from("transactions").insert({
        user_id: user.id,
        account_id: rec.account_id,
        category_id: rec.category_id,
        type: rec.type,
        direction: rec.type === "INCOME" ? "INFLOW" : "OUTFLOW",
        amount: rec.amount,
        currency_code: rec.currency_code,
        description: rec.name,
        transaction_date: date,
        recurring_transaction_id: rec.id,
      });

      if (insertError?.code === "23505") {
        skipped++; // ya estaba registrada (reintento)
      } else if (insertError) {
        // Se detiene sin avanzar más allá de lo ya registrado: el reintento retoma desde aquí
        break;
      } else {
        registered++;
      }
      handled++;
    }

    const next = handled === due.dates.length ? due.nextExecutionDate : due.dates[handled];
    if (next !== rec.next_execution_date) {
      await supabase
        .from("recurring_transactions")
        .update({ next_execution_date: next })
        .eq("id", rec.id)
        .eq("user_id", user.id);
    }

    if (handled < due.dates.length) {
      return { registered, skipped, error: `No se pudieron registrar todas las ocurrencias de «${rec.name}»` };
    }
  }

  return { registered, skipped };
}

export interface SuggestionRow {
  key: string;
  type: "INCOME" | "EXPENSE";
  description: string;
  amount: string;
  currency_code: string;
  category_id: string;
  category_name: string;
  account_id: string;
  account_name: string;
  frequency: RecurrenceSuggestion["frequency"];
  occurrences: number;
  lastDate: string;
  nextDate: string;
  confidence: "MEDIUM" | "HIGH";
}

/** Meses de historial que se analizan para detectar recurrencias. */
const DETECTION_LOOKBACK_MONTHS = 13;

/**
 * Sugerencias de movimientos recurrentes detectados en el historial (UC-30).
 * Solo lee: no crea nada; el usuario las confirma desde el formulario (UC-31).
 */
export async function getRecurrenceSuggestionsAction(): Promise<{ data: SuggestionRow[] } | { error: string }> {
  const supabase = await createSupabaseServerClient();
  const user = await getUser(supabase);
  if (!user) return { error: "No autorizado" };

  const today = todayInTimezone(await getTimezone(supabase, user.id));
  const since = new Date(`${today}T00:00:00Z`);
  since.setUTCMonth(since.getUTCMonth() - DETECTION_LOOKBACK_MONTHS);

  const [{ data: transactions, error }, { data: existing }] = await Promise.all([
    supabase
      .from("transactions")
      .select("id, type, description, amount, currency_code, category_id, account_id, transaction_date, recurring_transaction_id, accounts(name), categories(name)")
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .neq("type", "TRANSFER")
      .gte("transaction_date", since.toISOString().slice(0, 10)),
    supabase
      .from("recurring_transactions")
      .select("name, type")
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .neq("status", "CANCELLED"),
  ]);

  if (error) return { error: "Error al analizar los movimientos" };

  const one = <T,>(v: T | T[] | null): T | null => (Array.isArray(v) ? (v[0] ?? null) : v);
  const names = new Map<string, { account: string; category: string }>();
  for (const t of transactions ?? []) {
    names.set(`a:${t.account_id}`, { account: one(t.accounts)?.name ?? "", category: "" });
    if (t.category_id) names.set(`c:${t.category_id}`, { account: "", category: one(t.categories)?.name ?? "" });
  }

  const suggestions = detectRecurrences(
    (transactions ?? []).map((t) => ({ ...t, amount: String(t.amount) })),
    today,
    (existing ?? []).map((r) => `${r.type.toLowerCase()}|${normalizeDescription(r.name)}`)
  );

  return {
    data: suggestions.map((s) => ({
      key: s.key,
      type: s.type,
      description: s.description,
      amount: s.amount.toString(),
      currency_code: s.currency_code,
      category_id: s.category_id,
      category_name: names.get(`c:${s.category_id}`)?.category ?? "",
      account_id: s.account_id,
      account_name: names.get(`a:${s.account_id}`)?.account ?? "",
      frequency: s.frequency,
      occurrences: s.occurrences,
      lastDate: s.lastDate,
      nextDate: s.nextDate,
      confidence: s.confidence,
    })),
  };
}
