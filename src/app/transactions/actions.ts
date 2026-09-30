"use server";

import { auth } from "@/auth";
import {
  createTransaction,
  updateTransaction,
  deleteTransaction,
  listTransactions,
} from "@/lib/services/transaction.service";
import { listAccounts } from "@/lib/services/account.service";
import { listCategories } from "@/lib/services/category.service";
import type { TransactionType } from "@prisma/client";

export async function getTransactions() {
  const session = await auth();
  if (!session?.user) throw new Error("No autorizado");
  return listTransactions(session.user.id);
}

export async function getAccounts() {
  const session = await auth();
  if (!session?.user) throw new Error("No autorizado");
  return listAccounts(session.user.id);
}

export async function getCategories() {
  const session = await auth();
  if (!session?.user) throw new Error("No autorizado");
  return listCategories(session.user.id);
}

export async function createTransactionAction(_prev: { error?: string }, formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("No autorizado");

  const accountId = String(formData.get("accountId") ?? "");
  const categoryId = String(formData.get("categoryId") ?? "");
  const type = String(formData.get("type") ?? "");
  const amount = Number(formData.get("amount"));
  const description = String(formData.get("description") ?? "");
  const dateStr = String(formData.get("date") ?? "");
  const notes = String(formData.get("notes") ?? "");
  const isRecurring = formData.get("isRecurring") === "on";

  if (!accountId || !categoryId || !type || !description || !dateStr || Number.isNaN(amount) || amount <= 0) {
    return { error: "Datos inválidos. Revisa el formulario." };
  }

  const date = new Date(dateStr);

  await createTransaction(session.user.id, {
    accountId,
    categoryId,
    type: type as TransactionType,
    amount,
    description,
    date,
    notes: notes || undefined,
    isRecurring,
  });

  return { error: undefined };
}

export async function updateTransactionAction(id: string, _prev: { error?: string }, formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("No autorizado");

  const input: Record<string, unknown> = {};
  const accountId = String(formData.get("accountId") ?? "");
  const categoryId = String(formData.get("categoryId") ?? "");
  const type = String(formData.get("type") ?? "");
  const amount = Number(formData.get("amount"));
  const description = String(formData.get("description") ?? "");
  const dateStr = String(formData.get("date") ?? "");
  const notes = String(formData.get("notes") ?? "");

  if (accountId) input.accountId = accountId;
  if (categoryId) input.categoryId = categoryId;
  if (type) input.type = type as TransactionType;
  if (!Number.isNaN(amount) && amount > 0) input.amount = amount;
  if (description) input.description = description;
  if (dateStr) input.date = new Date(dateStr);
  input.notes = notes || undefined;
  input.isRecurring = formData.get("isRecurring") === "on";

  await updateTransaction(session.user.id, id, input);
  return { error: undefined };
}

export async function deleteTransactionAction(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("No autorizado");

  await deleteTransaction(session.user.id, id);
}
