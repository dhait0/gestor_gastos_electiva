"use client";

import { preventFormReset } from "@/lib/keep-form-on-error";
import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateDebtAction, getDebtDetailAction } from "@/app/actions/debts";
import { getAccountsAction } from "@/app/actions/accounts";

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
interface DebtData {
  id: string; name: string; type: string;
  original_amount: string; current_balance: string;
  interest_rate_percent: string; minimum_payment: string;
  payment_day: number | null; account_id: string | null;
}

export default function EditarDeudaPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const updateAction = updateDebtAction.bind(null, id);
  const [state, formAction, isPending] = useActionState(updateAction, { error: undefined, data: undefined });

  const [debt, setDebt] = useState<DebtData | null>(null);
  const [accounts, setAccounts] = useState<AccountOption[]>([]);
  const [selectedType, setSelectedType] = useState("PERSONAL_LOAN");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getDebtDetailAction(id),
      getAccountsAction(),
    ]).then(([debtRes, accRes]) => {
      if ("data" in debtRes && debtRes.data) {
        setDebt(debtRes.data.debt);
        setSelectedType(debtRes.data.debt.type);
      }
      if ("data" in accRes && accRes.data) setAccounts(accRes.data);
      setLoading(false);
    });
  }, [id]);

  const updated = "data" in state && !!state.data;
  useEffect(() => {
    if (updated) {
      router.push(`/deudas/${id}`);
      router.refresh();
    }
  }, [updated, id, router]);

  const fieldError = (field: string) =>
    "error" in state && state.error && typeof state.error === "object" ? (state.error as Record<string, string[]>)[field]?.[0] : undefined;
  const generalError = "error" in state && typeof state.error === "string" ? state.error : undefined;

  const compatibleAccounts = accounts.filter((a) => {
    if (selectedType === "CREDIT_CARD") return a.type === "CREDIT_CARD";
    if (selectedType === "MORTGAGE") return a.type === "SAVINGS" || a.type === "CHECKING";
    return true;
  });

  if (loading) {
    return (
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-2xl">
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </main>
    );
  }

  if (!debt) {
    return (
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-2xl">
          <p className="text-destructive">Deuda no encontrada.</p>
          <Link href="/deudas" className="text-sm text-primary underline">Volver a deudas</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <form action={formAction} onReset={preventFormReset} className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold text-foreground font-heading">Editar deuda</h1>
        <p className="text-sm text-muted-foreground -mt-4">{debt.name}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Nombre *</Label>
            <Input id="name" name="name" required maxLength={100} disabled={isPending} defaultValue={debt.name} />
            {fieldError("name") && <p className="mt-1 text-sm text-destructive" role="alert">{fieldError("name")}</p>}
          </div>
          <div>
            <Label htmlFor="type">Tipo *</Label>
            <select
              id="type" name="type" className={selectClass}
              defaultValue={debt.type} disabled={isPending}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              {TYPES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="account_id">
              Cuenta vinculada
              <span className="ml-1 text-xs text-muted-foreground font-normal">
                {selectedType === "CREDIT_CARD" ? "(tarjeta de crédito asociada)" : "(opcional)"}
              </span>
            </Label>
            <select id="account_id" name="account_id" className={selectClass} disabled={isPending} defaultValue={debt.account_id ?? ""}>
              <option value="">Sin cuenta vinculada</option>
              {compatibleAccounts.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="original_amount">Monto original / cupo total *</Label>
            <Input id="original_amount" name="original_amount" type="number" step="0.01" min="0.01" required
              disabled={isPending} defaultValue={debt.original_amount} className="tabular-nums" />
            {fieldError("original_amount") && <p className="mt-1 text-sm text-destructive" role="alert">{fieldError("original_amount")}</p>}
          </div>

          <div>
            <Label htmlFor="current_balance">Saldo pendiente actual</Label>
            <Input id="current_balance" name="current_balance" type="number" step="0.01" min="0"
              disabled={isPending} defaultValue={debt.current_balance} className="tabular-nums" />
            <p className="mt-1 text-xs text-muted-foreground">Lo que realmente debés hoy</p>
            {fieldError("current_balance") && <p className="mt-1 text-sm text-destructive" role="alert">{fieldError("current_balance")}</p>}
          </div>

          <div>
            <Label htmlFor="interest_rate_percent">Tasa de interés mensual %</Label>
            <Input id="interest_rate_percent" name="interest_rate_percent" type="number" step="0.01" min="0"
              disabled={isPending} defaultValue={debt.interest_rate_percent} className="tabular-nums" />
            {fieldError("interest_rate_percent") && <p className="mt-1 text-sm text-destructive" role="alert">{fieldError("interest_rate_percent")}</p>}
          </div>

          <div>
            <Label htmlFor="minimum_payment">Pago mínimo mensual</Label>
            <Input id="minimum_payment" name="minimum_payment" type="number" step="0.01" min="0"
              disabled={isPending} defaultValue={debt.minimum_payment} className="tabular-nums" />
            {fieldError("minimum_payment") && <p className="mt-1 text-sm text-destructive" role="alert">{fieldError("minimum_payment")}</p>}
          </div>

          <div>
            <Label htmlFor="payment_day">Día de pago (1–31)</Label>
            <Input id="payment_day" name="payment_day" type="number" step="1" min="1" max="31"
              disabled={isPending} defaultValue={debt.payment_day ?? ""} className="tabular-nums" />
            {fieldError("payment_day") && <p className="mt-1 text-sm text-destructive" role="alert">{fieldError("payment_day")}</p>}
          </div>
        </div>

        {generalError && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive" role="alert">
            {generalError}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Link href={`/deudas/${id}`}>
            <Button type="button" variant="outline" disabled={isPending}>Cancelar</Button>
          </Link>
          <Button type="submit" disabled={isPending}>{isPending ? "Guardando..." : "Guardar cambios"}</Button>
        </div>
      </form>
    </main>
  );
}
