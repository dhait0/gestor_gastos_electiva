import { cn, formatCurrency, formatDateOnly } from "@/lib/utils";
import {
  Plus, ArrowDownLeft, ArrowUpRight, AlertTriangle, CheckCircle,
  ChevronRight, Wallet, FileText, Shield, TrendingDown,
  CalendarClock, Landmark, Repeat, ArrowRight,
} from "lucide-react";
import { getFinancialSummaryAction } from "@/app/actions/financial";
import { getTransactionsAction } from "@/app/actions/transactions";
import { getObligationsAction } from "@/app/actions/obligations";
import { MOVEMENT_TONE_CLASSES, describeMovement } from "@/lib/movement-kind";
import { Decimal } from "decimal.js";
import { DASHBOARD_PERIODS, parseDashboardPeriod, type DashboardPeriod } from "@/domain/analytics";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { format, isToday, isTomorrow, differenceInDays, parseISO } from "date-fns";
import { es } from "date-fns/locale";

async function getDashboardData(period: DashboardPeriod) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const profileData = user
    ? await supabase.from("profiles").select("display_name, timezone").eq("id", user.id).single()
    : null;

  const [summaryResult, transactionsResult, obligationsResult] = await Promise.all([
    getFinancialSummaryAction(period),
    getTransactionsAction({ limit: 3 }),
    getObligationsAction({ status: "PENDING" }),
  ]);

  return {
    summaryResult,
    transactionsResult,
    obligationsResult,
    displayName: profileData?.data?.display_name ?? null,
    timezone: profileData?.data?.timezone ?? "America/Bogota",
  };
}

function getGreeting(timezone: string): string {
  const hour = new Date(
    new Date().toLocaleString("en-US", { timeZone: timezone })
  ).getHours();
  if (hour < 12) return "Buenos días";
  if (hour < 18) return "Buenas tardes";
  return "Buenas noches";
}

function getStatusColor(available: Decimal, liquidBalance: Decimal) {
  if (available.lessThan(0))
    return { text: "text-danger", bg: "bg-danger/8", border: "border-danger/20", label: "Compromisos superan tu saldo", icon: AlertTriangle };
  if (available.lessThan(liquidBalance.mul(0.15)))
    return { text: "text-warning", bg: "bg-warning/8", border: "border-warning/20", label: "Margen ajustado", icon: AlertTriangle };
  return { text: "text-success", bg: "bg-success/8", border: "border-success/20", label: "Situación estable", icon: CheckCircle };
}

function fmt(val: Decimal, currency: string) {
  return formatCurrency(val.toNumber(), currency);
}

