import { prisma } from "@/lib/prisma";
import type { CategoryType } from "@prisma/client";

export type Category = {
  id: string;
  userId: string;
  name: string;
  type: CategoryType;
  icon: string | null;
  color: string | null;
  isDefault: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateCategoryInput = {
  name: string;
  type: CategoryType;
  icon?: string;
  color?: string;
};

export type UpdateCategoryInput = {
  name?: string;
  type?: CategoryType;
  icon?: string;
  color?: string;
};

export async function listCategories(userId: string, type?: CategoryType): Promise<Category[]> {
  const where: { userId: string; deletedAt: null; type?: CategoryType } = {
    userId,
    deletedAt: null,
  };

  if (type) {
    where.type = type;
  }

  const categories = await prisma.category.findMany({
    where,
    orderBy: { name: "asc" },
  });

  return categories.map((c) => ({
    id: c.id,
    userId: c.userId,
    name: c.name,
    type: c.type,
    icon: c.icon,
    color: c.color,
    isDefault: c.isDefault,
    deletedAt: c.deletedAt,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  }));
}

export async function getCategory(userId: string, id: string): Promise<Category | null> {
  const category = await prisma.category.findFirst({
    where: { id, userId, deletedAt: null },
  });

  if (!category) return null;

  return {
    id: category.id,
    userId: category.userId,
    name: category.name,
    type: category.type,
    icon: category.icon,
    color: category.color,
    isDefault: category.isDefault,
    deletedAt: category.deletedAt,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  };
}

export async function createCategory(userId: string, input: CreateCategoryInput): Promise<Category> {
  const category = await prisma.category.create({
    data: {
      userId,
      name: input.name,
      type: input.type,
      icon: input.icon,
      color: input.color,
      isDefault: false,
    },
  });

  return {
    id: category.id,
    userId: category.userId,
    name: category.name,
    type: category.type,
    icon: category.icon,
    color: category.color,
    isDefault: category.isDefault,
    deletedAt: category.deletedAt,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  };
}

export async function updateCategory(
  userId: string,
  id: string,
  input: UpdateCategoryInput,
): Promise<Category | null> {
  const existing = await prisma.category.findFirst({
    where: { id, userId, deletedAt: null },
  });

  if (!existing) return null;

  const category = await prisma.category.update({
    where: { id },
    data: input,
  });

  return {
    id: category.id,
    userId: category.userId,
    name: category.name,
    type: category.type,
    icon: category.icon,
    color: category.color,
    isDefault: category.isDefault,
    deletedAt: category.deletedAt,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  };
}

export async function deleteCategory(userId: string, id: string): Promise<boolean> {
  const existing = await prisma.category.findFirst({
    where: { id, userId, deletedAt: null },
    select: { id: true, isDefault: true },
  });

  if (!existing || existing.isDefault) return false;

  await prisma.category.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  return true;
}
