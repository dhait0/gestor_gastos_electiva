"use client";

import { preventFormReset } from "@/lib/keep-form-on-error";
import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createDebtAction } from "@/app/actions/debts";
import { getAccountsAction } from "@/app/actions/accounts";

const initialState = { error: undefined, data: undefined };
const selectClass =
  "flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

const TYPES = [
  ["PERSONAL_LOAN", "Préstamo personal"],
  ["CREDIT_CARD", "Tarjeta de crédito"],
  ["STUDENT_LOAN", "Crédito educativo"],
  ["MORTGAGE", "Hipoteca"],
  ["OTHER", "Otra"],
] as const;

interface AccountOption { id: string; name: string; type: string; }

export default function NuevaDeudaPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(createDebtAction, initialState);
  const [accounts, setAccounts] = useState<AccountOption[]>([]);
  const [selectedType, setSelectedType] = useState("PERSONAL_LOAN");

  useEffect(() => {
    getAccountsAction().then((r) => {
      if ("data" in r && r.data) setAccounts(r.data);
    });
  }, []);

  const createdId = "data" in state && state.data ? state.data.id : undefined;
  useEffect(() => {
    if (createdId) {
      router.push(`/deudas/${createdId}`);
      router.refresh();
    }
  }, [createdId, router]);

  const fieldError = (field: string) =>
    "error" in state && state.error && typeof state.error === "object" ? state.error[field]?.[0] : undefined;
  const generalError = "error" in state && typeof state.error === "string" ? state.error : undefined;

  const numberField = (id: string, label: string, props: { required?: boolean; defaultValue?: string; step?: string; min?: string } = {}) => (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} name={id} type="number" step={props.step ?? "0.01"} min={props.min ?? "0"} required={props.required} defaultValue={props.defaultValue} disabled={isPending} className="tabular-nums" />
      {fieldError(id) && <p className="mt-1 text-sm text-destructive" role="alert">{fieldError(id)}</p>}
    </div>
  );

  // Cuentas compatibles con el tipo de deuda seleccionado
  const compatibleAccounts = accounts.filter((a) => {
    if (selectedType === "CREDIT_CARD") return a.type === "CREDIT_CARD";
    if (selectedType === "MORTGAGE") return a.type === "SAVINGS" || a.type === "CHECKING";
    return true;
  });

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <form action={formAction} onReset={preventFormReset} className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold text-foreground font-heading">Nueva deuda</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Nombre *</Label>
            <Input id="name" name="name" required maxLength={100} disabled={isPending} placeholder="Ej: Tarjeta Bancolombia" />
            {fieldError("name") && <p className="mt-1 text-sm text-destructive" role="alert">{fieldError("name")}</p>}
          </div>
          <div>
            <Label htmlFor="type">Tipo *</Label>
            <select
              id="type"
              name="type"
              defaultValue="PERSONAL_LOAN"
              className={selectClass}
              disabled={isPending}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              {TYPES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </div>

          {/* Selector de cuenta vinculada */}
          <div className="sm:col-span-2">
            <Label htmlFor="account_id">
              Cuenta vinculada
              <span className="ml-1 text-xs text-muted-foreground font-normal">
                {selectedType === "CREDIT_CARD" ? "(tarjeta de crédito asociada)" : "(opcional)"}
              </span>
            </Label>
            <select id="account_id" name="account_id" className={selectClass} disabled={isPending}>
              <option value="">Sin cuenta vinculada</option>
              {compatibleAccounts.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
            {selectedType === "CREDIT_CARD" && (
              <p className="mt-1 text-xs text-muted-foreground">
                Al vincular la tarjeta, los gastos registrados en esa cuenta se reflejarán en esta deuda.
              </p>
            )}
          </div>

          {numberField("original_amount", "Monto original / cupo total *", { required: true, min: "0.01" })}
          {numberField("current_balance", "Saldo pendiente (si ya pagaste parte)")}
          {numberField("interest_rate_percent", "Tasa de interés mensual %", { defaultValue: "0", step: "0.01" })}
          {numberField("minimum_payment", "Pago mínimo mensual", { defaultValue: "0" })}
          {numberField("payment_day", "Día de pago (1-31)", { step: "1", min: "1" })}
        </div>

        {generalError && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive" role="alert">
            {generalError}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Link href="/deudas">
            <Button type="button" variant="outline" disabled={isPending}>Cancelar</Button>
          </Link>
          <Button type="submit" disabled={isPending}>{isPending ? "Guardando..." : "Crear deuda"}</Button>
        </div>
      </form>
    </main>
  );
}
