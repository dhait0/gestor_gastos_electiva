import Link from "next/link";
import { Plus, Repeat } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { getRecurringAction } from "@/app/actions/recurring";
import { FREQUENCY_LABELS } from "@/domain/recurrence";
import { AutoRegister, RecurringStatusControls, RegisterDueButton } from "@/components/recurring/RecurringControls";

const STATUS_LABEL = { ACTIVE: "Activa", PAUSED: "En pausa", CANCELLED: "Cancelada" } as const;

export default async function RecurrentesPage() {
  const result = await getRecurringAction();

  if ("error" in result) {
    return (
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-3xl rounded-xl border border-destructive/50 bg-destructive/10 p-6 text-center">
          <p className="text-destructive">Error al cargar los movimientos recurrentes: {result.error}</p>
        </div>
      </main>
    );
  }

  const items = result.data;
  const hasDueAutomatic = items.some((i) => i.is_automatic && i.dueCount > 0);

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <AutoRegister hasDueAutomatic={hasDueAutomatic} />
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-heading">Recurrentes</h1>
            <p className="mt-1 text-muted-foreground">Ingresos y gastos que se repiten, sin olvidarlos</p>
          </div>
          <Link
            href="/recurrentes/nuevo"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm"
          >
            <Plus className="w-4 h-4" />
            Nuevo recurrente
          </Link>
        </header>

        {items.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <Repeat className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-medium text-foreground">Aún no tienes movimientos recurrentes</h2>
            <p className="mt-1 text-sm text-muted-foreground max-w-xs mx-auto">
              Registra tu salario, el arriendo o cualquier pago periódico una sola vez.
            </p>
          </div>
        ) : (
          <ul className="space-y-3" role="list">
            {items.map((r) => (
              <li key={r.id} className="rounded-xl border border-border bg-card p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-medium text-foreground">{r.name}</h2>
                    <p className="text-xs text-muted-foreground">
                      {r.category_name} · {r.account_name} ·{" "}
                      {r.frequency === "CUSTOM" ? `Cada ${r.custom_interval_days} días` : FREQUENCY_LABELS[r.frequency]}
                      {r.is_automatic ? " · Automático" : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={r.type === "INCOME" ? "font-semibold tabular-nums text-success" : "font-semibold tabular-nums text-danger"}>
                      {r.type === "INCOME" ? "+" : "−"}
                      {formatCurrency(Number(r.amount), r.currency_code)}
                    </p>
                    <p className="text-xs text-muted-foreground">{STATUS_LABEL[r.status]}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">Próxima: {r.next_execution_date}</p>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  {r.dueCount > 0 && !r.is_automatic ? (
                    <RegisterDueButton recurringId={r.id} dueCount={r.dueCount} />
                  ) : (
                    <span />
                  )}
                  <RecurringStatusControls id={r.id} status={r.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
