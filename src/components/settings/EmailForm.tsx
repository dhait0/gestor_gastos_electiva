"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateEmailAction } from "@/app/actions/account";
import { initialAccountState } from "./account-state";
import { preventFormReset } from "@/lib/keep-form-on-error";
import { FieldError, FormFeedback } from "./FormFeedback";

export function EmailForm({ currentEmail }: { currentEmail: string }) {
  const [state, formAction, isPending] = useActionState(updateEmailAction, initialAccountState);

  return (
    <form action={formAction} onReset={preventFormReset} className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Correo actual: <span className="font-medium text-foreground">{currentEmail}</span>
      </p>
      <div>
        <Label htmlFor="email">Nuevo correo</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required disabled={isPending} aria-describedby="email-error" placeholder="nuevo@correo.com" />
        <FieldError state={state} name="email" />
        <p className="mt-1 text-xs text-muted-foreground">Te enviaremos un enlace de confirmación. El cambio se aplica cuando lo abras.</p>
      </div>
      <FormFeedback state={state} />
      <Button type="submit" variant="outline" disabled={isPending}>
        {isPending ? "Enviando..." : "Cambiar correo"}
      </Button>
    </form>
  );
}
