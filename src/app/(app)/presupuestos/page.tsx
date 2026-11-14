import { ChevronLeft, ChevronRight, PiggyBank, Plus } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { getBudgetsWithUsageAction } from "@/app/actions/budgets";
import type { BudgetStatus } from "@/domain/budgets";
import { DeleteBudgetButton } from "@/components/budgets/DeleteBudgetButton";

const STATUS_INFO: Record<BudgetStatus, { label: string; badge: string; bar: string }> = {
  NORMAL: { label: "Va bien", badge: "bg-success/10 text-success", bar: "#20BDA5" },
  WARNING: { label: "Atención", badge: "bg-warning/10 text-warning", bar: "#FFC777" },
  HIGH: { label: "Casi al límite", badge: "bg-warning/10 text-warning", bar: "#F59E0B" },
  EXCEEDED: { label: "Superado", badge: "bg-danger/10 text-danger", bar: "#DC2626" },
};

const MONTH_NAMES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

function shiftMonth(month: string, delta: number): string {
  const d = new Date(Number(month.slice(0, 4)), Number(month.slice(5, 7)) - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(month: string): string {
  return `${MONTH_NAMES[Number(month.slice(5, 7)) - 1]} ${month.slice(0, 4)}`;
}

export default async function PresupuestosPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string | string[] }>;
}) {
  const raw = (await searchParams).month;
  const requested = Array.isArray(raw) ? raw[0] : raw;
  const result = await getBudgetsWithUsageAction(requested && /^\d{4}-(0[1-9]|1[0-2])$/.test(requested) ? requested : undefined);

  if ("error" in result) {
    return (
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-3xl rounded-xl border border-destructive/50 bg-destructive/10 p-6 text-center">
          <p className="text-destructive">Error al cargar los presupuestos: {result.error}</p>
        </div>
      </main>
    );
  }

  const { month, budgets } = result.data;

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-heading">Presupuestos</h1>
            <p className="mt-1 text-muted-foreground">Cuánto planeas gastar por categoría cada mes</p>
          </div>
          <a
            href={`/presupuestos/nuevo?month=${month}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm"
          >
            <Plus className="w-4 h-4" />
            Nuevo presupuesto
          </a>
        </header>

        <nav aria-label="Mes del presupuesto" className="flex items-center justify-between rounded-xl border border-border bg-card px-3 py-2">
          <a href={`/presupuestos?month=${shiftMonth(month, -1)}`} aria-label="Mes anterior" className="p-2 rounded-lg hover:bg-muted">
            <ChevronLeft className="w-5 h-5" />
          </a>
          <p className="font-medium text-foreground capitalize" aria-live="polite">{monthLabel(month)}</p>
          <a href={`/presupuestos?month=${shiftMonth(month, 1)}`} aria-label="Mes siguiente" className="p-2 rounded-lg hover:bg-muted">
            <ChevronRight className="w-5 h-5" />
          </a>
        </nav>

        {budgets.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <PiggyBank className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-medium text-foreground">Sin presupuestos en este mes</h2>
            <p className="mt-1 text-sm text-muted-foreground max-w-xs mx-auto">
              Define un límite para una categoría de gasto y te mostramos cuánto llevas.
            </p>
          </div>
        ) : (
          <ul className="space-y-3" role="list">
            {budgets.map((b) => {
              const info = STATUS_INFO[b.usage.status];
              const width = Math.min(b.usage.percent, 100);
              return (
                <li key={b.id} className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-medium text-foreground">{b.category_name}</h2>
                      <span className={cn("mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium", info.badge)}>
                        {info.label}
                      </span>
                    </div>
                    <DeleteBudgetButton budgetId={b.id} categoryName={b.category_name} />
                  </div>
                  <div
                    className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted"
                    role="progressbar"
                    aria-label={`${b.category_name}: ${b.usage.percent}% del presupuesto`}
                    aria-valuenow={Math.round(width)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div className="h-full rounded-full" style={{ width: `${width}%`, backgroundColor: info.bar }} />
                  </div>
                  <div className="mt-2 flex flex-wrap items-baseline justify-between gap-x-4 text-sm tabular-nums">
                    <span className="text-foreground">
                      {formatCurrency(b.usage.spent.toNumber(), b.currency_code)} de {formatCurrency(Number(b.limit_amount), b.currency_code)}
                      <span className="text-muted-foreground"> · {b.usage.percent}%</span>
                    </span>
                    <span className={b.usage.remaining.isNegative() ? "text-danger" : "text-muted-foreground"}>
                      {b.usage.remaining.isNegative()
                        ? `Excedido por ${formatCurrency(b.usage.remaining.abs().toNumber(), b.currency_code)}`
                        : `Quedan ${formatCurrency(b.usage.remaining.toNumber(), b.currency_code)}`}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}
