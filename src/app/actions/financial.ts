"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Decimal } from "decimal.js";
import { calculateLiquidBalance, calculateAvailableToSpend } from "@/domain/transactions";

export interface FinancialSummary {
  liquidBalance: Decimal;
  pendingObligations: Decimal;
  safetyReserve: Decimal;
  availableToSpend: Decimal;
  currencyCode: string;
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

  // 1. Obtener cuentas del usuario (para saber cuáles son líquidas)
  const { data: accounts, error: accountsError } = await supabase
    .from("accounts")
    .select("id, type")
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
    .select("safety_reserve, currency_code")
    .eq("id", user.id)
    .single();

  if (profileError) {
    return { error: "Error al obtener perfil" };
  }

  // Calcular saldo líquido usando el dominio
  const typedTransactions = (transactions || []).map((t) => ({
    ...t,
    amount: t.amount.toString(),
    deleted_at: t.deleted_at,
    user_id: user.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    description: "",
    transaction_date: new Date().toISOString().split("T")[0],
  })) as import("@/domain/transactions").Transaction[];

  const liquidBalance = calculateLiquidBalance(typedTransactions, accounts || []);

  // Calcular obligaciones pendientes totales
  const pendingObligations = (obligations || []).reduce(
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

  return {
    data: {
      liquidBalance,
      pendingObligations,
      safetyReserve,
      availableToSpend,
      currencyCode,
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