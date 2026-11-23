import { cn, formatCurrency } from "@/lib/utils";
import {
  CalendarClock, ChevronRight, TrendingUp,
  Repeat, Landmark, ArrowUpRight, ArrowDownLeft,
  Gift, Shield,
} from "lucide-react";
import { getFinancialSummaryAction } from "@/app/actions/financial";
import { getObligationsAction } from "@/app/actions/obligations";
import { getSubscriptionsAction } from "@/app/actions/subscriptions";
import { getRecurringAction } from "@/app/actions/recurring";
import { Decimal } from "decimal.js";
import { format, parseISO, addMonths, startOfMonth, endOfMonth, differenceInDays, isWithinInterval } from "date-fns";
import { es } from "date-fns/locale";

async function getResumenData() {
  const [summaryResult, obligationsResult, subscriptionsResult, recurringResult] = await Promise.all([
    getFinancialSummaryAction("current"),
    getObligationsAction({ status: "PENDING" }),
    getSubscriptionsAction(),
    getRecurringAction(),
  ]);
  return { summaryResult, obligationsResult, subscriptionsResult, recurringResult };
}

function fmt(val: Decimal | number, currency: string) {
  const n = val instanceof Decimal ? val.toNumber() : val;
  return formatCurrency(n, currency);
}

function getDaysLabel(dateStr: string): string {
  const days = differenceInDays(parseISO(dateStr), new Date());
  if (days < 0) return "Vencida";
  if (days === 0) return "Hoy";
  if (days === 1) return "Mañana";
  if (days < 7) return `En ${days} días`;
  return format(parseISO(dateStr), "d 'de' MMM", { locale: es });
}

function isDecember() {
  return new Date().getMonth() === 11;
}

function isNovember() {
  return new Date().getMonth() === 10;
}

