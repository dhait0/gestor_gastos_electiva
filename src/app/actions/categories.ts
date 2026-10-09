"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { z } from "zod";

const categoryTypeSchema = z.enum(["INCOME", "EXPENSE"]);

const createCategorySchema = z.object({
  name: z.string().trim().min(1, "El nombre es requerido").max(50),
  type: categoryTypeSchema,
  color: z.string().optional(),
  icon: z.string().optional(),
});

const updateCategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1, "El nombre es requerido").max(50).optional(),
  type: categoryTypeSchema.optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
  is_default: z.boolean().optional(),
});

type FormState =
  | { error: string }
  | { error: Record<string, string[]> }
  | { data: { id: string } }
  | { error?: undefined; data?: undefined };

export async function createCategoryAction(_prevState: FormState, formData: FormData): Promise<FormState> {
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
    color: formData.get("color") || undefined,
    icon: formData.get("icon") || undefined,
  };

  const parsed = createCategorySchema.safeParse(rawData);

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { name, type, color, icon } = parsed.data;

  const { data, error } = await supabase
    .from("categories")
    .insert({
      user_id: user.id,
      name,
      type,
      color,
      icon,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return { error: "Ya existe una categoría activa con ese nombre y tipo" };
    }
    return { error: "Error al crear la categoría" };
  }

  return { data: { id: data.id } };
}

export async function getCategoriesAction() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "No autorizado" };
  }

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .order("type", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    return { error: "Error al obtener las categorías" };
  }

  return { data };
}

export async function updateCategoryAction(_prevState: FormState, formData: FormData): Promise<FormState> {
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
    color: formData.get("color"),
    icon: formData.get("icon"),
    is_default: formData.get("is_default"),
  };

  const parsed = updateCategorySchema.safeParse(rawData);

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { id, ...updates } = parsed.data;

  const cleanUpdates: Partial<typeof updates> = {};
  for (const [key, value] of Object.entries(updates)) {
    if (value !== undefined) {
      (cleanUpdates as Record<string, unknown>)[key] = value;
    }
  }

  const { data, error } = await supabase
    .from("categories")
    .update(cleanUpdates)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return { error: "Ya existe una categoría activa con ese nombre y tipo" };
    }
    return { error: "Error al actualizar la categoría" };
  }

  return { data: { id: data.id } };
}

export async function archiveCategoryAction(categoryId: string) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "No autorizado" };
  }

  const { error } = await supabase
    .from("categories")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", categoryId)
    .eq("user_id", user.id);

  if (error) {
    return { error: "Error al archivar la categoría" };
  }

  return { success: true };
}

export async function getCategoriesByTypeAction(type: "INCOME" | "EXPENSE") {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "No autorizado" };
  }

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("user_id", user.id)
    .eq("type", type)
    .is("deleted_at", null)
    .order("name", { ascending: true });

  if (error) {
    return { error: "Error al obtener las categorías" };
  }

  return { data };
}