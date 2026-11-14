import Link from "next/link";
import { Landmark, Plus } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { getDebtsAction } from "@/app/actions/debts";
import { GoalProgressBar } from "@/components/goals/GoalProgressBar";

const STATUS_LABEL = { ACTIVE: "Activa", PAID: "Pagada", PAUSED: "En pausa", CANCELLED: "Cancelada" } as const;

export default async function DeudasPage() {
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

  const { debts, totals, currencyCode } = result.data;

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-heading">Deudas</h1>
            <p className="mt-1 text-muted-foreground">Mira cuánto debes y cómo vas pagando</p>
          </div>
          <div className="flex flex-wrap gap-2">
          <Link
            href="/deudas/estrategia"
            className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg font-medium text-sm hover:bg-muted"
          >
            Estrategia de pago
          </Link>
          <Link
            href="/deudas/nueva"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm"
          >
            <Plus className="w-4 h-4" />
            Nueva deuda
          </Link>
          </div>
        </header>

        {totals.count > 0 && (
          <section aria-label="Resumen de deudas" className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground">Saldo pendiente total</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">{formatCurrency(Number(totals.balance), currencyCode)}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground">Pagos mínimos al mes</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">{formatCurrency(Number(totals.minimumPayments), currencyCode)}</p>
            </div>
          </section>
        )}

        {debts.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <Landmark className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-medium text-foreground">No tienes deudas registradas</h2>
            <p className="mt-1 text-sm text-muted-foreground max-w-xs mx-auto">
              Si debes dinero, regístralo para seguir tus abonos hasta liquidarlo.
            </p>
          </div>
        ) : (
          <ul className="space-y-3" role="list">
            {debts.map((d) => (
              <li key={d.id}>
                <Link href={`/deudas/${d.id}`} className="block rounded-xl border border-border bg-card p-4 hover:border-primary/40 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="font-medium text-foreground">{d.name}</h2>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{STATUS_LABEL[d.status]}</span>
                  </div>
                  <div className="mt-3">
                    <GoalProgressBar percent={d.paidPercent} label={`${d.name}: ${d.paidPercent}% pagado`} />
                  </div>
                  <p className="mt-2 text-sm tabular-nums text-foreground">
                    Debes {formatCurrency(Number(d.current_balance), d.currency_code)}
                    <span className="text-muted-foreground"> de {formatCurrency(Number(d.original_amount), d.currency_code)} · {d.paidPercent}% pagado</span>
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
