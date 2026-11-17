"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { calculateGoalProgress, type GoalProgress } from "@/domain/goals";
import { z } from "zod";

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido (YYYY-MM-DD)");

const createGoalSchema = z.object({
  name: z.string().trim().min(1, "El nombre es requerido").max(100),
  description: z.string().trim().max(500).optional(),
  target_amount: z.coerce.number().positive("La meta debe ser mayor a 0"),
  initial_amount: z.coerce.number().min(0, "El monto inicial no puede ser negativo").default(0),
  monthly_commitment_amount: z.coerce.number().min(0, "El compromiso no puede ser negativo").default(0),
  target_date: dateSchema.optional(),
});

const contributionSchema = z.object({
  goal_id: z.string().uuid(),
  amount: z.coerce.number().positive("El aporte debe ser mayor a 0"),
  contribution_date: dateSchema.optional(),
  notes: z.string().trim().max(300).optional(),
});

type FormState =
  | { error: string }
  | { error: Record<string, string[]> }
  | { data: { id: string } }
  | { error?: undefined; data?: undefined };

type Supabase = Awaited<ReturnType<typeof createSupabaseServerClient>>;

export interface GoalWithProgress {
  id: string;
  name: string;
  description: string | null;
  target_amount: string;
  initial_amount: string;
  monthly_commitment_amount: string;
  currency_code: string;
  target_date: string | null;
  status: "ACTIVE" | "COMPLETED" | "PAUSED" | "CANCELLED";
  progress: GoalProgress;
}

export interface GoalContributionRow {
  id: string;
  amount: string;
  contribution_date: string;
  notes: string | null;
}

async function getUser(supabase: Supabase) {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  return error || !user ? null : user;
}

/**
 * Mantiene `status` coherente con el progreso: una meta ACTIVE que alcanza su
 * objetivo pasa a COMPLETED, y una COMPLETED que deja de alcanzarlo (p. ej. al
 * eliminar un aporte) vuelve a ACTIVE. No toca PAUSED ni CANCELLED.
 */
async function syncGoalStatus(supabase: Supabase, userId: string, goalId: string) {
  const { data: goal } = await supabase
    .from("goals")
    .select("target_amount, initial_amount, status")
    .eq("id", goalId)
    .eq("user_id", userId)
    .is("deleted_at", null)
    .single();
  if (!goal || (goal.status !== "ACTIVE" && goal.status !== "COMPLETED")) return;

  const { data: contributions } = await supabase
    .from("goal_contributions")
    .select("amount, deleted_at")
    .eq("goal_id", goalId)
    .eq("user_id", userId)
    .is("deleted_at", null);

  const completed = calculateGoalProgress(
    { target_amount: String(goal.target_amount), initial_amount: String(goal.initial_amount) },
    (contributions ?? []).map((c) => ({ amount: String(c.amount) }))
  ).isCompleted;

  const next = completed ? "COMPLETED" : "ACTIVE";
  if (next !== goal.status) {
    await supabase.from("goals").update({ status: next }).eq("id", goalId).eq("user_id", userId);
  }
}

export async function createGoalAction(_prevState: FormState, formData: FormData): Promise<FormState> {
  const supabase = await createSupabaseServerClient();
  const user = await getUser(supabase);
  if (!user) return { error: "No autorizado" };

  const parsed = createGoalSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    target_amount: formData.get("target_amount"),
    initial_amount: formData.get("initial_amount") || 0,
    monthly_commitment_amount: formData.get("monthly_commitment_amount") || 0,
    target_date: formData.get("target_date") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const { data: profile } = await supabase.from("profiles").select("currency_code").eq("id", user.id).single();

  const { data, error } = await supabase
    .from("goals")
    .insert({
      user_id: user.id,
      ...parsed.data,
      status: parsed.data.initial_amount >= parsed.data.target_amount ? "COMPLETED" : "ACTIVE",
      currency_code: profile?.currency_code ?? "COP",
    })
    .select("id")
    .single();

  if (error) return { error: "Error al crear la meta" };
  return { data: { id: data.id } };
}

export async function archiveGoalAction(goalId: string) {
  const supabase = await createSupabaseServerClient();
  const user = await getUser(supabase);
  if (!user) return { error: "No autorizado" };

  const { error } = await supabase
    .from("goals")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", goalId)
    .eq("user_id", user.id)
    .is("deleted_at", null);

  if (error) return { error: "Error al eliminar la meta" };
  return { success: true };
}

export async function setGoalStatusAction(goalId: string, status: "ACTIVE" | "PAUSED" | "CANCELLED") {
  const supabase = await createSupabaseServerClient();
  const user = await getUser(supabase);
  if (!user) return { error: "No autorizado" };

  const { error } = await supabase
    .from("goals")
    .update({ status })
    .eq("id", goalId)
    .eq("user_id", user.id)
    .is("deleted_at", null);

  if (error) return { error: "Error al actualizar la meta" };
  // Reanudar una meta ya cumplida debe reflejarse como completada
  if (status === "ACTIVE") await syncGoalStatus(supabase, user.id, goalId);
  return { success: true };
}

