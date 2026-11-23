"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { paidPercent, summarizeDebts, validateDebtPayment } from "@/domain/debts";
import { z } from "zod";

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido (YYYY-MM-DD)");

const debtFieldsSchema = z.object({
  name: z.string().trim().min(1, "El nombre es requerido").max(100),
  type: z.enum(["CREDIT_CARD", "PERSONAL_LOAN", "STUDENT_LOAN", "MORTGAGE", "OTHER"]),
  original_amount: z.coerce.number().positive("El monto debe ser mayor a 0"),
  current_balance: z.coerce.number().min(0, "El saldo no puede ser negativo").optional(),
  interest_rate_percent: z.coerce.number().min(0, "La tasa no puede ser negativa").default(0),
  minimum_payment: z.coerce.number().min(0, "El pago mínimo no puede ser negativo").default(0),
  payment_day: z.coerce.number().int().min(1).max(31).optional(),
  account_id: z.string().uuid().optional().nullable(),
});

const createDebtSchema = debtFieldsSchema;

const paymentSchema = z.object({
  debt_id: z.string().uuid(),
  amount: z.coerce.number().positive("El abono debe ser mayor a 0"),
  interest: z.coerce.number().min(0, "El interés no puede ser negativo").default(0),
  payment_date: dateSchema.optional(),
  notes: z.string().trim().max(300).optional(),
});

type FormState =
  | { error: string }
  | { error: Record<string, string[]> }
  | { data: { id: string } }
  | { error?: undefined; data?: undefined };

type Supabase = Awaited<ReturnType<typeof createSupabaseServerClient>>;

export type DebtStatus = "ACTIVE" | "PAID" | "PAUSED" | "CANCELLED";

export interface DebtRow {
  id: string;
  name: string;
  type: string;
  original_amount: string;
  current_balance: string;
  currency_code: string;
  interest_rate_percent: string;
  minimum_payment: string;
  payment_day: number | null;
  status: DebtStatus;
  paidPercent: number;
  account_id: string | null;
  account_name: string | null;
}

export interface DebtPaymentRow {
  id: string;
  amount: string;
  principal_amount: string;
  interest_amount: string;
  payment_date: string;
  notes: string | null;
}

async function getUser(supabase: Supabase) {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  return error || !user ? null : user;
}

function toDebtRow(d: {
  id: string;
  name: string;
  type: string;
  original_amount: string | number;
  current_balance: string | number;
  currency_code: string;
  interest_rate_percent: string | number;
  minimum_payment: string | number;
  payment_day: number | null;
  status: DebtStatus;
  account_id?: string | null;
  accounts?: { name: string } | { name: string }[] | null;
}): DebtRow {
  const acc = d.accounts ? (Array.isArray(d.accounts) ? d.accounts[0] : d.accounts) : null;
  return {
    ...d,
    original_amount: String(d.original_amount),
    current_balance: String(d.current_balance),
    interest_rate_percent: String(d.interest_rate_percent),
    minimum_payment: String(d.minimum_payment),
    paidPercent: paidPercent(d),
    account_id: d.account_id ?? null,
    account_name: acc?.name ?? null,
  };
}

const DEBT_COLUMNS =
  "id, name, type, original_amount, current_balance, currency_code, interest_rate_percent, minimum_payment, payment_day, status, account_id, accounts(name)";

export async function createDebtAction(_prevState: FormState, formData: FormData): Promise<FormState> {
  const supabase = await createSupabaseServerClient();
  const user = await getUser(supabase);
  if (!user) return { error: "No autorizado" };

  const parsed = createDebtSchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    original_amount: formData.get("original_amount"),
    current_balance: formData.get("current_balance") || undefined,
    interest_rate_percent: formData.get("interest_rate_percent") || 0,
    minimum_payment: formData.get("minimum_payment") || 0,
    payment_day: formData.get("payment_day") || undefined,
    account_id: formData.get("account_id") || null,
  });
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  if (parsed.data.current_balance !== undefined && parsed.data.current_balance > parsed.data.original_amount) {
    return { error: { current_balance: ["El saldo no puede superar el monto original"] } };
  }

  const { data: profile } = await supabase.from("profiles").select("currency_code").eq("id", user.id).single();

  const { data, error } = await supabase
    .from("debts")
    .insert({
      user_id: user.id,
      ...parsed.data,
      current_balance: parsed.data.current_balance ?? parsed.data.original_amount,
      currency_code: profile?.currency_code ?? "COP",
      account_id: parsed.data.account_id ?? null,
    })
    .select("id")
    .single();

  if (error) return { error: "Error al crear la deuda" };
  return { data: { id: data.id } };
}

