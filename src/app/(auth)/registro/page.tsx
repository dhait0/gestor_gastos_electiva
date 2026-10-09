"use client";

import { useState } from "react";
import { useActionState } from "react";
import { signupAction } from "@/app/actions/auth";
import { cn } from "@/lib/utils";
import { User, Mail, Lock, Eye, EyeOff, Shield } from "lucide-react";

function SignupForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [state, formAction, isPending] = useActionState(signupAction, {
    success: false,
    error: "",
  });

  return (
    <form action={formAction} className="space-y-6" noValidate>
      {state.error && (
        <div
          className="rounded-lg bg-danger-bg border border-danger/30 p-4 text-sm text-danger flex items-center gap-3"
          role="alert"
        >
          <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <p>{state.error}</p>
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="displayName" className="block text-sm font-medium text-foreground">
          Nombre visible
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            id="displayName"
            name="displayName"
            type="text"
            autoComplete="name"
            required
            maxLength={100}
            className={cn(
              "w-full pl-10 pr-4 py-3",
              "bg-background border border-input rounded-xl",
              "text-foreground placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
              "transition-colors",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
            disabled={isPending}
            placeholder="Tu nombre"
            aria-describedby={state.fieldErrors?.displayName ? "displayName-error" : undefined}
          />
        </div>
        {state.fieldErrors?.displayName && (
          <p id="displayName-error" className="text-sm text-danger" role="alert">
            {state.fieldErrors.displayName[0]}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium text-foreground">
          Correo electrónico
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className={cn(
              "w-full pl-10 pr-4 py-3",
              "bg-background border border-input rounded-xl",
              "text-foreground placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
              "transition-colors",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
            disabled={isPending}
            placeholder="tu@email.com"
            aria-describedby={state.fieldErrors?.email ? "email-error" : undefined}
          />
        </div>
        {state.fieldErrors?.email && (
          <p id="email-error" className="text-sm text-danger" role="alert">
            {state.fieldErrors.email[0]}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-medium text-foreground">
          Contraseña
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            minLength={8}
            maxLength={128}
            className={cn(
              "w-full pl-10 pr-12 py-3",
              "bg-background border border-input rounded-xl",
              "text-foreground placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
              "transition-colors",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
            disabled={isPending}
            placeholder="••••••••"
            aria-describedby={state.fieldErrors?.password ? "password-error" : "password-hint"}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            aria-pressed={showPassword}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        <p id="password-hint" className="text-xs text-muted-foreground">
          Mínimo 8 caracteres
        </p>
        {state.fieldErrors?.password && (
          <p id="password-error" className="text-sm text-danger" role="alert">
            {state.fieldErrors.password[0]}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground">
          Confirmar contraseña
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            className={cn(
              "w-full pl-10 pr-4 py-3",
              "bg-background border border-input rounded-xl",
              "text-foreground placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
              "transition-colors",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
            disabled={isPending}
            placeholder="••••••••"
            aria-describedby={state.fieldErrors?.confirmPassword ? "confirmPassword-error" : undefined}
          />
        </div>
        {state.fieldErrors?.confirmPassword && (
          <p id="confirmPassword-error" className="text-sm text-danger" role="alert">
            {state.fieldErrors.confirmPassword[0]}
          </p>
        )}
      </div>

      <div className="flex items-start gap-3 rounded-lg bg-success-bg border border-success/20 p-4">
        <Shield className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
        <div className="text-sm text-success-foreground">
          <p className="font-medium">Tu información está segura</p>
          <p className="mt-1">
            Nunca almacenamos tu contraseña en texto plano. Usamos Supabase Auth con
            cifrado estándar de la industria.
          </p>
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className={cn(
          "w-full py-3.5 px-6",
          "bg-primary text-primary-foreground",
          "rounded-xl font-semibold text-base",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          "transition-all duration-150",
          "hover:shadow-finn-elevated hover:-translate-y-0.5",
          "active:scale-[0.98] active:shadow-finn-soft",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:translate-y-0"
        )}
      >
        {isPending ? "Creando cuenta..." : "Crear cuenta"}
      </button>

      <p className="text-center text-sm text-muted-foreground">
        ¿Ya tienes cuenta?{" "}
        <a href="/login" className="text-primary hover:underline font-medium">
          Iniciar sesión
        </a>
      </p>
    </form>
  );
}

export default function RegistroPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground font-heading tracking-tight">
            Crea tu cuenta en FinWise
          </h1>
          <p className="mt-2 text-muted-foreground">
            Comienza a tomar control de tus finanzas
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-finn-soft">
          <SignupForm />
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Al continuar, aceptas nuestros{" "}
          <a href="/terminos" className="text-primary hover:underline">
            Términos de servicio
          </a>{" "}
          y{" "}
          <a href="/privacidad" className="text-primary hover:underline">
            Política de privacidad
          </a>
        </p>
      </div>
    </div>
  );
}