export default async function ResumenPage() {
  const { summaryResult, obligationsResult, subscriptionsResult, recurringResult } = await getResumenData();

  if ("error" in summaryResult) {
    return (
      <main className="p-4">
        <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-6 text-center">
          <p className="text-destructive">Error al cargar el resumen.</p>
        </div>
      </main>
    );
  }

  const { availableToSpend, pendingObligations, safetyReserve, currencyCode, periodIncome, periodExpense } = summaryResult.data;

  // Obligaciones pendientes ordenadas por fecha
  const obligations = "data" in obligationsResult ? (obligationsResult.data || []) : [];
  const pendingObs = obligations.filter((o) => o.status === "PENDING");

  // Suscripciones activas
  const subscriptions = "data" in subscriptionsResult ? subscriptionsResult.data.subscriptions : [];
  const activeSubs = subscriptions.filter((s) => s.status === "ACTIVE");
  const subMonthly = activeSubs.reduce((sum, s) => sum.plus(new Decimal(s.monthly)), new Decimal(0));

  // Recurrentes activos
  const recurring = "data" in recurringResult ? recurringResult.data : [];
  const activeRecurring = recurring.filter((r) => r.status === "ACTIVE");
  const recurringIncome = activeRecurring.filter((r) => r.type === "INCOME");
  const recurringExpense = activeRecurring.filter((r) => r.type === "EXPENSE");
  const projectedRecurringIncome = recurringIncome.reduce((sum, r) => sum.plus(new Decimal(r.amount)), new Decimal(0));
  const projectedRecurringExpense = recurringExpense.reduce((sum, r) => sum.plus(new Decimal(r.amount)), new Decimal(0));

  // Proyección del mes siguiente
  const nextMonth = addMonths(new Date(), 1);
  const nextMonthLabel = format(nextMonth, "MMMM yyyy", { locale: es });
  const nextMonthLabelCap = nextMonthLabel.charAt(0).toUpperCase() + nextMonthLabel.slice(1);
  const nextMonthStart = startOfMonth(nextMonth);
  const nextMonthEnd = endOfMonth(nextMonth);

  // Obligaciones que vencen el próximo mes
  const nextMonthObs = pendingObs.filter((o) => {
    try {
      return isWithinInterval(parseISO(o.due_date), { start: nextMonthStart, end: nextMonthEnd });
    } catch {
      return false;
    }
  });

  const totalNextMonthObs = nextMonthObs.reduce((sum, o) => sum.plus(new Decimal(String(o.amount))), new Decimal(0));

  // Suscripciones que vencen el próximo mes
  const nextMonthSubs = activeSubs.filter((s) => {
    try {
      return isWithinInterval(parseISO(s.nextRenewal), { start: nextMonthStart, end: nextMonthEnd });
    } catch {
      return false;
    }
  });
  const totalNextMonthSubs = nextMonthSubs.reduce((sum, s) => sum.plus(new Decimal(s.amount)), new Decimal(0));

  // Total comprometido del próximo mes
  const totalCommitted = totalNextMonthObs.plus(totalNextMonthSubs).plus(safetyReserve);
  const projectedAvailable = projectedRecurringIncome.minus(totalCommitted).minus(projectedRecurringExpense);

  const isHolidaySeason = isDecember() || isNovember();

  return (
    <main className="p-4 pb-8 space-y-5 max-w-2xl mx-auto">

      {/* ── Encabezado ── */}
      <header>
        <h1 className="text-xl font-bold text-foreground font-heading">Resumen</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Situación actual y lo que se viene</p>
      </header>

      {/* ── Alerta de temporada ── */}
      {isHolidaySeason && (
        <div className="rounded-2xl border border-warning/30 bg-warning/8 p-4 flex items-start gap-3">
          <Gift className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-warning">Temporada de alto gasto</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Diciembre y enero traen gastos extra: regalos, reuniones, vacaciones. Planeá con tiempo.
            </p>
          </div>
        </div>
      )}

      {/* ── Estado actual ── */}
      <section aria-labelledby="actual-heading">
        <h2 id="actual-heading" className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Hoy
        </h2>
        <div className="grid grid-cols-2 gap-2.5">
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">Disponible</p>
            <p className={cn("mt-1 text-xl font-bold tabular-nums",
              availableToSpend.lessThan(0) ? "text-danger" : "text-primary"
            )}>
              {fmt(availableToSpend, currencyCode)}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">En compromisos</p>
            <p className="mt-1 text-xl font-bold tabular-nums text-danger">
              {pendingObligations.isZero() ? "—" : fmt(pendingObligations, currencyCode)}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">Ingresos del mes</p>
            <p className="mt-1 text-xl font-bold tabular-nums text-success">
              {fmt(periodIncome, currencyCode)}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">Gastos del mes</p>
            <p className="mt-1 text-xl font-bold tabular-nums text-danger">
              {fmt(periodExpense, currencyCode)}
            </p>
          </div>
        </div>
      </section>

      {/* ── Próximo mes ── */}
      <section aria-labelledby="proximo-heading">
        <h2 id="proximo-heading" className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          {nextMonthLabelCap}
        </h2>

        {/* Proyección */}
        <div className={cn(
          "rounded-2xl border p-4 mb-3",
          projectedAvailable.greaterThan(0)
            ? "border-success/30 bg-success/8"
            : projectedAvailable.isZero()
            ? "border-border bg-muted/30"
            : "border-warning/30 bg-warning/8"
        )}>
          <p className="text-xs font-medium text-muted-foreground">
            Proyección disponible{recurringIncome.length === 0 ? " (sin ingresos recurrentes registrados)" : ""}
          </p>
          <p className={cn("mt-1 text-3xl font-bold tabular-nums",
            projectedAvailable.greaterThan(0) ? "text-success"
              : projectedAvailable.isZero() ? "text-muted-foreground"
              : "text-warning"
          )}>
            {projectedAvailable.isZero() && recurringIncome.length === 0
              ? "Sin datos"
              : fmt(projectedAvailable.abs(), currencyCode)}
          </p>
          {recurringIncome.length === 0 && (
            <p className="mt-2 text-xs text-muted-foreground">
              Registrá tus ingresos recurrentes (nómina, etc.) para ver la proyección.{" "}
              <a href="/recurrentes" className="text-primary underline">Ir a recurrentes →</a>
            </p>
          )}
        </div>

        {/* Desglose proyección */}
        <div className="rounded-2xl border border-border bg-card divide-y divide-border overflow-hidden">

          {/* Ingresos recurrentes proyectados */}
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-4 h-4 text-success" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Ingresos esperados</p>
              <p className="text-xs text-muted-foreground">{recurringIncome.length} recurrente{recurringIncome.length !== 1 ? "s" : ""}</p>
            </div>
            <p className="text-sm font-semibold tabular-nums text-success">
              {projectedRecurringIncome.isZero() ? "—" : `+${fmt(projectedRecurringIncome, currencyCode)}`}
            </p>
          </div>

          {/* Obligaciones del próximo mes */}
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-8 h-8 rounded-lg bg-danger/10 flex items-center justify-center flex-shrink-0">
              <Landmark className="w-4 h-4 text-danger" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Obligaciones</p>
              <p className="text-xs text-muted-foreground">{nextMonthObs.length} en {nextMonthLabelCap}</p>
            </div>
            <p className="text-sm font-semibold tabular-nums text-danger">
              {totalNextMonthObs.isZero() ? "—" : `−${fmt(totalNextMonthObs, currencyCode)}`}
            </p>
          </div>

          {/* Suscripciones del próximo mes */}
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <CalendarClock className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Suscripciones</p>
              <p className="text-xs text-muted-foreground">{nextMonthSubs.length} cobros en {nextMonthLabelCap}</p>
            </div>
            <p className="text-sm font-semibold tabular-nums text-danger">
              {totalNextMonthSubs.isZero() ? "—" : `−${fmt(totalNextMonthSubs, currencyCode)}`}
            </p>
          </div>

          {/* Reserva */}
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center flex-shrink-0">
              <Shield className="w-4 h-4 text-warning" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Reserva de seguridad</p>
            </div>
            <p className="text-sm font-semibold tabular-nums text-warning">
              {safetyReserve.isZero() ? "—" : `−${fmt(safetyReserve, currencyCode)}`}
            </p>
          </div>

        </div>
      </section>

      {/* ── Obligaciones pendientes ── */}
      {pendingObs.length > 0 && (
        <section aria-labelledby="pending-obs-heading">
          <div className="flex items-center justify-between mb-3">
            <h2 id="pending-obs-heading" className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Compromisos pendientes
            </h2>
            <a href="/obligaciones" className="text-xs text-primary flex items-center gap-0.5">
              Ver todos <ChevronRight className="w-3 h-3" />
            </a>
          </div>
          <div className="rounded-2xl border border-border bg-card divide-y divide-border overflow-hidden">
            {pendingObs.slice(0, 5).map((o) => {
              const days = differenceInDays(parseISO(o.due_date), new Date());
              const urgent = days <= 3;
              return (
                <div key={o.id} className="flex items-center gap-3 px-4 py-3">
                  <div className={cn("w-2 h-2 rounded-full flex-shrink-0 mt-1",
                    urgent ? "bg-danger" : "bg-muted-foreground/40"
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{o.name}</p>
                    <p className={cn("text-xs mt-0.5", urgent ? "text-danger" : "text-muted-foreground")}>
                      {getDaysLabel(o.due_date)}
                    </p>
                  </div>
                  <p className="text-sm font-semibold tabular-nums text-foreground">
                    {formatCurrency(Number(o.amount), o.currency_code)}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Suscripciones activas ── */}
      {activeSubs.length > 0 && (
        <section aria-labelledby="subs-heading">
          <div className="flex items-center justify-between mb-3">
            <h2 id="subs-heading" className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Suscripciones activas
            </h2>
            <a href="/suscripciones" className="text-xs text-primary flex items-center gap-0.5">
              Ver todas <ChevronRight className="w-3 h-3" />
            </a>
          </div>
          <div className="rounded-2xl border border-border bg-card divide-y divide-border overflow-hidden">
            {activeSubs.slice(0, 4).map((s) => (
              <div key={s.id} className="flex items-center gap-3 px-4 py-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <CalendarClock className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{s.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Próx. cobro: {getDaysLabel(s.nextRenewal)}
                  </p>
                </div>
                <p className="text-sm font-semibold tabular-nums text-foreground">
                  {formatCurrency(Number(s.amount), s.currency_code)}
                </p>
              </div>
            ))}
            <div className="flex items-center justify-between px-4 py-3 bg-muted/30">
              <p className="text-xs font-medium text-muted-foreground">Total mensual</p>
              <p className="text-sm font-bold tabular-nums text-foreground">{fmt(subMonthly, currencyCode)}</p>
            </div>
          </div>
        </section>
      )}

      {/* ── Recurrentes activos ── */}
      {activeRecurring.length > 0 && (
        <section aria-labelledby="recurring-heading">
          <div className="flex items-center justify-between mb-3">
            <h2 id="recurring-heading" className="text-sm font-semibold text-muted-forematic uppercase tracking-wider">
              Recurrentes
            </h2>
            <a href="/recurrentes" className="text-xs text-primary flex items-center gap-0.5">
              Ver todos <ChevronRight className="w-3 h-3" />
            </a>
          </div>
          <div className="rounded-2xl border border-border bg-card divide-y divide-border overflow-hidden">
            {activeRecurring.slice(0, 4).map((r) => (
              <div key={r.id} className="flex items-center gap-3 px-4 py-3">
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                  r.type === "INCOME" ? "bg-success/10" : "bg-danger/10"
                )}>
                  {r.type === "INCOME"
                    ? <ArrowUpRight className="w-4 h-4 text-success" />
                    : <ArrowDownLeft className="w-4 h-4 text-danger" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{r.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {r.next_execution_date ? `Próx: ${getDaysLabel(r.next_execution_date)}` : r.frequency}
                  </p>
                </div>
                <p className={cn("text-sm font-semibold tabular-nums",
                  r.type === "INCOME" ? "text-success" : "text-danger"
                )}>
                  {r.type === "INCOME" ? "+" : "−"}{formatCurrency(Number(r.amount), r.currency_code)}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Vacío: sin datos suficientes ── */}
      {pendingObs.length === 0 && activeSubs.length === 0 && activeRecurring.length === 0 && (
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <div className="mx-auto w-14 h-14 rounded-full bg-muted/50 flex items-center justify-center mb-3">
            <CalendarClock className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground">Sin compromisos registrados</p>
          <p className="mt-1 text-xs text-muted-foreground max-w-xs mx-auto">
            Registrá tus obligaciones fijas, suscripciones y pagos recurrentes para ver el resumen completo.
          </p>
          <div className="mt-4 flex flex-col gap-2">
            <a href="/obligaciones/nueva" className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium">
              <Landmark className="w-4 h-4" /> Agregar obligación
            </a>
            <a href="/recurrentes" className="inline-flex items-center justify-center gap-1.5 px-4 py-2 border border-border bg-card text-foreground rounded-lg text-sm font-medium">
              <Repeat className="w-4 h-4" /> Ver recurrentes
            </a>
          </div>
        </div>
      )}

    </main>
  );
}
