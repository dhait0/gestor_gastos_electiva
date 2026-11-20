"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfileSettingsAction } from "@/app/actions/account";
import { initialAccountState } from "./account-state";
import { CURRENCIES, TIMEZONES } from "@/lib/profile-options";
import { preventFormReset } from "@/lib/keep-form-on-error";
import { FieldError, FormFeedback } from "./FormFeedback";

const selectClass =
  "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function ProfileForm({
  profile,
}: {
  profile: { displayName: string; currencyCode: string; timezone: string; safetyReserve: number };
}) {
  const [state, formAction, isPending] = useActionState(updateProfileSettingsAction, initialAccountState);

  return (
    <form action={formAction} onReset={preventFormReset} className="space-y-4">
      <div>
        <Label htmlFor="displayName">Nombre</Label>
        <Input id="displayName" name="displayName" defaultValue={profile.displayName} maxLength={100} required disabled={isPending} aria-describedby="displayName-error" />
        <FieldError state={state} name="displayName" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="currencyCode">Moneda principal</Label>
          <select id="currencyCode" name="currencyCode" defaultValue={profile.currencyCode} disabled={isPending} className={selectClass} aria-describedby="currencyCode-help currencyCode-error">
            {CURRENCIES.map((currency) => (
              <option key={currency.code} value={currency.code}>
                {currency.label}
              </option>
            ))}
          </select>
          <FieldError state={state} name="currencyCode" />
          <p id="currencyCode-help" className="mt-1 text-xs text-muted-foreground">
            Los totales se calculan en esta moneda. Solo se puede cambiar si todas tus cuentas están en la nueva.
          </p>
        </div>
        <div>
          <Label htmlFor="timezone">Zona horaria</Label>
          <select id="timezone" name="timezone" defaultValue={profile.timezone} disabled={isPending} className={selectClass}>
            {TIMEZONES.map((timezone) => (
              <option key={timezone.value} value={timezone.value}>
                {timezone.label}
              </option>
            ))}
          </select>
          <FieldError state={state} name="timezone" />
          <p className="mt-1 text-xs text-muted-foreground">Define qué día es «hoy» para tus fechas y recurrentes.</p>
        </div>
      </div>

      <div>
        <Label htmlFor="safetyReserve">Reserva de seguridad</Label>
        <Input id="safetyReserve" name="safetyReserve" type="number" inputMode="decimal" min="0" step="1" defaultValue={profile.safetyReserve} disabled={isPending} aria-describedby="safetyReserve-help safetyReserve-error" />
        <FieldError state={state} name="safetyReserve" />
        <p id="safetyReserve-help" className="mt-1 text-xs text-muted-foreground">
          Un colchón que no quieres tocar: se descuenta de tu dinero disponible.
        </p>
      </div>

      <FormFeedback state={state} />
      <Button type="submit" disabled={isPending}>
        {isPending ? "Guardando..." : "Guardar perfil"}
      </Button>
    </form>
  );
}