export async function updateDebtAction(id: string, _prevState: FormState, formData: FormData): Promise<FormState> {
  const supabase = await createSupabaseServerClient();
  const user = await getUser(supabase);
  if (!user) return { error: "No autorizado" };

  const parsed = debtFieldsSchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    original_amount: formData.get("original_amount"),
    current_balance: formData.get("current_balance") || undefined,
    interest_rate_percent: formData.get("interest_rate_percent") || 0,
    minimum_payment: formData.get("minimum_payment") || 0,
    payment_day: formData.get("payment_day") || undefined,
    account_id: formData.get("account_id") || null,
  });
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const { data: profile } = await supabase.from("profiles").select("currency_code").eq("id", user.id).single();

  const { error } = await supabase
    .from("debts")
    .update({
      ...parsed.data,
      current_balance: parsed.data.current_balance ?? parsed.data.original_amount,
      currency_code: profile?.currency_code ?? "COP",
      account_id: parsed.data.account_id ?? null,
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .is("deleted_at", null);

  if (error) return { error: "Error al actualizar la deuda" };
  return { data: { id } };
}

export async function setDebtStatusAction(id: string, status: "ACTIVE" | "PAUSED" | "CANCELLED") {
  const supabase = await createSupabaseServerClient();
  const user = await getUser(supabase);
  if (!user) return { error: "No autorizado" };

  const { error } = await supabase
    .from("debts")
    .update({ status })
    .eq("id", id)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .neq("status", "PAID");

  if (error) return { error: "Error al actualizar" };
  return { success: true };
}

export async function deleteDebtAction(id: string) {
  const supabase = await createSupabaseServerClient();
  const user = await getUser(supabase);
  if (!user) return { error: "No autorizado" };

  const { error } = await supabase
    .from("debts")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id)
    .is("deleted_at", null);

  if (error) return { error: "Error al eliminar" };
  return { success: true };
}

/** Registra un abono con la función atómica de la base de datos (saldo y abono cuadran siempre). */
export async function registerDebtPaymentAction(_prevState: FormState, formData: FormData): Promise<FormState> {
  const supabase = await createSupabaseServerClient();
  const user = await getUser(supabase);
  if (!user) return { error: "No autorizado" };

  const parsed = paymentSchema.safeParse({
    debt_id: formData.get("debt_id"),
    amount: formData.get("amount"),
    interest: formData.get("interest") || 0,
    payment_date: formData.get("payment_date") || undefined,
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const { data: debt } = await supabase
    .from("debts")
    .select("current_balance, status")
    .eq("id", parsed.data.debt_id)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .single();
  if (!debt) return { error: "Deuda no encontrada" };

  // Mensaje claro antes de ir a la base de datos (que aplica las mismas reglas)
  const check = validateDebtPayment({ current_balance: String(debt.current_balance), status: debt.status }, parsed.data.amount, parsed.data.interest);
  if ("error" in check) return { error: check.error };

  const { data, error } = await supabase.rpc("record_debt_payment", {
    p_debt_id: parsed.data.debt_id,
    p_amount: parsed.data.amount,
    p_interest: parsed.data.interest,
    p_payment_date: parsed.data.payment_date,
    p_notes: parsed.data.notes,
  });

  if (error || !data) return { error: "Error al registrar el abono" };
  return { data: { id: data } };
}

export async function voidDebtPaymentAction(paymentId: string) {
  const supabase = await createSupabaseServerClient();
  const user = await getUser(supabase);
  if (!user) return { error: "No autorizado" };

  const { error } = await supabase.rpc("void_debt_payment", { p_payment_id: paymentId });
  if (error) return { error: "Error al anular el abono" };
  return { success: true };
}

export async function getDebtsAction(): Promise<
  | { data: { debts: DebtRow[]; totals: { balance: string; minimumPayments: string; count: number }; currencyCode: string } }
  | { error: string }
> {
  const supabase = await createSupabaseServerClient();
  const user = await getUser(supabase);
  if (!user) return { error: "No autorizado" };

  const [{ data, error }, { data: profile }] = await Promise.all([
    supabase.from("debts").select(DEBT_COLUMNS).eq("user_id", user.id).is("deleted_at", null).order("created_at", { ascending: true }),
    supabase.from("profiles").select("currency_code").eq("id", user.id).single(),
  ]);
  if (error) return { error: "Error al obtener las deudas" };

  const currencyCode = profile?.currency_code || "COP";
  const rows = (data ?? []).map(toDebtRow);
  const t = summarizeDebts(rows, currencyCode);

  return {
    data: {
      debts: rows,
      totals: { balance: t.balance.toString(), minimumPayments: t.minimumPayments.toString(), count: t.count },
      currencyCode,
    },
  };
}

export async function getDebtDetailAction(id: string): Promise<
  { data: { debt: DebtRow; payments: DebtPaymentRow[] } } | { error: string }
> {
  const supabase = await createSupabaseServerClient();
  const user = await getUser(supabase);
  if (!user) return { error: "No autorizado" };

  const { data: debt, error } = await supabase
    .from("debts")
    .select(DEBT_COLUMNS)
    .eq("id", id)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .single();
  if (error || !debt) return { error: "Deuda no encontrada" };

  const { data: payments } = await supabase
    .from("debt_payments")
    .select("id, amount, principal_amount, interest_amount, payment_date, notes")
    .eq("debt_id", id)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .order("payment_date", { ascending: false })
    .order("created_at", { ascending: false });

  return {
    data: {
      debt: toDebtRow(debt),
      payments: (payments ?? []).map((p) => ({
        id: p.id,
        amount: String(p.amount),
        principal_amount: String(p.principal_amount),
        interest_amount: String(p.interest_amount),
        payment_date: p.payment_date,
        notes: p.notes,
      })),
    },
  };
}
