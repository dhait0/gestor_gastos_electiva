"use client";

import { preventFormReset } from "@/lib/keep-form-on-error";
import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createTransferAction } from "@/app/actions/transactions";
import { getAccountsAction } from "@/app/actions/accounts";

const initialState = { error: undefined, data: undefined };
const selectClass =
  "flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

interface AccountOption {
  id: string;
  name: string;
  type: string;
  currency_code: string;
}

export default function TransferirPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(createTransferAction, initialState);
  const [accounts, setAccounts] = useState<AccountOption[]>([]);
  const [fromId, setFromId] = useState("");
  const [toId, setToId] = useState("");

  useEffect(() => {
    getAccountsAction().then((r) => {
      if ("data" in r && r.data) setAccounts(r.data);
    });
  }, []);

  const done = "data" in state && !!state.data;
  useEffect(() => {
    if (done) {
      router.push("/transacciones");
      router.refresh();
    }
  }, [done, router]);

  const from = accounts.find((a) => a.id === fromId);
  // Solo se ofrecen cuentas destino distintas y de la misma moneda (no hay conversión en V1)
  const destinations = accounts.filter((a) => a.id !== fromId && (!from || a.currency_code === from.currency_code));
  const toIsCard = accounts.find((a) => a.id === toId)?.type === "CREDIT_CARD";

  const fieldError = (field: string) =>
    "error" in state && state.error && typeof state.error === "object" ? state.error[field]?.[0] : undefined;
  const generalError = "error" in state && typeof state.error === "string" ? state.error : undefined;
  const today = new Date().toISOString().split("T")[0];

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <form action={formAction} onReset={preventFormReset} className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold text-foreground font-heading">Transferir entre cuentas</h1>
        <p className="text-sm text-muted-foreground">
          Mover dinero entre tus cuentas no cambia tu patrimonio. Solo se permiten cuentas de la misma moneda.
        </p>
        <input type="hidden" name="currency_code" value={from?.currency_code ?? "COP"} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="from_account_id">Desde *</Label>
            <select
              id="from_account_id"
              name="from_account_id"
              required
              value={fromId}
              onChange={(e) => {
                setFromId(e.target.value);
                setToId("");
              }}
              className={selectClass}
              disabled={isPending}
            >
              <option value="" disabled>Selecciona la cuenta de origen</option>
              {accounts.map((a) => <option key={a.id} value={a.id}>{a.name} ({a.currency_code})</option>)}
            </select>
            {fieldError("from_account_id") && <p className="mt-1 text-sm text-destructive" role="alert">{fieldError("from_account_id")}</p>}
          </div>
          <div>
            <Label htmlFor="to_account_id">Hacia *</Label>
            <select
              id="to_account_id"
              name="to_account_id"
              required
              value={toId}
              onChange={(e) => setToId(e.target.value)}
              className={selectClass}
              disabled={isPending || !fromId}
            >
              <option value="" disabled>{fromId ? "Selecciona la cuenta de destino" : "Elige primero el origen"}</option>
              {destinations.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
            {fieldError("to_account_id") && <p className="mt-1 text-sm text-destructive" role="alert">{fieldError("to_account_id")}</p>}
            {toIsCard && <p className="mt-1 text-xs text-muted-foreground">Transferir a una tarjeta de crédito reduce su deuda.</p>}
          </div>
          <div>
            <Label htmlFor="amount">Monto *</Label>
            <Input id="amount" name="amount" type="number" step="0.01" min="0.01" required disabled={isPending} className="tabular-nums" />
            {fieldError("amount") && <p className="mt-1 text-sm text-destructive" role="alert">{fieldError("amount")}</p>}
          </div>
          <div>
            <Label htmlFor="transaction_date">Fecha *</Label>
            <Input id="transaction_date" name="transaction_date" type="date" required defaultValue={today} disabled={isPending} />
            {fieldError("transaction_date") && <p className="mt-1 text-sm text-destructive" role="alert">{fieldError("transaction_date")}</p>}
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="description">Descripción *</Label>
            <Input id="description" name="description" required maxLength={200} defaultValue="Transferencia" disabled={isPending} />
            {fieldError("description") && <p className="mt-1 text-sm text-destructive" role="alert">{fieldError("description")}</p>}
          </div>
        </div>

        {generalError && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive" role="alert">
            {generalError}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Link href="/transacciones">
            <Button type="button" variant="outline" disabled={isPending}>Cancelar</Button>
          </Link>
          <Button type="submit" disabled={isPending}>{isPending ? "Transfiriendo..." : "Transferir"}</Button>
        </div>
      </form>
    </main>
  );
}
