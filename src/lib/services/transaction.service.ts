import { prisma } from "@/lib/prisma";
import type { TransactionType } from "@prisma/client";

export type Transaction = {
  id: string;
  userId: string;
  accountId: string;
  categoryId: string;
  type: TransactionType;
  amount: number;
  description: string;
  date: Date;
  notes: string | null;
  isRecurring: boolean;
  recurringTransactionId: string | null;
  transferGroupId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateTransactionInput = {
  accountId: string;
  categoryId: string;
  type: TransactionType;
  amount: number;
  description: string;
  date: Date;
  notes?: string;
  isRecurring?: boolean;
  recurringTransactionId?: string;
  transferGroupId?: string;
};

export type UpdateTransactionInput = {
  accountId?: string;
  categoryId?: string;
  type?: TransactionType;
  amount?: number;
  description?: string;
  date?: Date;
  notes?: string;
  isRecurring?: boolean;
  recurringTransactionId?: string;
  transferGroupId?: string;
};

export async function listTransactions(
  userId: string,
  options?: {
    accountId?: string;
    categoryId?: string;
    type?: TransactionType;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  },
): Promise<Transaction[]> {
  const where: {
    userId: string;
    accountId?: string;
    categoryId?: string;
    type?: TransactionType;
    date?: { gte?: Date; lte?: Date };
  } = { userId };

  if (options?.accountId) where.accountId = options.accountId;
  if (options?.categoryId) where.categoryId = options.categoryId;
  if (options?.type) where.type = options.type;
  if (options?.startDate || options?.endDate) {
    where.date = {};
    if (options.startDate) where.date.gte = options.startDate;
    if (options.endDate) where.date.lte = options.endDate;
  }

  const transactions = await prisma.transaction.findMany({
    where,
    orderBy: { date: "desc" },
    take: options?.limit,
  });

  return transactions.map((t) => ({
    id: t.id,
    userId: t.userId,
    accountId: t.accountId,
    categoryId: t.categoryId,
    type: t.type,
    amount: t.amount,
    description: t.description,
    date: t.date,
    notes: t.notes,
    isRecurring: t.isRecurring,
    recurringTransactionId: t.recurringTransactionId,
    transferGroupId: t.transferGroupId,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  }));
}

export async function getTransaction(userId: string, id: string): Promise<Transaction | null> {
  const transaction = await prisma.transaction.findFirst({
    where: { id, userId },
  });

  if (!transaction) return null;

  return {
    id: transaction.id,
    userId: transaction.userId,
    accountId: transaction.accountId,
    categoryId: transaction.categoryId,
    type: transaction.type,
    amount: transaction.amount,
    description: transaction.description,
    date: transaction.date,
    notes: transaction.notes,
    isRecurring: transaction.isRecurring,
    recurringTransactionId: transaction.recurringTransactionId,
    transferGroupId: transaction.transferGroupId,
    createdAt: transaction.createdAt,
    updatedAt: transaction.updatedAt,
  };
}

async function applyBalanceChange(accountId: string, type: TransactionType, amount: number, reverse: boolean = false) {
  const account = await prisma.financialAccount.findUnique({
    where: { id: accountId },
  });

  if (!account) return;

  let delta = amount;
  if (type === "EXPENSE") {
    delta = reverse ? amount : -amount;
  } else if (type === "INCOME") {
    delta = reverse ? -amount : amount;
  } else if (type === "TRANSFER") {
    delta = reverse ? -amount : amount;
  }

  const newBalance = account.currentBalance + delta;

  await prisma.financialAccount.update({
    where: { id: accountId },
    data: { currentBalance: newBalance },
  });
}

export async function createTransaction(userId: string, input: CreateTransactionInput): Promise<Transaction> {
  const transaction = await prisma.transaction.create({
    data: {
      userId,
      accountId: input.accountId,
      categoryId: input.categoryId,
      type: input.type,
      amount: input.amount,
      description: input.description,
      date: input.date,
      notes: input.notes,
      isRecurring: input.isRecurring ?? false,
      recurringTransactionId: input.recurringTransactionId,
      transferGroupId: input.transferGroupId,
    },
  });

  await applyBalanceChange(input.accountId, input.type, input.amount);

  return {
    id: transaction.id,
    userId: transaction.userId,
    accountId: transaction.accountId,
    categoryId: transaction.categoryId,
    type: transaction.type,
    amount: transaction.amount,
    description: transaction.description,
    date: transaction.date,
    notes: transaction.notes,
    isRecurring: transaction.isRecurring,
    recurringTransactionId: transaction.recurringTransactionId,
    transferGroupId: transaction.transferGroupId,
    createdAt: transaction.createdAt,
    updatedAt: transaction.updatedAt,
  };
}

export async function updateTransaction(
  userId: string,
  id: string,
  input: UpdateTransactionInput,
): Promise<Transaction | null> {
  const existing = await prisma.transaction.findFirst({
    where: { id, userId },
  });

  if (!existing) return null;

  if (input.accountId && input.accountId !== existing.accountId) {
    await applyBalanceChange(existing.accountId, existing.type, existing.amount, true);
    const newType = input.type ?? existing.type;
    const newAmount = input.amount ?? existing.amount;
    await applyBalanceChange(input.accountId, newType, newAmount);
  } else if (input.type || input.amount) {
    const newType = input.type ?? existing.type;
    const newAmount = input.amount ?? existing.amount;
    await applyBalanceChange(existing.accountId, existing.type, existing.amount, true);
    await applyBalanceChange(existing.accountId, newType, newAmount);
  }

  const transaction = await prisma.transaction.update({
    where: { id },
    data: input,
  });

  return {
    id: transaction.id,
    userId: transaction.userId,
    accountId: transaction.accountId,
    categoryId: transaction.categoryId,
    type: transaction.type,
    amount: transaction.amount,
    description: transaction.description,
    date: transaction.date,
    notes: transaction.notes,
    isRecurring: transaction.isRecurring,
    recurringTransactionId: transaction.recurringTransactionId,
    transferGroupId: transaction.transferGroupId,
    createdAt: transaction.createdAt,
    updatedAt: transaction.updatedAt,
  };
}

export async function deleteTransaction(userId: string, id: string): Promise<boolean> {
  const existing = await prisma.transaction.findFirst({
    where: { id, userId },
  });

  if (!existing) return false;

  await applyBalanceChange(existing.accountId, existing.type, existing.amount, true);

  await prisma.transaction.delete({
    where: { id },
  });

  return true;
}
