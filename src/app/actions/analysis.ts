"use server";

import { Decimal } from "decimal.js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { todayInTimezone } from "@/domain/dates";
import { getFinancialSummaryAction } from "@/app/actions/financial";
import { getBudgetsWithUsageAction } from "@/app/actions/budgets";
import { getGoalsWithProgressAction } from "@/app/actions/goals";
import { getSubscriptionsAction } from "@/app/actions/subscriptions";
import { getDebtsAction } from "@/app/actions/debts";
import { calculateForecast, getMonthProgress, type Forecast } from "@/domain/forecast";
import type { BreakdownItem } from "@/domain/analytics";
import { calculateFinancialScore, type FinancialScore } from "@/domain/score";
import { generateInsights, type Insight } from "@/domain/insights";
import { monthlyInterest } from "@/domain/debts";
import { simulatePurchase } from "@/domain/purchase-simulator";
import { z } from "zod";

type Supabase = Awaited<ReturnType<typeof createSupabaseServerClient>>;

async function getUser(supabase: Supabase) {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  return error || !user ? null : user;
}

interface AnalysisBase {
  currencyCode: string;
  today: string;
  liquidBalance: Decimal;
  availableToSpend: Decimal;
  forecast: Forecast;
  goalCommitments: Decimal;
  budgetsByCategory: Map<string, { limit: Decimal; spent: Decimal }>;
  budgetsTotal: number;
  budgetsExceeded: number;
  periodIncome: Decimal;
  periodExpense: Decimal;
  previousMonthExpense: Decimal;
  breakdown: BreakdownItem[];
  subscriptionsMonthly: Decimal;
  debtMinimumPayments: Decimal;
  debtMonthlyInterest: Decimal;
  overdueObligations: number;
}

/** Reúne una sola vez los datos que necesitan el análisis y el simulador. */
async function loadAnalysisBase(): Promise<{ data: AnalysisBase } | { error: string }> {
  const supabase = await createSupabaseServerClient();
  const user = await getUser(supabase);
  if (!user) return { error: "No autorizado" };

  const [current, previous, budgets, goals, subscriptions, debts, { data: obligations }, { data: profile }] = await Promise.all([
    getFinancialSummaryAction("current"),
    getFinancialSummaryAction("previous"),
    getBudgetsWithUsageAction(),
    getGoalsWithProgressAction(),
    getSubscriptionsAction(),
    getDebtsAction(),
    supabase
      .from("obligations")
      .select("amount, currency_code, due_date")
      .eq("user_id", user.id)
      .eq("status", "PENDING")
      .is("deleted_at", null),
    supabase.from("profiles").select("timezone").eq("id", user.id).single(),
  ]);

  if ("error" in current) return { error: current.error };
  if ("error" in previous) return { error: previous.error };

  const { currencyCode } = current.data;
  const today = todayInTimezone(profile?.timezone || "America/Bogota");
  const progress = getMonthProgress(today);
  const monthEnd = `${today.slice(0, 8)}${String(progress.daysInMonth).padStart(2, "0")}`;

  const baseObligations = (obligations ?? []).filter((o) => o.currency_code === currencyCode);
  const dueThisMonth = baseObligations
    .filter((o) => o.due_date >= today && o.due_date <= monthEnd)
    .reduce((s, o) => s.plus(o.amount), new Decimal(0));
  const overdue = baseObligations.filter((o) => o.due_date < today).length;

  const forecast = calculateForecast({
    spentToDate: current.data.periodExpense,
    day: progress.day,
    daysInMonth: progress.daysInMonth,
    liquidBalance: current.data.liquidBalance,
    pendingObligationsDueThisMonth: dueThisMonth,
  });

  const budgetList = "data" in budgets ? budgets.data.budgets : [];
  const goalList = "data" in goals ? goals.data : [];
  const activeDebts = "data" in debts ? debts.data.debts.filter((d) => d.status === "ACTIVE" && d.currency_code === currencyCode) : [];

  return {
    data: {
      currencyCode,
      today,
      liquidBalance: current.data.liquidBalance,
      availableToSpend: current.data.availableToSpend,
      forecast,
      goalCommitments: goalList
        .filter((g) => g.status === "ACTIVE" && g.currency_code === currencyCode)
        .reduce((s, g) => s.plus(g.monthly_commitment_amount), new Decimal(0)),
      budgetsByCategory: new Map(budgetList.map((b) => [b.category_id, { limit: new Decimal(b.limit_amount), spent: b.usage.spent }])),
      budgetsTotal: budgetList.length,
      budgetsExceeded: budgetList.filter((b) => b.usage.status === "EXCEEDED").length,
      periodIncome: current.data.periodIncome,
      periodExpense: current.data.periodExpense,
      previousMonthExpense: previous.data.periodExpense,
      breakdown: current.data.expenseBreakdown,
      subscriptionsMonthly: "data" in subscriptions ? new Decimal(subscriptions.data.totals.monthly) : new Decimal(0),
      debtMinimumPayments: activeDebts.reduce((s, d) => s.plus(d.minimum_payment), new Decimal(0)),
      debtMonthlyInterest: activeDebts.reduce((s, d) => s.plus(monthlyInterest(d.current_balance, d.interest_rate_percent)), new Decimal(0)),
      overdueObligations: overdue,
    },
  };
}

