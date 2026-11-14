"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { resetPasswordAction } from "@/app/actions/auth";

/**
 * Fuera del grupo (auth): el usuario llega aquí con una sesión temporal creada por
 * /auth/callback, y el layout de (auth) redirige a quien ya tiene sesión.
 * El middleware exige sesión: sin enlace válido se envía a /login.
 */
export default function ResetPasswordPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(resetPasswordAction, { success: false, error: "" });

  useEffect(() => {
    if (state.success) router.push("/dashboard");
  }, [state.success, router]);

  const field = (id: string, label: string, autoComplete: string) => (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-foreground">{label}</label>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" aria-hidden="true" />
        <input
          id={id}
          name={id}
          type="password"
          autoComplete={autoComplete}
          required
          minLength={8}
          disabled={isPending}
          className="w-full pl-10 pr-4 py-3 bg-background border border-input rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
        />
      </div>
      {state.fieldErrors?.[id] && <p className="text-sm text-danger" role="alert">{state.fieldErrors[id][0]}</p>}
    </div>
  );

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground font-heading tracking-tight">Nueva contraseña</h1>
          <p className="mt-2 text-muted-foreground">Elige una contraseña de al menos 8 caracteres</p>
        </div>
        <form action={formAction} className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-finn-soft space-y-6" noValidate>
          {state.error && (
            <div className="rounded-lg bg-danger-bg border border-danger/30 p-4 text-sm text-danger" role="alert">{state.error}</div>
          )}
          {field("password", "Nueva contraseña", "new-password")}
          {field("confirmPassword", "Confirma la contraseña", "new-password")}
          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3.5 px-6 bg-primary text-primary-foreground rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50"
          >
            {isPending ? "Guardando..." : "Guardar contraseña"}
          </button>
        </form>
      </div>
    </main>
  );
}
