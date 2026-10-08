"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { z } from "zod";

const updateProfileSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  currencyCode: z.string().length(3).optional(),
  timezone: z.string().optional(),
  safetyReserve: z.number().min(0).optional(),
  locale: z.string().optional(),
});

type ActionResult =
  | { success: true; redirectTo?: string; error?: undefined; fieldErrors?: undefined }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

export async function updateProfileAction(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const rawData = {
    displayName: formData.get("displayName") as string | null,
    currencyCode: formData.get("currencyCode") as string | null,
    timezone: formData.get("timezone") as string | null,
    safetyReserve: formData.get("safetyReserve") ? Number(formData.get("safetyReserve")) : undefined,
    locale: formData.get("locale") as string | null,
  };

  const validation = updateProfileSchema.safeParse(rawData);
  if (!validation.success) {
    return {
      success: false,
      error: "Datos inválidos",
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  const data = validation.data;
  const supabase = await createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "No autenticado" };
  }

  const updateData: {
    display_name?: string | null;
    currency_code?: string;
    timezone?: string;
    safety_reserve?: number;
    locale?: string;
  } = {};
  if (data.displayName !== undefined) updateData.display_name = data.displayName;
  if (data.currencyCode !== undefined) updateData.currency_code = data.currencyCode;
  if (data.timezone !== undefined) updateData.timezone = data.timezone;
  if (data.safetyReserve !== undefined) updateData.safety_reserve = data.safetyReserve;
  if (data.locale !== undefined) updateData.locale = data.locale;

  const { error } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("id", user.id);

  if (error) {
    return { success: false, error: "No se pudo actualizar el perfil" };
  }

  return { success: true };
}

const createAccountSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(["CASH", "CHECKING", "SAVINGS", "CREDIT_CARD", "DIGITAL_WALLET", "OTHER"]),
  initialBalance: z.number().min(0),
  currencyCode: z.string().length(3),
  color: z.string().optional(),
  icon: z.string().optional(),
});

export async function createFirstAccountAction(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const rawData = {
    name: formData.get("name") as string,
    type: formData.get("type") as string,
    initialBalance: Number(formData.get("initialBalance")),
    currencyCode: formData.get("currencyCode") as string,
    color: formData.get("color") as string | null,
    icon: formData.get("icon") as string | null,
  };

  const validation = createAccountSchema.safeParse(rawData);
  if (!validation.success) {
    return {
      success: false,
      error: "Datos de cuenta inválidos",
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  const { name, type, initialBalance, currencyCode, color, icon } = validation.data;
  const supabase = await createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "No autenticado" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("currency_code")
    .eq("id", user.id)
    .single();

  const finalCurrency = currencyCode || profile?.currency_code || "COP";

  const { error: accountError } = await supabase
    .from("accounts")
    .insert({
      user_id: user.id,
      name,
      type,
      currency_code: finalCurrency,
      color: color || "#2563EB",
      icon: icon || "CreditCard",
      is_archived: false,
    });

  if (accountError) {
    return { success: false, error: "No se pudo crear la cuenta" };
  }

  const { data: newAccount } = await supabase
    .from("accounts")
    .select("id")
    .eq("user_id", user.id)
    .eq("name", name)
    .single();

  if (newAccount && initialBalance > 0) {
    const { error: txError } = await supabase
      .from("transactions")
      .insert({
        user_id: user.id,
        account_id: newAccount.id,
        type: "INCOME",
        direction: "INFLOW",
        amount: initialBalance,
        currency_code: finalCurrency,
        category_id: null,
        description: "Saldo inicial",
        transaction_date: new Date().toISOString().split("T")[0],
      });

    if (txError) {
      return { success: false, error: "Cuenta creada pero no se pudo registrar el saldo inicial" };
    }
  }

  return { success: true, redirectTo: "/dashboard" };
}