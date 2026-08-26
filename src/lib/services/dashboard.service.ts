import { prisma } from "@/lib/prisma";

export type DashboardSummary = {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlySavings: number;
  savingsRate: number;
  availableToSpend: number;
};

export type ExpenseByCategory = {
  categoryId: string;
  categoryName: string;
  categoryColor: string | null;
  categoryIcon: string | null;
  amount: number;
  percentage: number;
};

export async function getDashboardSummary(userId: string, year: number, month: number): Promise<DashboardSummary> {
  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0, 23, 59, 59);

  const [accounts, monthTransactions] = await Promise.all([
    prisma.financialAccount.findMany({
      where: { userId, deletedAt: null },
      select: { currentBalance: true },
    }),
    prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: startOfMonth, lte: endOfMonth },
      },
      select: { type: true, amount: true },
    }),
  ]);

  const totalBalance = accounts.reduce((sum, a) => sum + a.currentBalance, 0);

  const monthlyIncome = monthTransactions
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpenses = monthTransactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlySavings = monthlyIncome - monthlyExpenses;
  const savingsRate = monthlyIncome > 0 ? Math.round((monthlySavings / monthlyIncome) * 100) : 0;

  const availableToSpend = totalBalance;

  return {
    totalBalance,
    monthlyIncome,
    monthlyExpenses,
    monthlySavings,
    savingsRate,
    availableToSpend,
  };
}

export async function getExpensesByCategory(userId: string, year: number, month: number): Promise<ExpenseByCategory[]> {
  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0, 23, 59, 59);

  const expenses = await prisma.transaction.groupBy({
    by: ["categoryId"],
    where: {
      userId,
      type: "EXPENSE",
      date: { gte: startOfMonth, lte: endOfMonth },
    },
    _sum: { amount: true },
  });

  const categories = await prisma.category.findMany({
    where: { userId },
    select: { id: true, name: true, color: true, icon: true },
  });

  const categoryMap = new Map(categories.map((c) => [c.id, c]));
  const total = expenses.reduce((sum, e) => sum + (e._sum.amount ?? 0), 0);

  return expenses
    .map((e) => {
      const category = categoryMap.get(e.categoryId);
      if (!category) return null;

      const amount = e._sum.amount ?? 0;
      return {
        categoryId: e.categoryId,
        categoryName: category.name,
        categoryColor: category.color,
        categoryIcon: category.icon,
        amount,
        percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
      };
    })
    .filter((item): item is ExpenseByCategory => item !== null)
    .sort((a, b) => b.amount - a.amount);
}

export async function getRecentTransactions(userId: string, limit: number = 5) {
  const transactions = await prisma.transaction.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    take: limit,
    select: {
      id: true,
      type: true,
      amount: true,
      description: true,
      date: true,
      category: { select: { name: true, color: true, icon: true } },
      account: { select: { name: true } },
    },
  });

  return transactions;
}
