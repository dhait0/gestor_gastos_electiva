"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createRecurringAction } from "@/app/actions/recurring";
import { getAccountsAction } from "@/app/actions/accounts";
import { getCategoriesByTypeAction } from "@/app/actions/categories";
import { FREQUENCY_LABELS } from "@/domain/recurrence";

const initialState = { error: undefined, data: undefined };
const selectClass =
  "flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

interface Option {
  id: string;
  name: string;
}

export default function NuevoRecurrentePage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(createRecurringAction, initialState);
  const [type, setType] = useState<"INCOME" | "EXPENSE">("EXPENSE");
  const [frequency, setFrequency] = useState("MONTHLY");
  const [accounts, setAccounts] = useState<Option[]>([]);
  const [categories, setCategories] = useState<Option[]>([]);

  useEffect(() => {
    getAccountsAction().then((res) => {
      if ("data" in res && res.data) setAccounts(res.data);
    });
  }, []);

  useEffect(() => {
    getCategoriesByTypeAction(type).then((res) => {
      if ("data" in res && res.data) setCategories(res.data);
    });
  }, [type]);

  const created = "data" in state && !!state.data;
  useEffect(() => {
    if (created) {
      router.push("/recurrentes");
      router.refresh();
    }
  }, [created, router]);

  const fieldError = (field: string) =>
    "error" in state && state.error && typeof state.error === "object" ? state.error[field]?.[0] : undefined;
  const generalError = "error" in state && typeof state.error === "string" ? state.error : undefined;
  const today = new Date().toISOString().split("T")[0];

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <form action={formAction} className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold text-foreground font-heading">Nuevo movimiento recurrente</h1>

        <div>
          <Label htmlFor="name">Nombre *</Label>
          <Input id="name" name="name" required maxLength={100} disabled={isPending} placeholder="Ej: Arriendo" />
          {fieldError("name") && <p className="mt-1 text-sm text-destructive" role="alert">{fieldError("name")}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="type">Tipo *</Label>
            <select id="type" name="type" value={type} onChange={(e) => setType(e.target.value as "INCOME" | "EXPENSE")} className={selectClass} disabled={isPending}>
              <option value="EXPENSE">Gasto</option>
              <option value="INCOME">Ingreso</option>
            </select>
          </div>
          <div>
            <Label htmlFor="amount">Monto *</Label>
            <Input id="amount" name="amount" type="number" step="0.01" min="0.01" required disabled={isPending} className="tabular-nums" />
            {fieldError("amount") && <p className="mt-1 text-sm text-destructive" role="alert">{fieldError("amount")}</p>}
          </div>
          <div>
            <Label htmlFor="account_id">Cuenta *</Label>
            <select id="account_id" name="account_id" required defaultValue="" className={selectClass} disabled={isPending}>
              <option value="" disabled>Selecciona una cuenta</option>
              {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
            {fieldError("account_id") && <p className="mt-1 text-sm text-destructive" role="alert">{fieldError("account_id")}</p>}
          </div>
          <div>
            <Label htmlFor="category_id">Categoría *</Label>
            <select id="category_id" name="category_id" key={type} required defaultValue="" className={selectClass} disabled={isPending}>
              <option value="" disabled>Selecciona una categoría</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {fieldError("category_id") && <p className="mt-1 text-sm text-destructive" role="alert">{fieldError("category_id")}</p>}
          </div>
          <div>
            <Label htmlFor="frequency">Frecuencia *</Label>
            <select id="frequency" name="frequency" value={frequency} onChange={(e) => setFrequency(e.target.value)} className={selectClass} disabled={isPending}>
              {Object.entries(FREQUENCY_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </div>
          {frequency === "CUSTOM" && (
            <div>
              <Label htmlFor="custom_interval_days">Cada cuántos días *</Label>
              <Input id="custom_interval_days" name="custom_interval_days" type="number" min="1" step="1" required disabled={isPending} />
              {fieldError("custom_interval_days") && <p className="mt-1 text-sm text-destructive" role="alert">{fieldError("custom_interval_days")}</p>}
            </div>
          )}
          <div>
            <Label htmlFor="start_date">Primera fecha *</Label>
            <Input id="start_date" name="start_date" type="date" required defaultValue={today} disabled={isPending} />
            {fieldError("start_date") && <p className="mt-1 text-sm text-destructive" role="alert">{fieldError("start_date")}</p>}
          </div>
        </div>

        <label className="flex items-start gap-3 text-sm">
          <input type="checkbox" name="is_automatic" className="mt-1" disabled={isPending} />
          <span>
            <span className="font-medium text-foreground">Registrar automáticamente</span>
            <span className="block text-muted-foreground">
              Al abrir esta sección se registran los movimientos vencidos. No se ejecuta ningún pago externo.
            </span>
          </span>
        </label>

        {generalError && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive" role="alert">
            {generalError}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Link href="/recurrentes">
            <Button type="button" variant="outline" disabled={isPending}>Cancelar</Button>
          </Link>
          <Button type="submit" disabled={isPending}>{isPending ? "Guardando..." : "Crear recurrente"}</Button>
        </div>
      </form>
    </main>
  );
}
