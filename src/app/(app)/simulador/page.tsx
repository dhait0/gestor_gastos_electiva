"use client";

import { preventFormReset } from "@/lib/keep-form-on-error";
import { useActionState, useEffect, useState, useId } from "react";
import { AlertTriangle, TrendingDown, Calculator } from "lucide-react";
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

interface Option { id: string; name: string; }

const STATUS_LABEL: Record<string, string> = { NORMAL: "Va bien", WARNING: "Atención", HIGH: "Casi al límite", EXCEEDED: "Superado" };

type Tab = "compra" | "cuotas" | "salida";

// --- Cálculos de crédito (cliente, sin persistir) ---

function calcCuotas(principal: number, monthlyRatePct: number, months: number) {
  if (principal <= 0 || months <= 0) return null;
  if (monthlyRatePct <= 0) {
    const pmt = principal / months;
    return { pmt, total: pmt * months, interest: 0 };
  }
  const r = monthlyRatePct / 100;
  const pmt = (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
  const total = pmt * months;
  return { pmt, total, interest: total - principal };
}

function calcPayoff(balance: number, monthlyRatePct: number, payment: number): number | null {
  if (balance <= 0 || payment <= 0) return null;
  const r = monthlyRatePct / 100;
  if (r <= 0) return Math.ceil(balance / payment);
  // Si el pago no cubre ni los intereses → nunca termina
  const minInterest = balance * r;
  if (payment <= minInterest) return null;
  return Math.ceil(Math.log(payment / (payment - balance * r)) / Math.log(1 + r));
}

function monthsToLabel(months: number): string {
  if (months < 1) return "< 1 mes";
  const y = Math.floor(months / 12);
  const m = months % 12;
  const parts: string[] = [];
  if (y > 0) parts.push(`${y} año${y > 1 ? "s" : ""}`);
  if (m > 0) parts.push(`${m} mes${m > 1 ? "es" : ""}`);
  return parts.join(" y ");
}

function fmt(n: number, currency = "COP") {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);
}

// --- Componente pestaña Crédito en cuotas ---
function TabCuotas() {
  const [principal, setPrincipal] = useState("");
  const [rate, setRate] = useState("3");
  const [months, setMonths] = useState("12");
  const id = useId();

  const p = Number(principal);
  const r = Number(rate);
  const n = Number(months);
  const result = p > 0 && n > 0 ? calcCuotas(p, r, n) : null;

  return (
    <div className="space-y-5 rounded-xl border border-border bg-card p-5">
      <div>
        <h2 className="text-base font-semibold text-foreground">Crédito en cuotas</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">Calculá cuánto pagarías en total y cada mes.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <Label htmlFor={`${id}-p`}>Monto a financiar *</Label>
          <Input id={`${id}-p`} type="number" min="1" step="1000" value={principal} onChange={(e) => setPrincipal(e.target.value)} className="tabular-nums" placeholder="Ej: 1500000" />
        </div>
        <div>
          <Label htmlFor={`${id}-r`}>Tasa mensual %</Label>
          <Input id={`${id}-r`} type="number" min="0" step="0.01" value={rate} onChange={(e) => setRate(e.target.value)} className="tabular-nums" placeholder="Ej: 3" />
        </div>
        <div>
          <Label htmlFor={`${id}-n`}>Cuotas (meses)</Label>
          <Input id={`${id}-n`} type="number" min="1" step="1" value={months} onChange={(e) => setMonths(e.target.value)} className="tabular-nums" placeholder="Ej: 12" />
        </div>
      </div>

      {result ? (
        <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-lg bg-background border border-border p-3">
              <p className="text-xs text-muted-foreground">Cuota mensual</p>
              <p className="mt-1 text-lg font-bold text-foreground tabular-nums">{fmt(result.pmt)}</p>
            </div>
            <div className="rounded-lg bg-background border border-border p-3">
              <p className="text-xs text-muted-foreground">Total a pagar</p>
              <p className="mt-1 text-lg font-bold text-foreground tabular-nums">{fmt(result.total)}</p>
            </div>
            <div className={`rounded-lg border p-3 ${result.interest > 0 ? "bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900" : "bg-background border-border"}`}>
              <p className="text-xs text-muted-foreground">Total en intereses</p>
              <p className={`mt-1 text-lg font-bold tabular-nums ${result.interest > 0 ? "text-orange-600 dark:text-orange-400" : "text-foreground"}`}>{fmt(result.interest)}</p>
            </div>
          </div>
          {result.interest > 0 && (
            <p className="text-xs text-muted-foreground text-center">
              Pagás {((result.interest / p) * 100).toFixed(1)}% más del valor real del artículo en intereses.
            </p>
          )}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-4">Ingresá el monto para ver el cálculo.</p>
      )}
    </div>
  );
}

