"use client";

import { useState, useActionState } from "react";
import { createUser } from "./actions";

export default function NewUserForm() {
  const [state, formAction, pending] = useActionState(createUser, {
    error: undefined,
  });
  const [showPassword, setShowPassword] = useState(false);

  const inputClass =
    "w-full rounded-lg border border-input px-3 py-2 text-sm outline-none focus:border-primary";

  return (
    <form
      action={formAction}
      className="rounded-2xl border border-border bg-card p-6 shadow-sm"
    >
      <h2 className="mb-4 text-lg font-semibold text-foreground">
        Crear usuario
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">
            Nombre
          </label>
          <input name="name" className={inputClass} placeholder="Opcional" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">
            Correo
          </label>
          <input
            name="email"
            type="email"
            required
            className={inputClass}
            placeholder="usuario@correo.com"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">
            Contraseña
          </label>
          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              className={`${inputClass} pr-20`}
              placeholder="Mínimo 8 caracteres"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground hover:text-foreground"
              aria-label={
                showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
              }
            >
              {showPassword ? "Ocultar" : "Mostrar"}
            </button>
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">
            Rol
          </label>
          <select
            name="role"
            defaultValue="USER"
            className={inputClass}
          >
            <option value="USER">Usuario</option>
            <option value="ADMIN">Administrador</option>
          </select>
        </div>
      </div>

      {state?.error && (
        <p className="mt-3 text-sm text-destructive">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
      >
        {pending ? "Creando..." : "Crear usuario"}
      </button>
    </form>
  );
}
