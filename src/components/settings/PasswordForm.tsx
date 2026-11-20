"use client";

import { useActionState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { changePasswordAction } from "@/app/actions/account";
import { initialAccountState } from "./account-state";
import { preventFormReset } from "@/lib/keep-form-on-error";
import { FieldError, FormFeedback } from "./FormFeedback";

export function PasswordForm() {
  const [state, formAction, isPending] = useActionState(changePasswordAction, initialAccountState);
  const formRef = useRef<HTMLFormElement>(null);

  // Tras un cambio exitoso las contraseñas escritas no deben quedarse en pantalla.
  useEffect(() => {
    if (state.success) formRef.current?.querySelectorAll("input").forEach((input) => (input.value = ""));
  }, [state]);

  return (
    <form ref={formRef} action={formAction} onReset={preventFormReset} className="space-y-4">
      <div>
        <Label htmlFor="currentPassword">Contraseña actual</Label>
        <Input id="currentPassword" name="currentPassword" type="password" autoComplete="current-password" required disabled={isPending} aria-describedby="currentPassword-error" />
        <FieldError state={state} name="currentPassword" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="password">Nueva contraseña</Label>
          <Input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required disabled={isPending} aria-describedby="password-error" />
          <FieldError state={state} name="password" />
        </div>
        <div>
          <Label htmlFor="confirmPassword">Confirmar nueva contraseña</Label>
          <Input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" minLength={8} required disabled={isPending} aria-describedby="confirmPassword-error" />
          <FieldError state={state} name="confirmPassword" />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">Mínimo 8 caracteres.</p>
      <FormFeedback state={state} />
      <Button type="submit" variant="outline" disabled={isPending}>
        {isPending ? "Cambiando..." : "Cambiar contraseña"}
      </Button>
    </form>
  );
}
