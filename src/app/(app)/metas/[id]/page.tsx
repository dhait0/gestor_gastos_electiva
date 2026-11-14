import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { getGoalDetailAction } from "@/app/actions/goals";
import { GoalProgressBar } from "@/components/goals/GoalProgressBar";
import { AddContributionForm, DeleteContributionButton, GoalStatusControls } from "@/components/goals/GoalControls";

const STATUS_LABEL = {
  ACTIVE: "En curso",
  COMPLETED: "Cumplida",
  PAUSED: "En pausa",
  CANCELLED: "Cancelada",
} as const;

export default async function MetaDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getGoalDetailAction(id);
  if ("error" in result) notFound();

  const { goal, contributions } = result.data;
  const p = goal.progress;
  const money = (v: number) => formatCurrency(v, goal.currency_code);

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <Link href="/metas" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" />
          Metas
        </Link>

        <header className="space-y-1">
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-2xl font-bold text-foreground font-heading">{goal.name}</h1>
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{STATUS_LABEL[goal.status]}</span>
          </div>
          {goal.description && <p className="text-muted-foreground">{goal.description}</p>}
        </header>

        <section aria-label="Progreso" className="rounded-xl border border-border bg-card p-5 space-y-3">
          <GoalProgressBar percent={p.percent} label={`${goal.name}: ${p.percent}% de la meta`} />
          <p className="text-lg font-semibold tabular-nums text-foreground">
            {money(p.current.toNumber())} <span className="text-muted-foreground font-normal">de {money(Number(goal.target_amount))} · {p.percent}%</span>
          </p>
          {p.isCompleted ? (
            <p className="text-sm text-success">¡Meta cumplida! 🎉</p>
          ) : (
            <p className="text-sm text-muted-foreground">Te faltan {money(p.remaining.toNumber())}</p>
          )}
          {p.recommendedMonthly && p.monthsRemaining && (
            <p className="text-sm text-muted-foreground">
              Para llegar a tiempo, aporta unos {money(p.recommendedMonthly.toNumber())} al mes
              ({p.monthsRemaining} {p.monthsRemaining === 1 ? "mes" : "meses"} hasta {goal.target_date}).
            </p>
          )}
          {p.isOverdue && (
            <p className="text-sm text-warning">La fecha objetivo ({goal.target_date}) ya pasó. Puedes seguir aportando.</p>
          )}
        </section>

        <section aria-labelledby="contribute-heading" className="rounded-xl border border-border bg-card p-5 space-y-3">
          <h2 id="contribute-heading" className="text-lg font-semibold text-foreground">Nuevo aporte</h2>
          <p className="text-xs text-muted-foreground">Un aporte suma a tu meta; no mueve dinero entre tus cuentas.</p>
          <AddContributionForm goalId={goal.id} disabled={goal.status === "CANCELLED"} />
        </section>

        <section aria-labelledby="history-heading" className="space-y-3">
          <h2 id="history-heading" className="text-lg font-semibold text-foreground">Aportes</h2>
          {contributions.length === 0 ? (
            <p className="text-sm text-muted-foreground">Todavía no hay aportes.</p>
          ) : (
            <ul className="divide-y divide-border rounded-xl border border-border bg-card" role="list">
              {contributions.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div>
                    <p className="font-medium tabular-nums text-foreground">{money(Number(c.amount))}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.contribution_date}
                      {c.notes ? ` · ${c.notes}` : ""}
                    </p>
                  </div>
                  <DeleteContributionButton contributionId={c.id} goalId={goal.id} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <GoalStatusControls goalId={goal.id} status={goal.status} />
      </div>
    </main>
  );
}