export interface Analysis {
  currencyCode: string;
  forecast: Forecast;
  score: FinancialScore;
  insights: Insight[];
}

export async function getAnalysisAction(): Promise<{ data: Analysis } | { error: string }> {
  const base = await loadAnalysisBase();
  if ("error" in base) return base;
  const b = base.data;

  const score = calculateFinancialScore({
    liquidBalance: b.liquidBalance,
    availableToSpend: b.availableToSpend,
    overdueObligations: b.overdueObligations,
    monthlyIncome: b.periodIncome,
    monthlyExpense: b.periodExpense,
    budgetsTotal: b.budgetsTotal,
    budgetsExceeded: b.budgetsExceeded,
    debtMinimumPayments: b.debtMinimumPayments,
  });

  const insights = generateInsights({
    income: b.periodIncome,
    expense: b.periodExpense,
    breakdown: b.breakdown,
    previousMonthExpense: b.previousMonthExpense,
    projectedMonthExpense: b.forecast.projectedMonthExpense,
    dayOfMonth: getMonthProgress(b.today).day,
    subscriptionsMonthly: b.subscriptionsMonthly,
    debtMonthlyInterest: b.debtMonthlyInterest,
  });

  return { data: { currencyCode: b.currencyCode, forecast: b.forecast, score, insights } };
}

const simulationSchema = z.object({
  amount: z.coerce.number().positive("El monto debe ser mayor a 0"),
  account_id: z.string().uuid("Selecciona una cuenta"),
  category_id: z.string().uuid().optional(),
});

export interface SimulationView {
  currencyCode: string;
  usesCredit: boolean;
  liquidBefore: string;
  liquidAfter: string;
  availableBefore: string;
  availableAfter: string;
  budget: { percentBefore: number; percentAfter: number; statusBefore: string; statusAfter: string; remainingAfter: string } | null;
  projectedEndLiquidAfter: string | null;
  coversGoalCommitments: boolean;
  warnings: string[];
}

type SimulationState =
  | { error: string }
  | { error: Record<string, string[]> }
  | { data: SimulationView }
  | { error?: undefined; data?: undefined };

/** Simula una compra hipotética. NO escribe nada en la base de datos (UC-39). */
export async function simulatePurchaseAction(_prev: SimulationState, formData: FormData): Promise<SimulationState> {
  const supabase = await createSupabaseServerClient();
  const user = await getUser(supabase);
  if (!user) return { error: "No autorizado" };

  const parsed = simulationSchema.safeParse({
    amount: formData.get("amount"),
    account_id: formData.get("account_id"),
    category_id: formData.get("category_id") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const { data: account } = await supabase
    .from("accounts")
    .select("type, currency_code")
    .eq("id", parsed.data.account_id)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .single();
  if (!account) return { error: "Cuenta no encontrada" };

  const base = await loadAnalysisBase();
  if ("error" in base) return { error: base.error };
  const b = base.data;
  if (account.currency_code !== b.currencyCode) {
    return { error: "La simulación solo admite cuentas en tu moneda base" };
  }

  const result = simulatePurchase({
    amount: parsed.data.amount,
    accountType: account.type,
    liquidBalance: b.liquidBalance,
    availableToSpend: b.availableToSpend,
    budget: parsed.data.category_id ? (b.budgetsByCategory.get(parsed.data.category_id) ?? null) : null,
    projectedEndLiquid: b.forecast.projectedEndLiquid,
    goalMonthlyCommitments: b.goalCommitments,
  });

  return {
    data: {
      currencyCode: b.currencyCode,
      usesCredit: result.usesCredit,
      liquidBefore: result.liquidBefore.toString(),
      liquidAfter: result.liquidAfter.toString(),
      availableBefore: result.availableBefore.toString(),
      availableAfter: result.availableAfter.toString(),
      budget: result.budget && {
        percentBefore: result.budget.percentBefore,
        percentAfter: result.budget.percentAfter,
        statusBefore: result.budget.statusBefore,
        statusAfter: result.budget.statusAfter,
        remainingAfter: result.budget.remainingAfter.toString(),
      },
      projectedEndLiquidAfter: result.projectedEndLiquidAfter?.toString() ?? null,
      coversGoalCommitments: result.coversGoalCommitments,
      warnings: result.warnings,
    },
  };
}
