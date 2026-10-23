"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { toDomainTransactions } from "@/lib/supabase/transactions";
import { Decimal } from "decimal.js";
import { calculateLiquidBalance, calculateAvailableToSpend, calculateMonthlyIncomeExpense, calculateMonthlyTrend } from "@/domain/transactions";
import type { MonthlyTrendPoint } from "@/domain/transactions";

export interface FinancialSummary {
  liquidBalance: Decimal;
  pendingObligations: Decimal;
  safetyReserve: Decimal;
  availableToSpend: Decimal;
  currencyCode: string;
  monthlyIncome: Decimal;
  monthlyExpense: Decimal;
  monthlyTrend: MonthlyTrendPoint[];
}

export async function getFinancialSummaryAction(): Promise<
  | { data: FinancialSummary }
  | { error: string }
> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "No autorizado" };
  }

  // 1. Obtener cuentas del usuario (tipo, saldo inicial y estado de archivado)
  const { data: accounts, error: accountsError } = await supabase
    .from("accounts")
    .select("id, type, opening_balance, is_archived, currency_code")
    .eq("user_id", user.id)
    .eq("is_archived", false)
    .is("deleted_at", null);

  if (accountsError) {
    return { error: "Error al obtener cuentas" };
  }

  // 2. Obtener transacciones del usuario (para calcular saldos)
  const { data: transactions, error: transactionsError } = await supabase
    .from("transactions")
    .select("id, account_id, type, direction, amount, currency_code, deleted_at")
    .eq("user_id", user.id);

  if (transactionsError) {
    return { error: "Error al obtener transacciones" };
  }

  // 3. Obtener obligaciones pendientes
  const { data: obligations, error: obligationsError } = await supabase
    .from("obligations")
    .select("amount, currency_code")
    .eq("user_id", user.id)
    .eq("status", "PENDING")
    .is("deleted_at", null);

  if (obligationsError) {
    return { error: "Error al obtener obligaciones" };
  }

  // 4. Obtener perfil (para safety_reserve y currency_code)
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("safety_reserve, currency_code, timezone")
    .eq("id", user.id)
    .single();

  if (profileError) {
    return { error: "Error al obtener perfil" };
  }

  // Calcular saldo líquido usando el dominio (incluye el saldo inicial de cada
  // cuenta líquida, que es un atributo de la cuenta y no un movimiento)
  const typedTransactions = toDomainTransactions(transactions ?? [], user.id);

  // Política de monedas (modelo de datos §66-67): en V1 no hay conversión.
  // El agregado líquido y las obligaciones solo suman entidades cuya moneda
  // coincide con la moneda base del perfil. Las cuentas/transacciones/obligaciones
  // en otras monedas se excluyen del agregado (no se mezclan monedas).
  const baseCurrency = profile?.currency_code || "COP";

  const baseAccounts = (accounts || []).filter(
    (a) => (a.currency_code ?? baseCurrency) === baseCurrency
  );
  const baseTransactions = typedTransactions.filter(
    (t) => t.currency_code === baseCurrency
  );
  const baseObligations = (obligations || []).filter(
    (o) => o.currency_code === baseCurrency
  );

  const liquidBalance = calculateLiquidBalance(baseTransactions, baseAccounts, baseCurrency);

  // Calcular obligaciones pendientes totales (solo moneda base)
  const pendingObligations = baseObligations.reduce(
    (sum, o) => sum.plus(new Decimal(o.amount || 0)),
    new Decimal(0)
  );

  // Safety reserve
  const safetyReserve = new Decimal(profile?.safety_reserve || 0);

  // Currency code (usar la del perfil, o la primera de obligaciones, o COP por defecto)
  const currencyCode = profile?.currency_code || obligations[0]?.currency_code || "COP";

  // Calcular disponible usando el dominio
  const availableToSpend = calculateAvailableToSpend({
    liquidBalance,
    pendingObligations,
    safetyReserve,
  });

  // Ingresos y gastos reales del mes actual (moneda base, zona horaria del perfil)
  const timezone = profile?.timezone || "America/Bogota";
  const { income: monthlyIncome, expense: monthlyExpense } = calculateMonthlyIncomeExpense(
    baseTransactions,
    baseCurrency,
    timezone
  );

  const monthlyTrend = calculateMonthlyTrend(baseTransactions, baseCurrency, timezone, 6);

  return {
    data: {
      liquidBalance,
      pendingObligations,
      safetyReserve,
      availableToSpend,
      currencyCode,
      monthlyIncome,
      monthlyExpense,
      monthlyTrend,
    },
  };
}

export async function getLiquidBalanceAction(): Promise<
  | { data: { liquidBalance: Decimal; currencyCode: string } }
  | { error: string }
> {
  const summary = await getFinancialSummaryAction();

  if ("error" in summary) {
    return { error: summary.error };
  }

  return {
    data: {
      liquidBalance: summary.data.liquidBalance,
      currencyCode: summary.data.currencyCode,
    },
  };
}

export async function getAvailableToSpendAction(): Promise<
  | { data: { availableToSpend: Decimal; currencyCode: string } }
  | { error: string }
> {
  const summary = await getFinancialSummaryAction();

  if ("error" in summary) {
    return { error: summary.error };
  }

  return {
    data: {
      availableToSpend: summary.data.availableToSpend,
      currencyCode: summary.data.currencyCode,
    },
  };
}