function getDueLabel(dateStr: string): string {
  const date = parseISO(dateStr);
  if (isToday(date)) return "Hoy";
  if (isTomorrow(date)) return "Mañana";
  const days = differenceInDays(date, new Date());
  if (days < 0) return `Vencida hace ${Math.abs(days)}d`;
  if (days < 7) return `En ${days} días`;
  return format(date, "d MMM", { locale: es });
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string | string[] }>;
}) {
  const period = parseDashboardPeriod((await searchParams).period);
  const { summaryResult, transactionsResult, obligationsResult, displayName, timezone } =
    await getDashboardData(period);

  if ("error" in summaryResult) {
    return (
      <main className="p-4">
        <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-6 text-center">
          <p className="text-destructive">Error al cargar: {summaryResult.error}</p>
        </div>
      </main>
    );
  }

  const { liquidBalance, pendingObligations, safetyReserve, availableToSpend, currencyCode, periodIncome, periodExpense } = summaryResult.data;
  const transactions = transactionsResult.data || [];
  const obligations = "data" in obligationsResult ? (obligationsResult.data || []) : [];
  const pendingItems = obligations.filter((o) => o.status === "PENDING").slice(0, 4);
  const status = getStatusColor(availableToSpend, liquidBalance);
  const StatusIcon = status.icon;
  const greeting = getGreeting(timezone);
  const monthLabel = format(new Date(), "MMMM yyyy", { locale: es });
  const monthLabelCap = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);
  const netMonth = periodIncome.minus(periodExpense);

  return (
    <main className="p-4 pb-8 space-y-5 max-w-2xl mx-auto">

      {/* ── Saludo ── */}
      <header>
        <p className="text-sm text-muted-foreground">
          {greeting}{displayName ? `, ${displayName.split(" ")[0]}` : ""}
        </p>
        <h1 className="text-xl font-bold text-foreground font-heading mt-0.5">
          {monthLabelCap}
        </h1>
      </header>

      {/* ── Hero: disponible ahora ── */}
      <section
        data-tour="disponible"
        className={cn(
          "rounded-2xl border p-5",
          status.bg, status.border
        )}
        aria-label="Disponible ahora"
      >
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Disponible ahora
        </p>
        <p className={cn("mt-1 text-5xl font-bold tabular-nums tracking-tight", status.text)}>
          {fmt(availableToSpend, currencyCode)}
        </p>
        <div className="mt-3 flex items-center gap-2">
          <StatusIcon className={cn("w-4 h-4 flex-shrink-0", status.text)} />
          <span className={cn("text-sm font-medium", status.text)}>{status.label}</span>
        </div>

        {/* Period selector */}
        <nav className="mt-4 flex gap-2 flex-wrap" aria-label="Período">
          {DASHBOARD_PERIODS.map((p) => (
            <a
              key={p.value}
              href={`/dashboard?period=${p.value}`}
              aria-current={p.value === period ? "true" : undefined}
              className={cn(
                "px-3 py-1 rounded-full text-xs border transition-colors",
                p.value === period
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background/60 text-muted-foreground border-border hover:text-foreground"
              )}
            >
              {p.label}
            </a>
          ))}
        </nav>
      </section>

      {/* ── La Cascada ── */}
      <section aria-labelledby="cascada-heading">
        <h2 id="cascada-heading" className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          La cascada
        </h2>
        <div className="rounded-2xl border border-border bg-card overflow-hidden">

          {/* Fila: saldo en cuentas */}
          <div className="flex items-center gap-3 px-4 py-3.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Wallet className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">Saldo en cuentas</p>
            </div>
            <p className="text-sm font-semibold tabular-nums text-foreground">
              {fmt(liquidBalance, currencyCode)}
            </p>
          </div>

          {/* Compromisos */}
          <div className="mx-4 pl-4 border-l-2 border-border/60 space-y-0.5 pb-1">
            <div className="flex items-center gap-3 py-2.5">
              <div className="w-7 h-7 rounded-lg bg-danger/10 flex items-center justify-center flex-shrink-0">
                <FileText className="w-3.5 h-3.5 text-danger" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">Compromisos</p>
                {pendingItems.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {pendingItems.length} pendiente{pendingItems.length !== 1 ? "s" : ""}
                  </p>
                )}
              </div>
              <p className="text-sm font-semibold tabular-nums text-danger">
                {pendingObligations.isZero() ? "—" : `−${fmt(pendingObligations, currencyCode)}`}
              </p>
            </div>

            {/* Obligaciones individuales (máx 3) */}
            {pendingItems.slice(0, 3).map((o) => (
              <div key={o.id} className="flex items-center gap-2 pl-9 py-1">
                <p className="flex-1 text-xs text-muted-foreground truncate">{o.name}</p>
                <span className="text-xs text-muted-foreground">{getDueLabel(o.due_date)}</span>
                <p className="text-xs tabular-nums text-danger ml-2">
                  −{formatCurrency(Number(o.amount), o.currency_code)}
                </p>
              </div>
            ))}

            {/* Reserva */}
            <div className="flex items-center gap-3 py-2.5">
              <div className="w-7 h-7 rounded-lg bg-warning/10 flex items-center justify-center flex-shrink-0">
                <Shield className="w-3.5 h-3.5 text-warning" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">Reserva de seguridad</p>
              </div>
              <p className="text-sm font-semibold tabular-nums text-warning">
                {safetyReserve.isZero() ? "—" : `−${fmt(safetyReserve, currencyCode)}`}
              </p>
            </div>
          </div>

          {/* Resultado */}
          <div className={cn("flex items-center gap-3 px-4 py-4 border-t border-border", status.bg)}>
            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-background/60")}>
              <TrendingDown className={cn("w-4 h-4", status.text)} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">Disponible</p>
            </div>
            <p className={cn("text-base font-bold tabular-nums", status.text)}>
              {fmt(availableToSpend, currencyCode)}
            </p>
          </div>
        </div>
      </section>

      {/* ── Resumen del mes ── */}
      <section aria-labelledby="mes-heading">
        <h2 id="mes-heading" className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Este mes
        </h2>
        <div className="grid grid-cols-3 gap-2.5">
          <div className="rounded-xl border border-border bg-card p-3.5">
            <p className="text-xs text-muted-foreground mb-1">Ingresos</p>
            <p className="text-base font-bold text-success tabular-nums">{fmt(periodIncome, currencyCode)}</p>
            <div className="mt-1.5 flex items-center gap-1 text-xs text-success">
              <ArrowUpRight className="w-3 h-3" />
              <span>Entró</span>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-3.5">
            <p className="text-xs text-muted-foreground mb-1">Gastos</p>
            <p className="text-base font-bold text-danger tabular-nums">{fmt(periodExpense, currencyCode)}</p>
            <div className="mt-1.5 flex items-center gap-1 text-xs text-danger">
              <ArrowDownLeft className="w-3 h-3" />
              <span>Salió</span>
            </div>
          </div>
          <div className={cn("rounded-xl border bg-card p-3.5",
            netMonth.greaterThanOrEqualTo(0) ? "border-success/30" : "border-danger/30"
          )}>
            <p className="text-xs text-muted-foreground mb-1">Balance</p>
            <p className={cn("text-base font-bold tabular-nums",
              netMonth.greaterThanOrEqualTo(0) ? "text-success" : "text-danger"
            )}>
              {netMonth.greaterThanOrEqualTo(0) ? "+" : "−"}{fmt(netMonth.abs(), currencyCode)}
            </p>
            <p className="mt-1.5 text-xs text-muted-foreground">Neto</p>
          </div>
        </div>
      </section>

      {/* ── Acciones rápidas ── */}
      <section aria-label="Acciones rápidas">
        <div className="grid grid-cols-3 gap-2.5">
          <a
            href="/transacciones/nuevo?type=expense"
            data-tour="nueva-transaccion"
            className={cn(
              "flex flex-col items-center gap-1.5 p-3.5 rounded-xl",
              "bg-primary text-primary-foreground",
              "font-medium text-xs text-center",
              "active:scale-95 transition-transform"
            )}
          >
            <ArrowDownLeft className="w-5 h-5" />
            Registrar gasto
          </a>
          <a
            href="/transacciones/nuevo?type=income"
            className={cn(
              "flex flex-col items-center gap-1.5 p-3.5 rounded-xl",
              "border border-border bg-card text-foreground",
              "font-medium text-xs text-center",
              "active:scale-95 transition-transform"
            )}
          >
            <ArrowUpRight className="w-5 h-5" />
            Registrar ingreso
          </a>
          <a
            href="/resumen"
            className={cn(
              "flex flex-col items-center gap-1.5 p-3.5 rounded-xl",
              "border border-border bg-card text-foreground",
              "font-medium text-xs text-center",
              "active:scale-95 transition-transform"
            )}
          >
            <CalendarClock className="w-5 h-5" />
            Ver resumen
          </a>
        </div>
      </section>

      {/* ── Próximos compromisos ── */}
      {pendingItems.length > 0 && (
        <section aria-labelledby="compromisos-heading">
          <div className="flex items-center justify-between mb-3">
            <h2 id="compromisos-heading" className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Próximos compromisos
            </h2>
            <a href="/obligaciones" className="text-xs text-primary flex items-center gap-0.5">
              Ver todos <ChevronRight className="w-3 h-3" />
            </a>
          </div>
          <div className="rounded-2xl border border-border bg-card divide-y divide-border overflow-hidden">
            {pendingItems.map((o) => {
              const days = differenceInDays(parseISO(o.due_date), new Date());
              const urgent = days <= 3;
              return (
                <div key={o.id} className="flex items-center gap-3 px-4 py-3">
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                    urgent ? "bg-danger/10" : "bg-muted/50"
                  )}>
                    <Landmark className={cn("w-4 h-4", urgent ? "text-danger" : "text-muted-foreground")} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{o.name}</p>
                    <p className={cn("text-xs mt-0.5", urgent ? "text-danger" : "text-muted-foreground")}>
                      {getDueLabel(o.due_date)}
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

      {/* ── Movimientos recientes ── */}
      <section data-tour="dash-recientes" aria-labelledby="recientes-heading">
        <div className="flex items-center justify-between mb-3">
          <h2 id="recientes-heading" className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Recientes
          </h2>
          <a href="/transacciones" className="text-xs text-primary flex items-center gap-0.5">
            Ver todos <ChevronRight className="w-3 h-3" />
          </a>
        </div>
        {transactions.length > 0 ? (
          <div className="rounded-2xl border border-border bg-card divide-y divide-border overflow-hidden">
            {transactions.map((tx) => {
              const kind = describeMovement(tx.type, tx.direction);
              const tone = MOVEMENT_TONE_CLASSES[kind.tone];
              return (
                <div key={tx.id} className="flex items-center gap-3 px-4 py-3">
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0", tone.icon)}>
                    {tx.categories ? (
                      <span className="text-base" aria-hidden="true">{tx.categories.icon || "💰"}</span>
                    ) : (
                      <kind.Icon className="w-4 h-4" aria-hidden="true" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{tx.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {tx.categories?.name ?? ""}{tx.accounts ? ` · ${tx.accounts.name}` : ""}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={cn("text-sm font-semibold tabular-nums", tone.text)}>
                      {kind.sign}{formatCurrency(Number(tx.amount), tx.currency_code)}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatDateOnly(tx.transaction_date)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card p-8 text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-muted/50 flex items-center justify-center mb-3">
              <Repeat className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">Sin movimientos aún</p>
            <p className="mt-1 text-xs text-muted-foreground">Registra tu primer gasto o ingreso para ver la cascada.</p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <a
                href="/transacciones/nuevo?type=expense"
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium"
              >
                <Plus className="w-3.5 h-3.5" /> Registrar gasto
              </a>
              <a
                href="/transacciones/nuevo?type=income"
                className="inline-flex items-center gap-1.5 px-3 py-2 border border-border bg-card text-foreground rounded-lg text-xs font-medium"
              >
                Registrar ingreso
              </a>
            </div>
          </div>
        )}
      </section>

      {/* ── Link a resumen ── */}
      <a
        href="/resumen"
        className="flex items-center justify-between p-4 rounded-2xl border border-border bg-card text-sm font-medium text-foreground active:scale-95 transition-transform"
      >
        <span>Ver resumen del mes entrante</span>
        <ArrowRight className="w-4 h-4 text-muted-foreground" />
      </a>

    </main>
  );
}
