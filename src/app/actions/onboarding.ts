"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { z } from "zod";

const updateProfileSchema = z.object({
  displayName: z.string().min(1).max(100).optional().nullable(),
  currencyCode: z.string().length(3).optional().nullable(),
  timezone: z.string().optional().nullable(),
  safetyReserve: z.number().min(0).optional().nullable(),
  locale: z.string().optional().nullable(),
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

  console.log("[updateProfileAction] rawData:", rawData);

  const validation = updateProfileSchema.safeParse(rawData);
  if (!validation.success) {
    console.log("[updateProfileAction] validation error:", validation.error.flatten().fieldErrors);
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
    console.log("[updateProfileAction] no user");
    return { success: false, error: "No autenticado" };
  }

  const updateData: {
    display_name?: string | null;
    currency_code?: string;
    timezone?: string;
    safety_reserve?: number;
    locale?: string;
  } = {};
  if (data.displayName !== undefined && data.displayName !== null) updateData.display_name = data.displayName;
  if (data.currencyCode !== undefined && data.currencyCode !== null) updateData.currency_code = data.currencyCode;
  if (data.timezone !== undefined && data.timezone !== null) updateData.timezone = data.timezone;
  if (data.safetyReserve !== undefined && data.safetyReserve !== null) updateData.safety_reserve = data.safetyReserve;
  if (data.locale !== undefined && data.locale !== null) updateData.locale = data.locale;

  console.log("[updateProfileAction] updateData:", updateData, "user:", user.id);

  const { error } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("id", user.id);

  if (error) {
    console.log("[updateProfileAction] db error:", error);
    return { success: false, error: "No se pudo actualizar el perfil" };
  }

  console.log("[updateProfileAction] success");
  return { success: true };
}

const createAccountSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(["CASH", "CHECKING", "SAVINGS", "CREDIT_CARD", "DIGITAL_WALLET", "OTHER"]),
  initialBalance: z.number().min(0),
  currencyCode: z.string().length(3),
  color: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
});

export async function createFirstAccountAction(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  console.error("[createFirstAccountAction] START");
  try {
    const rawData = {
      name: formData.get("name") as string,
      type: formData.get("type") as string,
      initialBalance: Number(formData.get("initialBalance")),
      currencyCode: formData.get("currencyCode") as string,
      color: formData.get("color") as string | null,
      icon: formData.get("icon") as string | null,
    };

    console.error("[createFirstAccountAction] rawData:", rawData);

    const validation = createAccountSchema.safeParse(rawData);
    if (!validation.success) {
      console.error("[createFirstAccountAction] validation error:", validation.error.flatten().fieldErrors);
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
      console.error("[createFirstAccountAction] no user");
      return { success: false, error: "No autenticado" };
    }

    console.error("[createFirstAccountAction] user:", user.id);

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
        opening_balance: initialBalance,
      });

    if (accountError) {
      console.error("[createFirstAccountAction] account error:", accountError);
      return { success: false, error: "No se pudo crear la cuenta" };
    }

    console.error("[createFirstAccountAction] success, returning redirect");
    return { success: true, redirectTo: "/dashboard" };
  } catch (err) {
    console.error("[createFirstAccountAction] UNCAUGHT ERROR:", err);
    return { success: false, error: "Error interno del servidor" };
  }
}