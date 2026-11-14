import { AlertTriangle, CheckCircle2, Info, Sparkles } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { getAnalysisAction } from "@/app/actions/analysis";
import { SCORE_BAND_LABELS } from "@/domain/score";

const SEVERITY = {
  INFO: { icon: Info, style: "border-primary/30 bg-primary/5", color: "text-primary" },
  SUCCESS: { icon: CheckCircle2, style: "border-success/30 bg-success/5", color: "text-success" },
  WARNING: { icon: AlertTriangle, style: "border-warning/30 bg-warning/5", color: "text-warning" },
} as const;

export default async function AnalisisPage() {
  const result = await getAnalysisAction();

  if ("error" in result) {
    return (
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-3xl rounded-xl border border-destructive/50 bg-destructive/10 p-6 text-center">
          <p className="text-destructive">Error al cargar el análisis: {result.error}</p>
        </div>
      </main>
    );
  }

  const { forecast, score, insights, currencyCode } = result.data;
  const money = (v: { toNumber(): number }) => formatCurrency(v.toNumber(), currencyCode);

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-3xl space-y-8">
        <header>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-heading">Análisis</h1>
          <p className="mt-1 text-muted-foreground">Qué podría pasar este mes y cómo vas</p>
        </header>

        <section aria-labelledby="forecast-heading" className="space-y-3">
          <h2 id="forecast-heading" className="text-lg font-semibold text-foreground">Cómo cerrarías el mes</h2>
          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Es una estimación, no una certeza.</strong> Proyecta tu gasto diario promedio hasta fin de mes y resta tus obligaciones pendientes.
            </p>
            <p className={cn("text-2xl font-bold tabular-nums", forecast.isNegative ? "text-danger" : "text-foreground")}>
              {money(forecast.projectedEndLiquid)}
            </p>
            <p className="text-xs text-muted-foreground">Saldo líquido estimado al final del mes</p>
            <dl className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div><dt className="text-muted-foreground">Gasto diario promedio</dt><dd className="font-medium tabular-nums">{money(forecast.dailyAverage)}</dd></div>
              <div><dt className="text-muted-foreground">Gasto restante estimado</dt><dd className="font-medium tabular-nums">{money(forecast.projectedRemainingExpense)}</dd></div>
              <div><dt className="text-muted-foreground">Obligaciones pendientes del mes</dt><dd className="font-medium tabular-nums">{money(forecast.pendingObligations)}</dd></div>
            </dl>
            {forecast.lowConfidence && (
              <p className="text-sm text-warning">Llevas pocos días del mes: la estimación aún es poco fiable.</p>
            )}
            {forecast.isNegative && (
              <p className="text-sm text-danger">Con este ritmo terminarías el mes con saldo líquido negativo.</p>
            )}
          </div>
        </section>

        <section aria-labelledby="score-heading" className="space-y-3">
          <h2 id="score-heading" className="text-lg font-semibold text-foreground">Tu Financial Score Lukiva</h2>
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <p className="text-xs text-muted-foreground">
              Es un indicador interno de Lukiva para orientarte. No es un score bancario ni crediticio oficial.
            </p>
            {score.total === null ? (
              <p className="text-sm text-muted-foreground">Aún no hay datos suficientes para calcularlo. Registra ingresos, gastos o presupuestos.</p>
            ) : (
              <p className="text-3xl font-bold tabular-nums text-foreground">
                {score.total}<span className="text-base font-normal text-muted-foreground"> / 100 · {score.band && SCORE_BAND_LABELS[score.band]}</span>
              </p>
            )}
            <ul className="space-y-3" role="list">
              {score.components.map((c) => (
                <li key={c.key}>
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="font-medium text-foreground">{c.label}</span>
                    <span className="tabular-nums text-muted-foreground">{c.score === null ? "No aplica" : `${c.score} pts`}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{c.explanation}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section aria-labelledby="insights-heading" className="space-y-3">
          <h2 id="insights-heading" className="text-lg font-semibold text-foreground">Lo que notamos</h2>
          {insights.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-6 text-center">
              <Sparkles className="mx-auto h-6 w-6 text-muted-foreground" aria-hidden="true" />
              <p className="mt-2 text-sm text-muted-foreground">Por ahora no hay nada que destacar. Sigue registrando tus movimientos.</p>
            </div>
          ) : (
            <ul className="space-y-3" role="list">
              {insights.map((i) => {
                const s = SEVERITY[i.severity];
                const Icon = s.icon;
                return (
                  <li key={i.id} className={cn("rounded-xl border p-4", s.style)}>
                    <div className="flex items-start gap-3">
                      <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", s.color)} aria-hidden="true" />
                      <div>
                        <p className="font-medium text-foreground">{i.title}</p>
                        <p className="mt-0.5 text-sm text-muted-foreground">{i.message}</p>
                        <details className="mt-2 text-xs text-muted-foreground">
                          <summary className="cursor-pointer">¿Cómo se calculó?</summary>
                          <p className="mt-1">{i.explanation}</p>
                        </details>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
