"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { todayInTimezone } from "@/domain/dates";
import { generateAlerts, type AlertSeverity } from "@/domain/alerts";
import { getBudgetsWithUsageAction } from "@/app/actions/budgets";
import { getFinancialSummaryAction } from "@/app/actions/financial";
import { getGoalsWithProgressAction } from "@/app/actions/goals";

type Supabase = Awaited<ReturnType<typeof createSupabaseServerClient>>;

export interface AlertRow {
  id: string;
  type: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  is_read: boolean;
  created_at: string;
}

async function getUser(supabase: Supabase) {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  return error || !user ? null : user;
}

/**
 * Evalúa las reglas de alertas con el estado actual del usuario y guarda solo
 * las nuevas (deduplicación por `dedup_key`). No envía nada fuera de la app.
 */
export async function refreshAlertsAction(): Promise<{ created: number; error?: string }> {
  const supabase = await createSupabaseServerClient();
  const user = await getUser(supabase);
  if (!user) return { created: 0, error: "No autorizado" };

  const [summary, budgets, goals, { data: obligations }, { data: profile }] = await Promise.all([
    getFinancialSummaryAction(),
    getBudgetsWithUsageAction(),
    getGoalsWithProgressAction(),
    supabase
      .from("obligations")
      .select("id, name, due_date, status")
      .eq("user_id", user.id)
      .eq("status", "PENDING")
      .is("deleted_at", null),
    supabase.from("profiles").select("timezone").eq("id", user.id).single(),
  ]);

  if ("error" in summary) return { created: 0, error: summary.error };

  const drafts = generateAlerts({
    today: todayInTimezone(profile?.timezone || "America/Bogota"),
    currencyCode: summary.data.currencyCode,
    liquidBalance: summary.data.liquidBalance,
    availableToSpend: summary.data.availableToSpend,
    budgets:
      "data" in budgets
        ? budgets.data.budgets.map((b) => ({
            id: b.id,
            categoryName: b.category_name,
            percent: b.usage.percent,
            status: b.usage.status,
            period_month: b.period_month,
          }))
        : [],
    obligations: obligations ?? [],
    goals:
      "data" in goals
        ? goals.data.map((g) => ({
            id: g.id,
            name: g.name,
            status: g.status,
            percent: g.progress.percent,
            isOverdue: g.progress.isOverdue,
            monthsRemaining: g.progress.monthsRemaining,
          }))
        : [],
  });

  if (drafts.length === 0) return { created: 0 };

  const { data: inserted, error } = await supabase
    .from("alerts")
    .upsert(
      drafts.map((d) => ({
        user_id: user.id,
        type: d.type,
        title: d.title,
        message: d.message,
        severity: d.severity,
        dedup_key: d.dedupKey,
        metadata: d.metadata,
      })),
      { onConflict: "user_id,dedup_key", ignoreDuplicates: true }
    )
    .select("id");

  if (error) return { created: 0, error: "Error al guardar las alertas" };
  return { created: inserted?.length ?? 0 };
}

export async function getAlertsAction(limit = 50): Promise<
  { data: { alerts: AlertRow[]; unread: number } } | { error: string }
> {
  const supabase = await createSupabaseServerClient();
  const user = await getUser(supabase);
  if (!user) return { error: "No autorizado" };

  const { data, error } = await supabase
    .from("alerts")
    .select("id, type, title, message, severity, is_read, created_at, expires_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return { error: "Error al obtener las alertas" };

  const now = Date.now();
  const alerts = (data ?? []).filter((a) => !a.expires_at || new Date(a.expires_at).getTime() > now);

  return {
    data: {
      alerts: alerts.map((a) => ({
        id: a.id,
        type: a.type,
        title: a.title,
        message: a.message,
        severity: a.severity,
        is_read: a.is_read,
        created_at: a.created_at,
      })),
      unread: alerts.filter((a) => !a.is_read).length,
    },
  };
}

export async function getUnreadAlertCountAction(): Promise<number> {
  const supabase = await createSupabaseServerClient();
  const user = await getUser(supabase);
  if (!user) return 0;

  const { count } = await supabase
    .from("alerts")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_read", false);
  return count ?? 0;
}

export async function markAlertReadAction(id: string) {
  const supabase = await createSupabaseServerClient();
  const user = await getUser(supabase);
  if (!user) return { error: "No autorizado" };

  const { error } = await supabase
    .from("alerts")
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id)
    .eq("is_read", false);

  if (error) return { error: "Error al marcar como leída" };
  return { success: true };
}

export async function markAllAlertsReadAction() {
  const supabase = await createSupabaseServerClient();
  const user = await getUser(supabase);
  if (!user) return { error: "No autorizado" };

  const { error } = await supabase
    .from("alerts")
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .eq("is_read", false);

  if (error) return { error: "Error al marcar como leídas" };
  return { success: true };
}
