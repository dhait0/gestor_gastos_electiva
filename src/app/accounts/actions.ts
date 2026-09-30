"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import {
  createAccount,
  updateAccount,
  deleteAccount,
  listAccounts,
  type CreateAccountInput,
  type UpdateAccountInput,
} from "@/lib/services/account.service";

const accountTypeValues = ["CASH", "CHECKING", "SAVINGS", "CREDIT_CARD", "DIGITAL_WALLET", "OTHER"] as const;
const typeSchema = z.enum(accountTypeValues);

const createSchema = z.object({
  name: z.string().trim().min(1).max(80),
  type: typeSchema,
  initialBalance: z.coerce.number().int().nonnegative(),
  currency: z.string().trim().max(10).optional(),
  color: z.string().trim().max(20).optional(),
  icon: z.string().trim().max(20).optional(),
  creditLimit: z.coerce.number().int().nonnegative().optional(),
  paymentDay: z.coerce.number().int().min(1).max(31).optional(),
});

const updateSchema = z.object({
  name: z.string().trim().min(1).max(80).optional(),
  type: typeSchema.optional(),
  initialBalance: z.coerce.number().int().nonnegative().optional(),
  currentBalance: z.coerce.number().int().optional(),
  color: z.string().trim().max(20).optional().or(z.literal("")),
  icon: z.string().trim().max(20).optional().or(z.literal("")),
  isArchived: z.coerce.boolean().optional(),
  creditLimit: z.coerce.number().int().nonnegative().optional().or(z.literal("")),
  paymentDay: z.coerce.number().int().min(1).max(31).optional().or(z.literal("")),
});

export async function getAccounts() {
  const session = await auth();
  if (!session?.user) throw new Error("No autorizado");
  return listAccounts(session.user.id);
}

export async function createAccountAction(_prev: { error?: string }, formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("No autorizado");

  const parsed = createSchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    initialBalance: formData.get("initialBalance"),
    currency: formData.get("currency"),
    color: formData.get("color"),
    icon: formData.get("icon"),
    creditLimit: formData.get("creditLimit"),
    paymentDay: formData.get("paymentDay"),
  });

  if (!parsed.success) {
    return { error: "Datos inválidos. Revisa el formulario." };
  }

  const input: CreateAccountInput = {
    name: parsed.data.name,
    type: parsed.data.type,
    initialBalance: parsed.data.initialBalance,
  };

  if (parsed.data.currency) input.currency = parsed.data.currency;
  if (parsed.data.color) input.color = parsed.data.color;
  if (parsed.data.icon) input.icon = parsed.data.icon;
  if (parsed.data.creditLimit !== undefined) input.creditLimit = parsed.data.creditLimit;
  if (parsed.data.paymentDay !== undefined) input.paymentDay = parsed.data.paymentDay;

  await createAccount(session.user.id, input);
  revalidatePath("/accounts");
  return { error: undefined };
}

export async function updateAccountAction(id: string, _prev: { error?: string }, formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("No autorizado");

  const parsed = updateSchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    initialBalance: formData.get("initialBalance"),
    currentBalance: formData.get("currentBalance"),
    color: formData.get("color"),
    icon: formData.get("icon"),
    isArchived: formData.get("isArchived"),
    creditLimit: formData.get("creditLimit"),
    paymentDay: formData.get("paymentDay"),
  });

  if (!parsed.success) {
    return { error: "Datos inválidos. Revisa el formulario." };
  }

  const input: UpdateAccountInput = {};

  if (parsed.data.name !== undefined) input.name = parsed.data.name;
  if (parsed.data.type !== undefined) input.type = parsed.data.type;
  if (parsed.data.initialBalance !== undefined) input.initialBalance = parsed.data.initialBalance;
  if (parsed.data.currentBalance !== undefined) input.currentBalance = parsed.data.currentBalance;
  if (parsed.data.color !== undefined) input.color = parsed.data.color || undefined;
  if (parsed.data.icon !== undefined) input.icon = parsed.data.icon || undefined;
  if (parsed.data.isArchived !== undefined) input.isArchived = parsed.data.isArchived;
  if (parsed.data.creditLimit !== undefined) input.creditLimit = parsed.data.creditLimit || undefined;
  if (parsed.data.paymentDay !== undefined) input.paymentDay = parsed.data.paymentDay || undefined;

  const updated = await updateAccount(session.user.id, id, input);
  if (!updated) return { error: "Cuenta no encontrada." };

  revalidatePath("/accounts");
  return { error: undefined };
}

export async function deleteAccountAction(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("No autorizado");

  await deleteAccount(session.user.id, id);
  revalidatePath("/accounts");
}