export async function addContributionAction(_prevState: FormState, formData: FormData): Promise<FormState> {
  const supabase = await createSupabaseServerClient();
  const user = await getUser(supabase);
  if (!user) return { error: "No autorizado" };

  const parsed = contributionSchema.safeParse({
    goal_id: formData.get("goal_id"),
    amount: formData.get("amount"),
    contribution_date: formData.get("contribution_date") || undefined,
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const { data: goal } = await supabase
    .from("goals")
    .select("status")
    .eq("id", parsed.data.goal_id)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .single();
  if (!goal) return { error: "Meta no encontrada" };
  if (goal.status === "CANCELLED") return { error: "No se puede aportar a una meta cancelada" };

  const { data, error } = await supabase
    .from("goal_contributions")
    .insert({ user_id: user.id, ...parsed.data })
    .select("id")
    .single();

  if (error) return { error: "Error al registrar el aporte" };

  await syncGoalStatus(supabase, user.id, parsed.data.goal_id);
  return { data: { id: data.id } };
}

export async function deleteContributionAction(contributionId: string, goalId: string) {
  const supabase = await createSupabaseServerClient();
  const user = await getUser(supabase);
  if (!user) return { error: "No autorizado" };

  const { error } = await supabase
    .from("goal_contributions")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", contributionId)
    .eq("goal_id", goalId)
    .eq("user_id", user.id)
    .is("deleted_at", null);

  if (error) return { error: "Error al eliminar el aporte" };
  await syncGoalStatus(supabase, user.id, goalId);
  return { success: true };
}

function toGoalWithProgress(
  g: {
    id: string;
    name: string;
    description: string | null;
    target_amount: string | number;
    initial_amount: string | number;
    monthly_commitment_amount: string | number;
    currency_code: string;
    target_date: string | null;
    status: GoalWithProgress["status"];
  },
  contributions: { amount: string | number }[],
  timezone: string
): GoalWithProgress {
  return {
    ...g,
    target_amount: String(g.target_amount),
    initial_amount: String(g.initial_amount),
    monthly_commitment_amount: String(g.monthly_commitment_amount),
    progress: calculateGoalProgress(
      { target_amount: String(g.target_amount), initial_amount: String(g.initial_amount), target_date: g.target_date },
      contributions.map((c) => ({ amount: String(c.amount) })),
      timezone
    ),
  };
}

export async function getGoalsWithProgressAction(): Promise<
  { data: GoalWithProgress[] } | { error: string }
> {
  const supabase = await createSupabaseServerClient();
  const user = await getUser(supabase);
  if (!user) return { error: "No autorizado" };

  const [{ data: goals, error: goalsError }, { data: contributions, error: contributionsError }, { data: profile }] =
    await Promise.all([
      supabase
        .from("goals")
        .select("id, name, description, target_amount, initial_amount, monthly_commitment_amount, currency_code, target_date, status")
        .eq("user_id", user.id)
        .is("deleted_at", null)
        .order("created_at", { ascending: true }),
      supabase.from("goal_contributions").select("goal_id, amount").eq("user_id", user.id).is("deleted_at", null),
      supabase.from("profiles").select("timezone").eq("id", user.id).single(),
    ]);

  if (goalsError || contributionsError) return { error: "Error al obtener las metas" };

  const timezone = profile?.timezone || "America/Bogota";
  return {
    data: (goals ?? []).map((g) =>
      toGoalWithProgress(
        g,
        (contributions ?? []).filter((c) => c.goal_id === g.id),
        timezone
      )
    ),
  };
}

export async function getGoalDetailAction(goalId: string): Promise<
  { data: { goal: GoalWithProgress; contributions: GoalContributionRow[] } } | { error: string }
> {
  const supabase = await createSupabaseServerClient();
  const user = await getUser(supabase);
  if (!user) return { error: "No autorizado" };

  const { data: goal, error: goalError } = await supabase
    .from("goals")
    .select("id, name, description, target_amount, initial_amount, monthly_commitment_amount, currency_code, target_date, status")
    .eq("id", goalId)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .single();

  if (goalError || !goal) return { error: "Meta no encontrada" };

  const [{ data: contributions }, { data: profile }] = await Promise.all([
    supabase
      .from("goal_contributions")
      .select("id, amount, contribution_date, notes")
      .eq("goal_id", goalId)
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .order("contribution_date", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase.from("profiles").select("timezone").eq("id", user.id).single(),
  ]);

  const rows: GoalContributionRow[] = (contributions ?? []).map((c) => ({
    id: c.id,
    amount: String(c.amount),
    contribution_date: c.contribution_date,
    notes: c.notes,
  }));

  return {
    data: {
      goal: toGoalWithProgress(goal, rows, profile?.timezone || "America/Bogota"),
      contributions: rows,
    },
  };
}
