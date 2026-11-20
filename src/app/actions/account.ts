"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { changeEmailSchema, changePasswordSchema, profileSettingsSchema, shortcutTokenNameSchema } from "@/schemas/account";
import { generateShortcutToken } from "@/lib/shortcut";

export type AccountActionResult =
  | { success: true; message: string; error?: undefined; fieldErrors?: undefined }
  | { success: false; error: string; message?: undefined; fieldErrors?: Record<string, string[]> };

export type ShortcutTokenResult =
  | { success: true; token: string; name: string; error?: undefined }
  | { success: false; error: string; token?: undefined; name?: undefined };

async function requireUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

/** Nombre, moneda principal, zona horaria y reserva de seguridad del perfil. */
export async function updateProfileSettingsAction(_prev: AccountActionResult, formData: FormData): Promise<AccountActionResult> {
  const parsed = profileSettingsSchema.safeParse({
    displayName: formData.get("displayName"),
    currencyCode: formData.get("currencyCode"),
    timezone: formData.get("timezone"),
    safetyReserve: formData.get("safetyReserve"),
  });
  if (!parsed.success) {
    return { success: false, error: "Revisa los datos marcados", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { supabase, user } = await requireUser();
  if (!user) return { success: false, error: "Tu sesión expiró. Inicia sesión de nuevo." };

  const { data: profile } = await supabase.from("profiles").select("currency_code").eq("id", user.id).single();

  // Los totales se calculan en la moneda principal y no se mezclan monedas distintas: cambiarla con cuentas en
  // otra moneda las haría desaparecer de los totales.
  if (profile && profile.currency_code !== parsed.data.currencyCode) {
    const { data: accounts } = await supabase
      .from("accounts")
      .select("currency_code")
      .eq("user_id", user.id)
      .is("deleted_at", null);
    const foreign = (accounts ?? []).filter((account) => account.currency_code !== parsed.data.currencyCode);
    if (foreign.length > 0) {
      return {
        success: false,
        error: `No puedes cambiar tu moneda principal a ${parsed.data.currencyCode} mientras tengas cuentas en otra moneda (${foreign.length}). Lukiva no mezcla monedas en los totales.`,
        fieldErrors: { currencyCode: ["Tienes cuentas en otra moneda"] },
      };
    }
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: parsed.data.displayName,
      currency_code: parsed.data.currencyCode,
      timezone: parsed.data.timezone,
      safety_reserve: parsed.data.safetyReserve,
    })
    .eq("id", user.id);
  if (error) return { success: false, error: "No se pudo guardar tu perfil. Inténtalo de nuevo." };

  revalidatePath("/", "layout");
  return { success: true, message: "Perfil actualizado." };
}

/** Cambia el correo: Supabase envía un enlace de confirmación y el cambio se aplica al abrirlo. */
export async function updateEmailAction(_prev: AccountActionResult, formData: FormData): Promise<AccountActionResult> {
  const parsed = changeEmailSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { success: false, error: "Correo inválido", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { supabase, user } = await requireUser();
  if (!user) return { success: false, error: "Tu sesión expiró. Inicia sesión de nuevo." };
  if (user.email?.toLowerCase() === parsed.data.email) {
    return { success: false, error: "Ese ya es tu correo actual", fieldErrors: { email: ["Ese ya es tu correo actual"] } };
  }

  const origin = (await headers()).get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const { error } = await supabase.auth.updateUser(
    { email: parsed.data.email },
    { emailRedirectTo: `${origin}/auth/callback?next=/ajustes` }
  );
  if (error) {
    if (/already|registered|exists/i.test(error.message)) {
      return { success: false, error: "Ese correo ya está en uso por otra cuenta" };
    }
    if (/rate|too many|seconds/i.test(error.message)) {
      return { success: false, error: "Espera un momento antes de pedir otro cambio de correo" };
    }
    return { success: false, error: "No se pudo iniciar el cambio de correo. Inténtalo de nuevo." };
  }

  return {
    success: true,
    message: `Te enviamos un enlace de confirmación a ${parsed.data.email}. Tu correo actual sigue siendo válido hasta que lo abras.`,
  };
}

/** Cambia la contraseña pidiendo la actual: protege la cuenta si alguien deja la sesión abierta. */
export async function changePasswordAction(_prev: AccountActionResult, formData: FormData): Promise<AccountActionResult> {
  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { success: false, error: "Revisa los datos marcados", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { supabase, user } = await requireUser();
  if (!user?.email) return { success: false, error: "Tu sesión expiró. Inicia sesión de nuevo." };

  const { error: verifyError } = await supabase.auth.signInWithPassword({ email: user.email, password: parsed.data.currentPassword });
  if (verifyError) {
    return { success: false, error: "La contraseña actual no es correcta", fieldErrors: { currentPassword: ["No es correcta"] } };
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    if (/weak|least|characters/i.test(error.message)) {
      return { success: false, error: "La nueva contraseña no cumple los requisitos de seguridad" };
    }
    return { success: false, error: "No se pudo cambiar la contraseña. Inténtalo de nuevo." };
  }

  return { success: true, message: "Contraseña actualizada." };
}

/** Cierra la sesión en todos los dispositivos (incluido este). */
export async function signOutEverywhereAction(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut({ scope: "global" });
  redirect("/login");
}

/** Crea un token para los Atajos del iPhone. El token en claro solo se devuelve aquí, una vez: en la base queda su hash. */
export async function createShortcutTokenAction(_prev: ShortcutTokenResult, formData: FormData): Promise<ShortcutTokenResult> {
  const parsed = shortcutTokenNameSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Nombre inválido" };
  }

  const { supabase, user } = await requireUser();
  if (!user) return { success: false, error: "Tu sesión expiró. Inicia sesión de nuevo." };

  const { count } = await supabase
    .from("shortcut_tokens")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .is("revoked_at", null);
  if ((count ?? 0) >= 5) {
    return { success: false, error: "Ya tienes 5 tokens activos. Revoca uno que no uses para crear otro." };
  }

  const { token, hash, prefix } = generateShortcutToken();
  const { error } = await supabase
    .from("shortcut_tokens")
    .insert({ user_id: user.id, name: parsed.data.name, token_hash: hash, token_prefix: prefix });
  if (error) return { success: false, error: "No se pudo crear el token. Inténtalo de nuevo." };

  revalidatePath("/ajustes");
  return { success: true, token, name: parsed.data.name };
}

/** Revoca un token: los atajos que lo usen dejan de funcionar al instante. */
export async function revokeShortcutTokenAction(tokenId: string): Promise<{ error?: string }> {
  const { supabase, user } = await requireUser();
  if (!user) return { error: "Tu sesión expiró. Inicia sesión de nuevo." };

  const { data, error } = await supabase
    .from("shortcut_tokens")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", tokenId)
    .eq("user_id", user.id)
    .is("revoked_at", null)
    .select("id");
  if (error || !data?.length) return { error: "No se pudo revocar el token" };

  revalidatePath("/ajustes");
  return {};
}
