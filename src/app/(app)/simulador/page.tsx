"use client";

import { preventFormReset } from "@/lib/keep-form-on-error";
import { useActionState, useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";
import { simulatePurchaseAction } from "@/app/actions/analysis";
import { getAccountsAction } from "@/app/actions/accounts";
import { getCategoriesByTypeAction } from "@/app/actions/categories";

const initialState = { error: undefined, data: undefined };
const selectClass =
  "flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

interface Option {
  id: string;
  name: string;
}

const STATUS_LABEL: Record<string, string> = { NORMAL: "Va bien", WARNING: "Atención", HIGH: "Casi al límite", EXCEEDED: "Superado" };

export default function SimuladorPage() {
  const [state, formAction, isPending] = useActionState(simulatePurchaseAction, initialState);
  const [accounts, setAccounts] = useState<Option[]>([]);
  const [categories, setCategories] = useState<Option[]>([]);

  useEffect(() => {
    getAccountsAction().then((r) => {
      if ("data" in r && r.data) setAccounts(r.data);
    });
    getCategoriesByTypeAction("EXPENSE").then((r) => {
      if ("data" in r && r.data) setCategories(r.data);
    });
  }, []);

  const fieldError = (field: string) =>
    "error" in state && state.error && typeof state.error === "object" ? state.error[field]?.[0] : undefined;
  const generalError = "error" in state && typeof state.error === "string" ? state.error : undefined;
  const result = "data" in state ? state.data : undefined;
  const money = (v: string) => (result ? formatCurrency(Number(v), result.currencyCode) : v);

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <header>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-heading">Simulador de compra</h1>
          <p className="mt-1 text-muted-foreground">Mira cómo cambiaría tu dinero antes de gastar. No se guarda nada.</p>
        </header>

        <form action={formAction} onReset={preventFormReset} className="space-y-4 rounded-xl border border-border bg-card p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="amount">Monto de la compra *</Label>
              <Input id="amount" name="amount" type="number" step="0.01" min="0.01" required disabled={isPending} className="tabular-nums" />
              {fieldError("amount") && <p className="mt-1 text-sm text-destructive" role="alert">{fieldError("amount")}</p>}
            </div>
            <div>
              <Label htmlFor="account_id">Pagarías con *</Label>
              <select id="account_id" name="account_id" required defaultValue="" className={selectClass} disabled={isPending}>
                <option value="" disabled>Selecciona una cuenta</option>
                {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
              {fieldError("account_id") && <p className="mt-1 text-sm text-destructive" role="alert">{fieldError("account_id")}</p>}
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="category_id">Categoría (opcional, para ver tu presupuesto)</Label>
              <select id="category_id" name="category_id" defaultValue="" className={selectClass} disabled={isPending}>
                <option value="">Sin categoría</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          {generalError && <p className="text-sm text-destructive" role="alert">{generalError}</p>}
          <Button type="submit" disabled={isPending}>{isPending ? "Simulando..." : "Simular"}</Button>
        </form>

        {result && (
          <section aria-labelledby="result-heading" className="space-y-4 rounded-xl border border-border bg-card p-5">
            <h2 id="result-heading" className="text-lg font-semibold text-foreground">Antes y después</h2>
            <p className="text-xs text-muted-foreground">Simulación: no se registró ningún movimiento.</p>

            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground">
                <tr><th scope="col" className="py-1 font-medium"> </th><th scope="col" className="py-1 font-medium">Antes</th><th scope="col" className="py-1 font-medium">Después</th></tr>
              </thead>
              <tbody className="tabular-nums">
                <tr><th scope="row" className="py-1 text-left font-normal text-muted-foreground">Saldo líquido</th><td>{money(result.liquidBefore)}</td><td>{money(result.liquidAfter)}</td></tr>
                <tr><th scope="row" className="py-1 text-left font-normal text-muted-foreground">Disponible</th><td>{money(result.availableBefore)}</td><td className="font-semibold">{money(result.availableAfter)}</td></tr>
                {result.projectedEndLiquidAfter !== null && (
                  <tr><th scope="row" className="py-1 text-left font-normal text-muted-foreground">Cierre de mes (estimado)</th><td>—</td><td>{money(result.projectedEndLiquidAfter)}</td></tr>
                )}
                {result.budget && (
                  <tr>
                    <th scope="row" className="py-1 text-left font-normal text-muted-foreground">Presupuesto</th>
                    <td>{result.budget.percentBefore}% · {STATUS_LABEL[result.budget.statusBefore]}</td>
                    <td>{result.budget.percentAfter}% · {STATUS_LABEL[result.budget.statusAfter]}</td>
                  </tr>
                )}
              </tbody>
            </table>

            {result.warnings.length > 0 ? (
              <ul className="space-y-2" role="list">
                {result.warnings.map((w) => (
                  <li key={w} className="flex items-start gap-2 text-sm text-warning">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-success">Esta compra cabe en tu situación actual.</p>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
