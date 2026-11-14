"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { todayInTimezone } from "@/domain/dates";
import { getOccurrenceDate, type RecurrenceFrequency } from "@/domain/recurrence";
import { annualCost, daysBetween, getNextRenewal, monthlyEquivalent, summarizeSubscriptions } from "@/domain/subscriptions";
import { z } from "zod";

const createSubscriptionSchema = z
  .object({
    name: z.string().trim().min(1, "El nombre es requerido").max(100),
    amount: z.coerce.number().positive("El monto debe ser mayor a 0"),
    frequency: z.enum(["WEEKLY", "MONTHLY", "QUARTERLY", "YEARLY", "CUSTOM"]),
    custom_interval_days: z.coerce.number().int().positive("Debe ser mayor a 0").optional(),
    next_payment_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido (YYYY-MM-DD)"),
    category_id: z.string().uuid().optional(),
  })
  .refine((v) => v.frequency !== "CUSTOM" || v.custom_interval_days !== undefined, {
    path: ["custom_interval_days"],
    message: "Indica cada cuántos días se cobra",
  });

type FormState =
  | { error: string }
  | { error: Record<string, string[]> }
  | { data: { id: string } }
  | { error?: undefined; data?: undefined };

type Supabase = Awaited<ReturnType<typeof createSupabaseServerClient>>;

export interface SubscriptionRow {
  id: string;
  name: string;
  amount: string;
  currency_code: string;
  frequency: RecurrenceFrequency;
  custom_interval_days: number | null;
  next_payment_date: string;
  nextRenewal: string;
  daysUntil: number;
  monthly: string;
  annual: string;
  status: "ACTIVE" | "PAUSED" | "CANCELLED";
}

async function getUser(supabase: Supabase) {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  return error || !user ? null : user;
}

export async function createSubscriptionAction(_prevState: FormState, formData: FormData): Promise<FormState> {
  const supabase = await createSupabaseServerClient();
  const user = await getUser(supabase);
  if (!user) return { error: "No autorizado" };

  const parsed = createSubscriptionSchema.safeParse({
    name: formData.get("name"),
    amount: formData.get("amount"),
    frequency: formData.get("frequency"),
    custom_interval_days: formData.get("custom_interval_days") || undefined,
    next_payment_date: formData.get("next_payment_date"),
    category_id: formData.get("category_id") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const { data: profile } = await supabase.from("profiles").select("currency_code").eq("id", user.id).single();

  const { data, error } = await supabase
    .from("subscriptions")
    .insert({
      user_id: user.id,
      ...parsed.data,
      custom_interval_days: parsed.data.frequency === "CUSTOM" ? parsed.data.custom_interval_days : null,
      currency_code: profile?.currency_code ?? "COP",
    })
    .select("id")
    .single();

  if (error) return { error: "Error al crear la suscripción" };
  return { data: { id: data.id } };
}

export async function setSubscriptionStatusAction(id: string, status: "ACTIVE" | "PAUSED" | "CANCELLED") {
  const supabase = await createSupabaseServerClient();
  const user = await getUser(supabase);
  if (!user) return { error: "No autorizado" };

  const { error } = await supabase
    .from("subscriptions")
    .update({ status })
    .eq("id", id)
    .eq("user_id", user.id)
    .is("deleted_at", null);

  if (error) return { error: "Error al actualizar" };
  return { success: true };
}

export async function deleteSubscriptionAction(id: string) {
  const supabase = await createSupabaseServerClient();
  const user = await getUser(supabase);
  if (!user) return { error: "No autorizado" };

  const { error } = await supabase
    .from("subscriptions")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id)
    .is("deleted_at", null);

  if (error) return { error: "Error al eliminar" };
  return { success: true };
}

/** Marca el cobro vigente como pagado y avanza `next_payment_date` un período. */
export async function markSubscriptionPaidAction(id: string) {
  const supabase = await createSupabaseServerClient();
  const user = await getUser(supabase);
  if (!user) return { error: "No autorizado" };

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("frequency, custom_interval_days, next_payment_date")
    .eq("id", id)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .single();
  if (!sub) return { error: "No encontrada" };

  const next = getOccurrenceDate(
    { frequency: sub.frequency, custom_interval_days: sub.custom_interval_days, start_date: sub.next_payment_date },
    1
  );

  const { error } = await supabase
    .from("subscriptions")
    .update({ next_payment_date: next })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: "Error al actualizar" };
  return { success: true };
}

export async function getSubscriptionsAction(): Promise<
  | { data: { subscriptions: SubscriptionRow[]; totals: { monthly: string; annual: string; count: number }; currencyCode: string } }
  | { error: string }
> {
  const supabase = await createSupabaseServerClient();
  const user = await getUser(supabase);
  if (!user) return { error: "No autorizado" };

  const [{ data, error }, { data: profile }] = await Promise.all([
    supabase
      .from("subscriptions")
      .select("id, name, amount, currency_code, frequency, custom_interval_days, next_payment_date, status")
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .order("next_payment_date", { ascending: true }),
    supabase.from("profiles").select("currency_code, timezone").eq("id", user.id).single(),
  ]);

  if (error) return { error: "Error al obtener las suscripciones" };

  const today = todayInTimezone(profile?.timezone || "America/Bogota");
  const currencyCode = profile?.currency_code || "COP";

  const subscriptions: SubscriptionRow[] = (data ?? []).map((s) => {
    const nextRenewal = getNextRenewal(s, today);
    return {
      id: s.id,
      name: s.name,
      amount: String(s.amount),
      currency_code: s.currency_code,
      frequency: s.frequency,
      custom_interval_days: s.custom_interval_days,
      next_payment_date: s.next_payment_date,
      nextRenewal,
      daysUntil: daysBetween(today, nextRenewal),
      monthly: monthlyEquivalent(s).toDecimalPlaces(2).toString(),
      annual: annualCost(s).toDecimalPlaces(2).toString(),
      status: s.status,
    };
  });

  const totals = summarizeSubscriptions(
    (data ?? []).map((s) => ({ ...s, amount: String(s.amount) })),
    currencyCode
  );

  return {
    data: {
      subscriptions,
      totals: { monthly: totals.monthly.toDecimalPlaces(2).toString(), annual: totals.annual.toDecimalPlaces(2).toString(), count: totals.count },
      currencyCode,
    },
  };
}
