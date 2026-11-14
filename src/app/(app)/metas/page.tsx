import Link from "next/link";
import { Plus, Target } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { getGoalsWithProgressAction } from "@/app/actions/goals";
import { GoalProgressBar } from "@/components/goals/GoalProgressBar";

const STATUS_LABEL = {
  ACTIVE: "En curso",
  COMPLETED: "Cumplida",
  PAUSED: "En pausa",
  CANCELLED: "Cancelada",
} as const;

export default async function MetasPage() {
  const result = await getGoalsWithProgressAction();

  if ("error" in result) {
    return (
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-3xl rounded-xl border border-destructive/50 bg-destructive/10 p-6 text-center">
          <p className="text-destructive">Error al cargar las metas: {result.error}</p>
        </div>
      </main>
    );
  }

  const goals = result.data;

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-heading">Metas</h1>
            <p className="mt-1 text-muted-foreground">Ahorra con propósito, a tu ritmo</p>
          </div>
          <Link
            href="/metas/nueva"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm"
          >
            <Plus className="w-4 h-4" />
            Nueva meta
          </Link>
        </header>

        {goals.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <Target className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-medium text-foreground">Aún no tienes metas</h2>
            <p className="mt-1 text-sm text-muted-foreground max-w-xs mx-auto">
              Crea una meta, registra tus aportes y mira cómo avanzas.
            </p>
          </div>
        ) : (
          <ul className="space-y-3" role="list">
            {goals.map((g) => (
              <li key={g.id}>
                <a href={`/metas/${g.id}`} className="block rounded-xl border border-border bg-card p-4 hover:border-primary/40 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="font-medium text-foreground">{g.name}</h2>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      {STATUS_LABEL[g.status]}
                    </span>
                  </div>
                  <div className="mt-3">
                    <GoalProgressBar percent={g.progress.percent} label={`${g.name}: ${g.progress.percent}% de la meta`} />
                  </div>
                  <p className="mt-2 text-sm tabular-nums text-foreground">
                    {formatCurrency(g.progress.current.toNumber(), g.currency_code)} de {formatCurrency(Number(g.target_amount), g.currency_code)}
                    <span className="text-muted-foreground"> · {g.progress.percent}%</span>
                  </p>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
