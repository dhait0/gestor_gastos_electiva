import { prisma } from "@/lib/prisma";
import type { AccountType } from "@prisma/client";

export type { AccountType };

export type FinancialAccount = {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
  initialBalance: number;
  currentBalance: number;
  currency: string;
  color: string | null;
  icon: string | null;
  isArchived: boolean;
  creditLimit: number | null;
  availableCredit: number | null;
  paymentDay: number | null;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateAccountInput = {
  name: string;
  type: AccountType;
  initialBalance: number;
  currency?: string;
  color?: string;
  icon?: string;
  creditLimit?: number;
  paymentDay?: number;
};

export type UpdateAccountInput = {
  name?: string;
  type?: AccountType;
  initialBalance?: number;
  currentBalance?: number;
  color?: string;
  icon?: string;
  isArchived?: boolean;
  creditLimit?: number | null;
  availableCredit?: number | null;
  paymentDay?: number | null;
};

export async function listAccounts(userId: string): Promise<FinancialAccount[]> {
  const accounts = await prisma.financialAccount.findMany({
    where: { userId, deletedAt: null },
    orderBy: { createdAt: "desc" },
  });

  return accounts.map((a) => ({
    id: a.id,
    userId: a.userId,
    name: a.name,
    type: a.type,
    initialBalance: a.initialBalance,
    currentBalance: a.currentBalance,
    currency: a.currency,
    color: a.color,
    icon: a.icon,
    isArchived: a.isArchived,
    creditLimit: a.creditLimit,
    availableCredit: a.availableCredit,
    paymentDay: a.paymentDay,
    deletedAt: a.deletedAt,
    createdAt: a.createdAt,
    updatedAt: a.updatedAt,
  }));
}

export async function getAccount(userId: string, id: string): Promise<FinancialAccount | null> {
  const account = await prisma.financialAccount.findFirst({
    where: { id, userId, deletedAt: null },
  });

  if (!account) return null;

  return {
    id: account.id,
    userId: account.userId,
    name: account.name,
    type: account.type,
    initialBalance: account.initialBalance,
    currentBalance: account.currentBalance,
    currency: account.currency,
    color: account.color,
    icon: account.icon,
    isArchived: account.isArchived,
    creditLimit: account.creditLimit,
    availableCredit: account.availableCredit,
    paymentDay: account.paymentDay,
    deletedAt: account.deletedAt,
    createdAt: account.createdAt,
    updatedAt: account.updatedAt,
  };
}

export async function createAccount(userId: string, input: CreateAccountInput): Promise<FinancialAccount> {
  const currency = input.currency ?? "COP";

  let currentBalance = input.initialBalance;
  let availableCredit: number | null = null;

  if (input.type === "CREDIT_CARD" && input.creditLimit !== undefined) {
    availableCredit = input.creditLimit - input.initialBalance;
    currentBalance = input.initialBalance;
  }

  const account = await prisma.financialAccount.create({
    data: {
      userId,
      name: input.name,
      type: input.type,
      initialBalance: input.initialBalance,
      currentBalance,
      currency,
      color: input.color,
      icon: input.icon,
      creditLimit: input.creditLimit ?? null,
      availableCredit,
      paymentDay: input.paymentDay ?? null,
    },
  });

  return {
    id: account.id,
    userId: account.userId,
    name: account.name,
    type: account.type,
    initialBalance: account.initialBalance,
    currentBalance: account.currentBalance,
    currency: account.currency,
    color: account.color,
    icon: account.icon,
    isArchived: account.isArchived,
    creditLimit: account.creditLimit,
    availableCredit: account.availableCredit,
    paymentDay: account.paymentDay,
    deletedAt: account.deletedAt,
    createdAt: account.createdAt,
    updatedAt: account.updatedAt,
  };
}

export async function updateAccount(
  userId: string,
  id: string,
  input: UpdateAccountInput,
): Promise<FinancialAccount | null> {
  const existing = await prisma.financialAccount.findFirst({
    where: { id, userId, deletedAt: null },
  });

  if (!existing) return null;

  const data: UpdateAccountInput & { creditLimit?: number | null; availableCredit?: number | null } = { ...input };

  if (input.type === "CREDIT_CARD" && input.creditLimit != null) {
    data.availableCredit = input.creditLimit - (input.currentBalance ?? existing.currentBalance);
  }

  const account = await prisma.financialAccount.update({
    where: { id },
    data,
  });

  return {
    id: account.id,
    userId: account.userId,
    name: account.name,
    type: account.type,
    initialBalance: account.initialBalance,
    currentBalance: account.currentBalance,
    currency: account.currency,
    color: account.color,
    icon: account.icon,
    isArchived: account.isArchived,
    creditLimit: account.creditLimit,
    availableCredit: account.availableCredit,
    paymentDay: account.paymentDay,
    deletedAt: account.deletedAt,
    createdAt: account.createdAt,
    updatedAt: account.updatedAt,
  };
}

export async function deleteAccount(userId: string, id: string): Promise<boolean> {
  const existing = await prisma.financialAccount.findFirst({
    where: { id, userId, deletedAt: null },
    select: { id: true },
  });

  if (!existing) return false;

  await prisma.financialAccount.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  return true;
}
