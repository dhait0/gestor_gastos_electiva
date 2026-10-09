"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { z } from "zod";

const obligationStatusSchema = z.enum(["PENDING", "PAID", "CANCELLED"]);
const obligationSourceSchema = z.enum(["MANUAL", "SUBSCRIPTION", "RECURRING", "OTHER"]);

const createObligationSchema = z.object({
  name: z.string().trim().min(1, "El nombre es requerido").max(100),
  amount: z.coerce.number().positive("El monto debe ser mayor a 0"),
  currency_code: z.string().length(3).default("COP"),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido (YYYY-MM-DD)"),
  description: z.string().trim().max(500).optional().nullable(),
  source: obligationSourceSchema.default("MANUAL"),
  source_id: z.string().uuid().optional().nullable(),
});

const updateObligationSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1, "El nombre es requerido").max(100).optional(),
  amount: z.coerce.number().positive("El monto debe ser mayor a 0").optional(),
  currency_code: z.string().length(3).optional(),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido (YYYY-MM-DD)").optional(),
  description: z.string().trim().max(500).optional().nullable(),
  status: obligationStatusSchema.optional(),
  source: obligationSourceSchema.optional(),
  source_id: z.string().uuid().optional().nullable(),
});

type FormState =
  | { error: string }
  | { error: Record<string, string[]> }
  | { data: { id: string } }
  | { error?: undefined; data?: undefined };

export async function createObligationAction(_prevState: FormState, formData: FormData): Promise<FormState> {
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
    amount: formData.get("amount"),
    currency_code: formData.get("currency_code") || "COP",
    due_date: formData.get("due_date"),
    description: formData.get("description") || undefined,
    source: formData.get("source") || "MANUAL",
    source_id: formData.get("source_id") || undefined,
  };

  const parsed = createObligationSchema.safeParse(rawData);

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { data, error } = await supabase
    .from("obligations")
    .insert({
      user_id: user.id,
      ...parsed.data,
    })
    .select()
    .single();

  if (error) {
    return { error: "Error al crear la obligación" };
  }

  return { data: { id: data.id } };
}

export async function getObligationsAction(filters?: {
  status?: "PENDING" | "PAID" | "CANCELLED";
  startDate?: string;
  endDate?: string;
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
    .from("obligations")
    .select("*")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .order("due_date", { ascending: true })
    .order("created_at", { ascending: false });

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }
  if (filters?.startDate) {
    query = query.gte("due_date", filters.startDate);
  }
  if (filters?.endDate) {
    query = query.lte("due_date", filters.endDate);
  }

  const { data, error } = await query;

  if (error) {
    return { error: "Error al obtener las obligaciones" };
  }

  return { data };
}

export async function getObligationByIdAction(id: string) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "No autorizado" };
  }

  const { data, error } = await supabase
    .from("obligations")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .single();

  if (error) {
    return { error: "Obligación no encontrada" };
  }

  return { data };
}

export async function updateObligationAction(_prevState: FormState, formData: FormData): Promise<FormState> {
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
    name: formData.get("name") || undefined,
    amount: formData.get("amount") || undefined,
    currency_code: formData.get("currency_code") || undefined,
    due_date: formData.get("due_date") || undefined,
    description: formData.get("description") || undefined,
    status: formData.get("status") || undefined,
    source: formData.get("source") || undefined,
    source_id: formData.get("source_id") || undefined,
  };

  const parsed = updateObligationSchema.safeParse(rawData);

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { id, ...updates } = parsed.data;

  const cleanUpdates: Partial<{
    name: string;
    amount: number;
    currency_code: string;
    due_date: string;
    description: string | null;
    status: "PENDING" | "PAID" | "CANCELLED";
    source: "MANUAL" | "SUBSCRIPTION" | "RECURRING" | "OTHER";
    source_id: string | null;
  }> = {};
  for (const [key, value] of Object.entries(updates)) {
    if (value !== undefined) {
      (cleanUpdates as Record<string, unknown>)[key] = value;
    }
  }

  if (Object.keys(cleanUpdates).length === 0) {
    return { error: "No hay cambios para actualizar" };
  }

  const { data, error } = await supabase
    .from("obligations")
    .update(cleanUpdates)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    return { error: "Error al actualizar la obligación" };
  }

  return { data: { id: data.id } };
}

type SimpleActionState =
  | { error: string }
  | { success: true }
  | { error?: undefined; success?: undefined };

export async function markObligationPaidAction(obligationId: string): Promise<SimpleActionState> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "No autorizado" };
  }

  const { error } = await supabase
    .from("obligations")
    .update({
      status: "PAID",
      paid_at: new Date().toISOString(),
    })
    .eq("id", obligationId)
    .eq("user_id", user.id);

  if (error) {
    return { error: "Error al marcar la obligación como pagada" };
  }

  return { success: true };
}

export async function archiveObligationAction(obligationId: string): Promise<SimpleActionState> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "No autorizado" };
  }

  const { error } = await supabase
    .from("obligations")
    .update({
      status: "CANCELLED",
      deleted_at: new Date().toISOString(),
    })
    .eq("id", obligationId)
    .eq("user_id", user.id);

  if (error) {
    return { error: "Error al cancelar la obligación" };
  }

  return { success: true };
}

export async function getPendingObligationsTotalAction() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "No autorizado" };
  }

  const { data, error } = await supabase
    .from("obligations")
    .select("amount, currency_code")
    .eq("user_id", user.id)
    .eq("status", "PENDING")
    .is("deleted_at", null);

  if (error) {
    return { error: "Error al obtener el total de obligaciones pendientes" };
  }

  const total = data.reduce((sum, o) => sum + (o.amount || 0), 0);

  return { data: { total, currency_code: data[0]?.currency_code || "COP" } };
}