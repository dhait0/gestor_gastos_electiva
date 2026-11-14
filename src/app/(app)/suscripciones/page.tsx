import Link from "next/link";
import { CalendarClock, Plus } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { getSubscriptionsAction } from "@/app/actions/subscriptions";
import { FREQUENCY_LABELS } from "@/domain/recurrence";
import { SubscriptionControls } from "@/components/subscriptions/SubscriptionControls";

const STATUS_LABEL = { ACTIVE: "Activa", PAUSED: "En pausa", CANCELLED: "Cancelada" } as const;

function renewalText(daysUntil: number, date: string): string {
  if (daysUntil === 0) return "Se cobra hoy";
  if (daysUntil === 1) return "Se cobra mañana";
  return `Próximo cobro en ${daysUntil} días (${date})`;
}

export default async function SuscripcionesPage() {
  const result = await getSubscriptionsAction();

  if ("error" in result) {
    return (
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-3xl rounded-xl border border-destructive/50 bg-destructive/10 p-6 text-center">
          <p className="text-destructive">Error al cargar las suscripciones: {result.error}</p>
        </div>
      </main>
    );
  }

  const { subscriptions, totals, currencyCode } = result.data;

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-heading">Suscripciones</h1>
            <p className="mt-1 text-muted-foreground">Qué pagas cada mes sin darte cuenta</p>
          </div>
          <Link
            href="/suscripciones/nueva"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm"
          >
            <Plus className="w-4 h-4" />
            Nueva suscripción
          </Link>
        </header>

        {totals.count > 0 && (
          <section aria-label="Costo total" className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground">Costo mensual equivalente</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">{formatCurrency(Number(totals.monthly), currencyCode)}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground">Costo anual estimado</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">{formatCurrency(Number(totals.annual), currencyCode)}</p>
            </div>
          </section>
        )}

        {subscriptions.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <CalendarClock className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-medium text-foreground">Aún no tienes suscripciones</h2>
            <p className="mt-1 text-sm text-muted-foreground max-w-xs mx-auto">
              Registra tus servicios de streaming, apps o membresías y mira cuánto suman.
            </p>
          </div>
        ) : (
          <ul className="space-y-3" role="list">
            {subscriptions.map((s) => (
              <li key={s.id} className="rounded-xl border border-border bg-card p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-medium text-foreground">{s.name}</h2>
                    <p className="text-xs text-muted-foreground">
                      {s.frequency === "CUSTOM" ? `Cada ${s.custom_interval_days} días` : FREQUENCY_LABELS[s.frequency]} · {STATUS_LABEL[s.status]}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold tabular-nums text-foreground">{formatCurrency(Number(s.amount), s.currency_code)}</p>
                    <p className="text-xs text-muted-foreground tabular-nums">≈ {formatCurrency(Number(s.monthly), s.currency_code)}/mes</p>
                  </div>
                </div>
                {s.status === "ACTIVE" && <p className="text-sm text-muted-foreground">{renewalText(s.daysUntil, s.nextRenewal)}</p>}
                <SubscriptionControls id={s.id} status={s.status} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
