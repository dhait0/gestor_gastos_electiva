"use server";

import { auth } from "@/auth";
import { getDashboardSummary, getExpensesByCategory, getRecentTransactions } from "@/lib/services/dashboard.service";

export async function getDashboardData() {
  const session = await auth();
  if (!session?.user) throw new Error("No autorizado");

  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  const [summary, expenses, recent] = await Promise.all([
    getDashboardSummary(session.user.id, year, month),
    getExpensesByCategory(session.user.id, year, month),
    getRecentTransactions(session.user.id, 5),
  ]);

  return { summary, expenses, recent };
}