// --- Componente pestaña ¿Cuándo salgo? ---
function TabSalida() {
  const [balance, setBalance] = useState("");
  const [rate, setRate] = useState("3");
  const [minPayment, setMinPayment] = useState("");
  const [extra, setExtra] = useState("0");
  const id = useId();

  const b = Number(balance);
  const r = Number(rate);
  const mp = Number(minPayment);
  const ex = Number(extra) || 0;

  const monthsMin = b > 0 && mp > 0 ? calcPayoff(b, r, mp) : null;
  const monthsWith = b > 0 && mp > 0 && ex > 0 ? calcPayoff(b, r, mp + ex) : null;

  return (
    <div className="space-y-5 rounded-xl border border-border bg-card p-5">
      <div>
        <h2 className="text-base font-semibold text-foreground">¿Cuándo salgo de esta deuda?</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">Calculá cuánto tiempo te falta para liquidar una deuda.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor={`${id}-b`}>Saldo pendiente *</Label>
          <Input id={`${id}-b`} type="number" min="1" step="1000" value={balance} onChange={(e) => setBalance(e.target.value)} className="tabular-nums" placeholder="Ej: 18000000" />
        </div>
        <div>
          <Label htmlFor={`${id}-r`}>Tasa mensual %</Label>
          <Input id={`${id}-r`} type="number" min="0" step="0.01" value={rate} onChange={(e) => setRate(e.target.value)} className="tabular-nums" placeholder="Ej: 3" />
        </div>
        <div>
          <Label htmlFor={`${id}-mp`}>Pago mensual actual *</Label>
          <Input id={`${id}-mp`} type="number" min="1" step="1000" value={minPayment} onChange={(e) => setMinPayment(e.target.value)} className="tabular-nums" placeholder="Ej: 500000" />
        </div>
        <div>
          <Label htmlFor={`${id}-ex`}>Abono extra mensual</Label>
          <Input id={`${id}-ex`} type="number" min="0" step="1000" value={extra} onChange={(e) => setExtra(e.target.value)} className="tabular-nums" placeholder="Ej: 200000" />
        </div>
      </div>

      {b > 0 && mp > 0 ? (
        <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
          {monthsMin === null ? (
            <p className="text-sm text-destructive font-medium text-center">
              Con ese pago no alcanzás a cubrir los intereses — la deuda nunca baja.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-lg bg-background border border-border p-3 text-center">
                <p className="text-xs text-muted-foreground">Solo con el pago actual</p>
                <p className="mt-1 text-lg font-bold text-foreground">{monthsToLabel(monthsMin)}</p>
                <p className="text-xs text-muted-foreground tabular-nums">{monthsMin} cuotas</p>
              </div>
              {monthsWith !== null ? (
                <div className="rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 p-3 text-center">
                  <p className="text-xs text-muted-foreground">Con abono extra de {fmt(ex)}</p>
                  <p className="mt-1 text-lg font-bold text-green-700 dark:text-green-400">{monthsToLabel(monthsWith)}</p>
                  <p className="text-xs text-muted-foreground tabular-nums">
                    Te ahorrás {monthsMin - monthsWith} {monthsMin - monthsWith === 1 ? "mes" : "meses"}
                  </p>
                </div>
              ) : (
                <div className="rounded-lg bg-background border border-border p-3 text-center flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">Ingresá un abono extra para ver la diferencia.</p>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-4">Ingresá el saldo y el pago mensual para calcular.</p>
      )}
    </div>
  );
}

// --- Página principal ---
export default function SimuladorPage() {
  const [state, formAction, isPending] = useActionState(simulatePurchaseAction, initialState);
  const [accounts, setAccounts] = useState<Option[]>([]);
  const [categories, setCategories] = useState<Option[]>([]);
  const [tab, setTab] = useState<Tab>("compra");

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

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "compra", label: "Compra directa", icon: <Calculator className="w-4 h-4" /> },
    { key: "cuotas", label: "Crédito en cuotas", icon: <TrendingDown className="w-4 h-4" /> },
    { key: "salida", label: "¿Cuándo salgo?", icon: <TrendingDown className="w-4 h-4" /> },
  ];

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <header>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-heading">Simulador</h1>
          <p className="mt-1 text-muted-foreground">Calculá antes de decidir. No se guarda nada.</p>
        </header>

        {/* Tabs */}
        <div role="tablist" className="flex gap-1 p-1 bg-muted/50 rounded-xl border border-border">
          {tabs.map(({ key, label, icon }) => (
            <button
              key={key}
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                tab === key
                  ? "bg-background text-foreground shadow-sm border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {icon}
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Tab: Compra directa */}
        {tab === "compra" && (
          <>
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
          </>
        )}

        {tab === "cuotas" && <TabCuotas />}
        {tab === "salida" && <TabSalida />}
      </div>
    </main>
  );
}
