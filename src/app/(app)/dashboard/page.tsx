import { cn } from "@/lib/utils";
import { LayoutDashboard, Plus, ArrowDownLeft, ArrowUpRight, AlertTriangle, CheckCircle, ChevronRight, Wallet } from "lucide-react";
import { getFinancialSummaryAction } from "@/app/actions/financial";
import { getTransactionsAction } from "@/app/actions/transactions";
import { getAccountsAction } from "@/app/actions/accounts";
import { formatCurrency } from "@/lib/utils";
import { Decimal } from "decimal.js";

async function getDashboardData() {
  const [summaryResult, transactionsResult, accountsResult] = await Promise.all([
    getFinancialSummaryAction(),
    getTransactionsAction({ limit: 5 }),
    getAccountsAction(),
  ]);

  return { summaryResult, transactionsResult, accountsResult };
}

function getStatusInfo(available: Decimal, pendingObligations: Decimal, liquidBalance: Decimal) {
  if (available.lessThan(0)) {
    return {
      label: "Tus compromisos superan tu saldo líquido",
      icon: AlertTriangle,
      iconColor: "text-danger",
      bgColor: "bg-danger/10",
      borderColor: "border-danger/20",
      variant: "risk" as const,
    };
  }
  if (available.lessThan(liquidBalance.mul(0.2))) {
    return {
      label: "Revisa tus compromisos",
      icon: AlertTriangle,
      iconColor: "text-warning",
      bgColor: "bg-warning/10",
      borderColor: "border-warning/20",
      variant: "attention" as const,
    };
  }
  return {
    label: "Situación estable",
    icon: CheckCircle,
    iconColor: "text-success",
    bgColor: "bg-success/10",
    borderColor: "border-success/20",
    variant: "healthy" as const,
  };
}

function formatDecimal(value: Decimal, currencyCode: string) {
  return formatCurrency(value.toNumber(), currencyCode);
}

