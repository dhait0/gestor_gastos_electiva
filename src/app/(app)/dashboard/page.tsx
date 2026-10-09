import { cn } from "@/lib/utils";
import { LayoutDashboard, CreditCard, TrendingUp, Target, Plus } from "lucide-react";

export default function DashboardPage() {
  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-heading">
              Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Bienvenido a FinWise — tu inteligencia financiera personal
            </p>
          </div>
        </header>

        <section aria-labelledby="available-heading" className="space-y-4">
          <h2 id="available-heading" className="sr-only">
            Dinero disponible
          </h2>
          <div className={cn(
            "rounded-2xl p-6 sm:p-8",
            "bg-gradient-to-br from-primary/10 via-primary/5 to-transparent",
            "border border-primary/20",
            "relative overflow-hidden"
          )}>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] from-primary/20" />
            <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-primary">Dinero disponible</p>
                <p className="mt-1 text-4xl sm:text-5xl font-bold text-foreground font-sans tabular-nums">
                  $0
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Sin compromisos configurados
                </p>
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
                <p className="mt-1 text-xl font-semibold text-foreground tabular-nums">$0</p>
              </div>
              <div className="rounded-xl bg-background/50 p-4 border border-border/50">
                <p className="text-sm text-muted-foreground">Compromisos</p>
                <p className="mt-1 text-xl font-semibold text-foreground tabular-nums">$0</p>
              </div>
              <div className="rounded-xl bg-background/50 p-4 border border-border/50">
                <p className="text-sm text-muted-foreground">Reserva</p>
                <p className="mt-1 text-xl font-semibold text-foreground tabular-nums">$0</p>
              </div>
            </div>
          </div>
        </section>

        <section aria-labelledby="quick-actions-heading" className="space-y-4">
          <header className="flex items-center justify-between">
            <h2 id="quick-actions-heading" className="text-lg font-semibold text-foreground">
              Acciones rápidas
            </h2>
          </header>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <a
              href="/transacciones/nuevo?type=expense"
              className={cn(
                "flex flex-col items-center gap-2 p-4",
                "rounded-xl border border-border",
                "bg-card hover:bg-muted/50",
                "transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              )}
            >
              <div className="p-3 bg-danger/10 rounded-xl text-danger">
                <CreditCard className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium text-foreground">Registrar gasto</span>
            </a>
            <a
              href="/transacciones/nuevo?type=income"
              className={cn(
                "flex flex-col items-center gap-2 p-4",
                "rounded-xl border border-border",
                "bg-card hover:bg-muted/50",
                "transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              )}
            >
              <div className="p-3 bg-success/10 rounded-xl text-success">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium text-foreground">Registrar ingreso</span>
            </a>
            <a
              href="/cuentas/nueva"
              className={cn(
                "flex flex-col items-center gap-2 p-4",
                "rounded-xl border border-border",
                "bg-card hover:bg-muted/50",
                "transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              )}
            >
              <div className="p-3 bg-primary/10 rounded-xl text-primary">
                <Plus className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium text-foreground">Nueva cuenta</span>
            </a>
            <a
              href="/obligaciones/nueva"
              className={cn(
                "flex flex-col items-center gap-2 p-4",
                "rounded-xl border border-border",
                "bg-card hover:bg-muted/50",
                "transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              )}
            >
              <div className="p-3 bg-warning/10 rounded-xl text-warning">
                <Target className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium text-foreground">Nueva obligación</span>
            </a>
          </div>
        </section>

        <section aria-labelledby="empty-state-heading" className="space-y-4">
          <header className="flex items-center justify-between">
            <h2 id="empty-state-heading" className="text-lg font-semibold text-foreground">
              Movimientos recientes
            </h2>
          </header>
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
        </section>
      </div>
    </main>
  );
}