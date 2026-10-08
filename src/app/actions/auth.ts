"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { signupSchema, loginSchema, passwordResetRequestSchema, passwordResetSchema } from "@/schemas/auth";
import { redirect } from "next/navigation";

type ActionResult =
  | { success: true; redirectTo?: string; error?: undefined; fieldErrors?: undefined }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

export async function signupAction(_prevState: ActionResult, formData: FormData): Promise<ActionResult> {
  const rawData = {
    displayName: formData.get("displayName") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  const validation = signupSchema.safeParse(rawData);
  if (!validation.success) {
    return {
      success: false,
      error: "Datos de registro inválidos",
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  const { displayName, email, password } = validation.data;

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName,
      },
    },
  });

  if (error) {
    if (error.message.includes("already registered") || error.message.includes("already exists")) {
      return { success: false, error: "Ya existe una cuenta asociada a este correo" };
    }
    if (error.message.includes("weak password") || error.message.includes("Password should be")) {
      return { success: false, error: "La contraseña no cumple los requisitos de seguridad" };
    }
    return { success: false, error: "No se pudo crear la cuenta. Intenta de nuevo." };
  }

  return { success: true, redirectTo: "/onboarding" };
}

export async function loginAction(_prevState: ActionResult, formData: FormData): Promise<ActionResult> {
  const rawData = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const validation = loginSchema.safeParse(rawData);
  if (!validation.success) {
    return {
      success: false,
      error: "Datos de acceso inválidos",
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  const { email, password } = validation.data;

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (error.message.includes("Invalid login credentials") || error.message.includes("Email not confirmed")) {
      return { success: false, error: "El correo o la contraseña no son correctos" };
    }
    return { success: false, error: "No se pudo iniciar sesión. Intenta de nuevo." };
  }

  return { success: true, redirectTo: "/dashboard" };
}

export async function logoutAction(): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    return { success: false, error: "No se pudo cerrar la sesión" };
  }

  redirect("/login");
}

export async function requestPasswordResetAction(_prevState: ActionResult, formData: FormData): Promise<ActionResult> {
  const rawData = {
    email: formData.get("email") as string,
  };

  const validation = passwordResetRequestSchema.safeParse(rawData);
  if (!validation.success) {
    return {
      success: false,
      error: "Email inválido",
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  const { email } = validation.data;

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/callback?next=/reset-password`,
  });

  if (error) {
    return { success: false, error: "No se pudo solicitar la recuperación" };
  }

  return { success: true, redirectTo: "/login" };
}

export async function resetPasswordAction(_prevState: ActionResult, formData: FormData): Promise<ActionResult> {
  const rawData = {
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  const validation = passwordResetSchema.safeParse(rawData);
  if (!validation.success) {
    return {
      success: false,
      error: "Datos inválidos",
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  const { password } = validation.data;

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    if (error.message.includes("weak password")) {
      return { success: false, error: "La contraseña no cumple los requisitos de seguridad" };
    }
    return { success: false, error: "No se pudo actualizar la contraseña" };
  }

  return { success: true, redirectTo: "/login" };
}