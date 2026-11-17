import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { getDebtsAction } from "@/app/actions/debts";
import { STRATEGY_LABELS, orderDebts, planDebtPayoff, type DebtStrategy } from "@/domain/debt-strategies";

function parseStrategy(v: string | string[] | undefined): DebtStrategy {
  return (Array.isArray(v) ? v[0] : v) === "AVALANCHE" ? "AVALANCHE" : "SNOWBALL";
}

export default async function EstrategiaDeudasPage({
  searchParams,
}: {
  searchParams: Promise<{ strategy?: string | string[]; budget?: string | string[] }>;
}) {
  const params = await searchParams;
  const strategy = parseStrategy(params.strategy);
  const result = await getDebtsAction();

  if ("error" in result) {
    return (
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-3xl rounded-xl border border-destructive/50 bg-destructive/10 p-6 text-center">
          <p className="text-destructive">Error al cargar las deudas: {result.error}</p>
        </div>
      </main>
    );
  }

  const { currencyCode } = result.data;
  const money = (v: string | number | { toString(): string }) => formatCurrency(Number(v.toString()), currencyCode);
  const active = result.data.debts.filter((d) => d.status === "ACTIVE" && d.currency_code === currencyCode);
  const minimums = active.reduce((s, d) => s + Number(d.minimum_payment), 0);

  const rawBudget = Array.isArray(params.budget) ? params.budget[0] : params.budget;
  const budgetNumber = Number(rawBudget);
  const budget = rawBudget && Number.isFinite(budgetNumber) && budgetNumber > 0 ? budgetNumber : minimums;

  const ordered = orderDebts(active, strategy);
  const plan = active.length > 0 ? planDebtPayoff(active, budget, strategy) : null;
  const other = strategy === "SNOWBALL" ? "AVALANCHE" : "SNOWBALL";
  const otherPlan = active.length > 0 ? planDebtPayoff(active, budget, other) : null;

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <Link href="/deudas" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" />
          Deudas
        </Link>

        <header>
          <h1 className="text-2xl font-bold text-foreground font-heading">Estrategia de pago</h1>
          <p className="mt-1 text-muted-foreground">Un orden sugerido para liquidar tus deudas. No se ejecuta ningún pago.</p>
        </header>

        {active.length === 0 ? (
          <p className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">No tienes deudas activas en tu moneda base.</p>
        ) : (
          <>
            <form method="get" className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-xl border border-border bg-card p-4">
              <div>
                <label htmlFor="strategy" className="text-sm font-medium">Estrategia</label>
                <select id="strategy" name="strategy" defaultValue={strategy} className="mt-1 flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm">
                  {(Object.keys(STRATEGY_LABELS) as DebtStrategy[]).map((s) => <option key={s} value={s}>{STRATEGY_LABELS[s]}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="budget" className="text-sm font-medium">Presupuesto mensual para deudas</label>
                <input id="budget" name="budget" type="number" min="1" step="0.01" defaultValue={budget} className="mt-1 flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm tabular-nums" />
              </div>
              <div className="flex items-end">
                <button type="submit" className="h-10 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground">Calcular</button>
              </div>
            </form>

            <section aria-labelledby="order-heading" className="space-y-3">
              <h2 id="order-heading" className="text-lg font-semibold text-foreground">Orden de ataque</h2>
              <ol className="space-y-2">
                {ordered.map((d, i) => (
                  <li key={d.id} className="flex items-baseline justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm">
                    <span className="font-medium text-foreground">{i + 1}. {d.name}</span>
                    <span className="tabular-nums text-muted-foreground">{money(d.current_balance)} · {d.interest_rate_percent}% anual</span>
                  </li>
                ))}
              </ol>
            </section>

            <section aria-labelledby="plan-heading" className="space-y-3">
              <h2 id="plan-heading" className="text-lg font-semibold text-foreground">Resultado estimado</h2>
              {plan === null ? (
                <p className="rounded-xl border border-border bg-card p-4 text-sm text-warning">
                  Con {money(budget)} al mes no alcanzas a cubrir los pagos mínimos ({money(minimums)}) o los intereses. Sube el presupuesto.
                </p>
              ) : (
                <div className="rounded-xl border border-border bg-card p-4 space-y-2 text-sm">
                  <p>Terminarías en <strong>{plan.months}</strong> {plan.months === 1 ? "mes" : "meses"} y pagarías <strong>{money(plan.totalInterest.toDecimalPlaces(2))}</strong> de intereses.</p>
                  <ul className="text-muted-foreground">
                    {plan.order.map((o) => <li key={o.id}>{o.name}: liquidada en el mes {o.paidOffMonth}</li>)}
                  </ul>
                  {otherPlan && (
                    <p className="text-xs text-muted-foreground">
                      Con {STRATEGY_LABELS[other].split(" (")[0].toLowerCase()}: {otherPlan.months} meses y {money(otherPlan.totalInterest.toDecimalPlaces(2))} de intereses.
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">Estimación con interés mensual = saldo × tasa anual ÷ 12; no incluye comisiones.</p>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