export default async function DashboardPage() {
  const { summaryResult, transactionsResult, accountsResult } = await getDashboardData();

  if ("error" in summaryResult) {
    return (
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-6 text-center">
            <p className="text-destructive">Error al cargar el resumen financiero: {summaryResult.error}</p>
          </div>
        </div>
      </main>
    );
  }

  const { liquidBalance, pendingObligations, safetyReserve, availableToSpend, currencyCode, monthlyIncome, monthlyExpense } = summaryResult.data;
  const transactions = transactionsResult.data || [];
  const hasTransactions = transactions.length > 0;
  const accounts = accountsResult.data || [];
  const hasAccounts = accounts.length > 0;
  const hasPendingObligations = pendingObligations.greaterThan(0);

  const statusInfo = getStatusInfo(availableToSpend, pendingObligations, liquidBalance);
  const StatusIcon = statusInfo.icon;

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-heading">
              Dashboard
            </h1>
            <p className="mt-1 text-muted-foreground">
              Tu panorama financiero
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/transacciones/nuevo?type=expense"
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2",
                "bg-primary text-primary-foreground",
                "rounded-lg font-medium text-sm",
                "hover:shadow-finn-elevated hover:-translate-y-0.5",
                "transition-all duration-150"
              )}
            >
              <Plus className="w-4 h-4" />
              Nueva transacción
            </a>
          </div>
        </header>

        {!hasAccounts && (
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <Wallet className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-medium text-foreground">Aún no tienes cuentas</h2>
            <p className="mt-1 text-sm text-muted-foreground max-w-xs mx-auto">
              Crea tu primera cuenta para empezar a registrar tus movimientos y ver tu panorama financiero.
            </p>
            <a
              href="/cuentas/nueva"
              className={cn(
                "mt-6 inline-flex items-center gap-2 px-4 py-2",
                "bg-primary text-primary-foreground",
                "rounded-lg font-medium text-sm",
                "hover:shadow-finn-elevated hover:-translate-y-0.5",
                "transition-all duration-150"
              )}
            >
              <Plus className="w-4 h-4" />
              Crear primera cuenta
            </a>
          </div>
        )}

        <section aria-labelledby="available-heading" className="space-y-4">
          <h2 id="available-heading" className="sr-only">
            Dinero disponible
          </h2>
          <div className={cn(
            "rounded-2xl p-6 sm:p-8",
            statusInfo.bgColor,
            statusInfo.borderColor,
            "border",
            "relative overflow-hidden"
          )}>
            <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-primary">Dinero disponible</p>
                <p className="mt-1 text-4xl sm:text-5xl font-bold text-foreground font-sans tabular-nums">
                  {formatDecimal(availableToSpend, currencyCode)}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <div className={cn("p-2 rounded-lg", statusInfo.bgColor)}>
                    <StatusIcon className={cn("w-4 h-4", statusInfo.iconColor)} />
                  </div>
                  <p className={cn("text-sm font-medium", statusInfo.iconColor)}>
                    {statusInfo.label}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-xl text-primary">
                  <LayoutDashboard className="w-6 h-6" />
                </div>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-4 text-center">
              <div className="rounded-xl bg-background/50 p-4 border border-border/50">
                <p className="text-sm text-muted-foreground">Saldo líquido</p>
                <p className="mt-1 text-xl font-semibold text-foreground tabular-nums">
                  {formatDecimal(liquidBalance, currencyCode)}
                </p>
              </div>
              <div className="rounded-xl bg-background/50 p-4 border border-border/50">
                <p className="text-sm text-muted-foreground">Compromisos</p>
                {hasPendingObligations ? (
                  <p className="mt-1 text-xl font-semibold text-danger tabular-nums">
                    -{formatDecimal(pendingObligations, currencyCode)}
                  </p>
                ) : (
                  <p className="mt-1 text-sm font-medium text-success">
                    Sin obligaciones pendientes
                  </p>
                )}
              </div>
              <div className="rounded-xl bg-background/50 p-4 border border-border/50">
                <p className="text-sm text-muted-foreground">Reserva</p>
                <p className="mt-1 text-xl font-semibold text-warning tabular-nums">
                  -{formatDecimal(safetyReserve, currencyCode)}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section aria-labelledby="income-expense-heading" className="space-y-4">
          <header className="flex items-center justify-between">
            <h2 id="income-expense-heading" className="text-lg font-semibold text-foreground">
              Resumen del mes
            </h2>
          </header>
          <div className="grid grid-cols-2 gap-3">
            <div className={cn(
              "rounded-xl p-4 border",
              "bg-success/5 border-success/20"
            )}>
              <p className="text-sm text-muted-foreground">Ingresos</p>
              <p className="mt-1 text-2xl font-bold text-success tabular-nums">
                {formatDecimal(monthlyIncome, currencyCode)}
              </p>
              <p className="mt-1 flex items-center gap-1 text-xs text-success">
                <ArrowUpRight className="w-3 h-3" />
                <span>Este mes</span>
              </p>
            </div>
            <div className={cn(
              "rounded-xl p-4 border",
              "bg-danger/5 border-danger/20"
            )}>
              <p className="text-sm text-muted-foreground">Gastos</p>
              <p className="mt-1 text-2xl font-bold text-danger tabular-nums">
                {formatDecimal(monthlyExpense, currencyCode)}
              </p>
              <p className="mt-1 flex items-center gap-1 text-xs text-danger">
                <ArrowDownLeft className="w-3 h-3" />
                <span>Este mes</span>
              </p>
            </div>
          </div>
        </section>

        <section aria-labelledby="cashflow-heading" className="space-y-4">
          <header className="flex items-center justify-between">
            <h2 id="cashflow-heading" className="text-lg font-semibold text-foreground">
              Flujo mensual
            </h2>
          </header>
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="h-48 flex items-center justify-center">
              <p className="text-muted-foreground text-center px-4">
                Gráfico de flujo de efectivo (próximamente)
              </p>
            </div>
          </div>
        </section>

        <section aria-labelledby="insights-heading" className="space-y-4">
          <header className="flex items-center justify-between">
            <h2 id="insights-heading" className="text-lg font-semibold text-foreground">
              Lukiva Insight
            </h2>
          </header>
          <div className="rounded-xl border border-border bg-card p-4">
            {availableToSpend.lessThan(0) ? (
              <div className="flex items-start gap-3 p-3 bg-danger/10 rounded-lg border border-danger/20">
                <AlertTriangle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-danger">Tus compromisos superan tu saldo líquido</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Considera revisar tus obligaciones pendientes o ajustar tus gastos.
                  </p>
                </div>
              </div>
            ) : safetyReserve.greaterThan(0) && availableToSpend.lessThan(safetyReserve) ? (
              <div className="flex items-start gap-3 p-3 bg-warning/10 rounded-lg border border-warning/20">
                <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-warning">Tu disponible está por debajo de la reserva de seguridad</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    La reserva de seguridad reduce tu margen de gasto.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 p-3 bg-success/10 rounded-lg border border-success/20">
                <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-success">Situación financiera estable</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Tienes margen para gastar sin comprometer tus obligaciones.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        <section aria-labelledby="recent-transactions-heading" className="space-y-4">
          <header className="flex items-center justify-between">
            <h2 id="recent-transactions-heading" className="text-lg font-semibold text-foreground">
              Movimientos recientes
            </h2>
            <a
              href="/transacciones"
              className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
            >
              Ver todos
              <ChevronRight className="w-4 h-4" />
            </a>
          </header>
          {hasTransactions ? (
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <ul className="divide-y divide-border" role="list">
                {transactions.map((transaction) => (
                  <li key={transaction.id} className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-2 rounded-lg",
                        transaction.type === "INCOME" ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
                      )}>
                        {transaction.categories && (
                          <span className="text-lg" aria-hidden="true">{transaction.categories.icon || "💰"}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {transaction.description}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-2">
                          {transaction.categories && (
                            <span>{transaction.categories.name}</span>
                          )}
                          {transaction.accounts && (
                            <>
                              <span>·</span>
                              <span>{transaction.accounts.name}</span>
                            </>
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={cn(
                          "font-semibold tabular-nums",
                          transaction.type === "INCOME" ? "text-success" : "text-danger"
                        )}>
                          {transaction.type === "INCOME" ? "+" : "-"}
                          {formatCurrency(Number(transaction.amount), transaction.currency_code)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(transaction.transaction_date).toLocaleDateString("es-CO", {
                            day: "numeric",
                            month: "short",
                          })}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card p-8 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                <LayoutDashboard className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground">Aún no tienes movimientos</h3>
              <p className="mt-1 text-sm text-muted-foreground max-w-xs mx-auto">
                Registra tu primer ingreso o gasto para comenzar a entender tus finanzas.
              </p>
              <div className="mt-6 flex items-center justify-center gap-3">
                <a
                  href="/transacciones/nuevo?type=expense"
                  className={cn(
                    "inline-flex items-center gap-2 px-4 py-2",
                    "bg-primary text-primary-foreground",
                    "rounded-lg font-medium text-sm",
                    "hover:shadow-finn-elevated hover:-translate-y-0.5",
                    "transition-all duration-150"
                  )}
                >
                  <Plus className="w-4 h-4" />
                  Registrar gasto
                </a>
                <a
                  href="/transacciones/nuevo?type=income"
                  className={cn(
                    "inline-flex items-center gap-2 px-4 py-2",
                    "border border-border bg-card text-foreground",
                    "rounded-lg font-medium text-sm",
                    "hover:bg-muted/50",
                    "transition-colors"
                  )}
                >
                  Registrar ingreso
                </a>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}