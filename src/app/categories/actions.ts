"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import {
  createCategory,
  updateCategory,
  deleteCategory,
  listCategories,
  type CreateCategoryInput,
  type UpdateCategoryInput,
} from "@/lib/services/category.service";
import type { CategoryType } from "@prisma/client";

const categoryTypeValues = ["INCOME", "EXPENSE"] as const;
const typeSchema = z.enum(categoryTypeValues);

const createSchema = z.object({
  name: z.string().trim().min(1).max(80),
  type: typeSchema,
  icon: z.string().trim().max(20).optional(),
  color: z.string().trim().max(20).optional(),
});

const updateSchema = z.object({
  name: z.string().trim().min(1).max(80).optional(),
  type: typeSchema.optional(),
  icon: z.string().trim().max(20).optional().or(z.literal("")),
  color: z.string().trim().max(20).optional().or(z.literal("")),
});

export async function getCategories(type?: CategoryType) {
  const session = await auth();
  if (!session?.user) throw new Error("No autorizado");
  return listCategories(session.user.id, type);
}

export async function createCategoryAction(_prev: { error?: string }, formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("No autorizado");

  const parsed = createSchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    icon: formData.get("icon"),
    color: formData.get("color"),
  });

  if (!parsed.success) {
    return { error: "Datos inválidos. Revisa el formulario." };
  }

  const input: CreateCategoryInput = {
    name: parsed.data.name,
    type: parsed.data.type,
  };

  if (parsed.data.icon) input.icon = parsed.data.icon;
  if (parsed.data.color) input.color = parsed.data.color;

  await createCategory(session.user.id, input);
  revalidatePath("/categories");
  return { error: undefined };
}

export async function updateCategoryAction(id: string, _prev: { error?: string }, formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("No autorizado");

  const parsed = updateSchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    icon: formData.get("icon"),
    color: formData.get("color"),
  });

  if (!parsed.success) {
    return { error: "Datos inválidos. Revisa el formulario." };
  }

  const input: UpdateCategoryInput = {};

  if (parsed.data.name !== undefined) input.name = parsed.data.name;
  if (parsed.data.type !== undefined) input.type = parsed.data.type;
  if (parsed.data.icon !== undefined) input.icon = parsed.data.icon || undefined;
  if (parsed.data.color !== undefined) input.color = parsed.data.color || undefined;

  const updated = await updateCategory(session.user.id, id, input);
  if (!updated) return { error: "Categoría no encontrada." };

  revalidatePath("/categories");
  return { error: undefined };
}

export async function deleteCategoryAction(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("No autorizado");

  await deleteCategory(session.user.id, id);
  revalidatePath("/categories");
}
