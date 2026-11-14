"use client";

import { preventFormReset } from "@/lib/keep-form-on-error";
import { useActionState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import { requestPasswordResetAction } from "@/app/actions/auth";

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState(requestPasswordResetAction, { success: false, error: "" });

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground font-heading tracking-tight">Recupera tu acceso</h1>
          <p className="mt-2 text-muted-foreground">Te enviaremos un enlace para crear una nueva contraseña</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-finn-soft">
          {state.success ? (
            <div className="space-y-4 text-center" role="status">
              <p className="font-medium text-foreground">Revisa tu correo</p>
              <p className="text-sm text-muted-foreground">
                Si el correo corresponde a una cuenta, te enviamos un enlace para restablecer tu contraseña. Puede tardar unos minutos.
              </p>
              <Link href="/login" className="inline-block text-sm text-primary hover:underline font-medium">
                Volver a iniciar sesión
              </Link>
            </div>
          ) : (
            <form action={formAction} onReset={preventFormReset} className="space-y-6" noValidate>
              {state.error && (
                <div className="rounded-lg bg-danger-bg border border-danger/30 p-4 text-sm text-danger" role="alert">
                  {state.error}
                </div>
              )}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-foreground">
                  Correo electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" aria-hidden="true" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    disabled={isPending}
                    placeholder="tu@email.com"
                    className="w-full pl-10 pr-4 py-3 bg-background border border-input rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                  />
                </div>
                {state.fieldErrors?.email && (
                  <p className="text-sm text-danger" role="alert">{state.fieldErrors.email[0]}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={isPending}
                className="w-full py-3.5 px-6 bg-primary text-primary-foreground rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50"
              >
                {isPending ? "Enviando..." : "Enviar enlace"}
              </button>
              <p className="text-center text-sm text-muted-foreground">
                <Link href="/login" className="text-primary hover:underline font-medium">Volver a iniciar sesión</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
