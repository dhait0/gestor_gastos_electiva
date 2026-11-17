import { getAuthorizationContext } from "@/lib/auth/permissions";
import { getAdminMetricsAction } from "@/app/actions/admin";
import { METRIC_LABELS, ROLE_LABELS } from "@/domain/permissions";

export default async function AdminPage() {
  const ctx = await getAuthorizationContext();
  const canMetrics = ctx?.permissions.includes("metrics.read") ?? false;
  const metrics = canMetrics ? await getAdminMetricsAction() : null;

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <header>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-heading">Administración</h1>
          <p className="mt-1 text-muted-foreground">
            Tu rol: {ctx ? ROLE_LABELS[ctx.role] : ""}. Aquí no se ven cuentas, movimientos ni saldos de nadie.
          </p>
        </header>

        {metrics && "error" in metrics && (
          <p className="text-destructive" role="alert">{metrics.error}</p>
        )}

        {metrics && "data" in metrics && (
          <section aria-label="Métricas" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(METRIC_LABELS).map(([key, label]) => (
              <div key={key} className="rounded-xl border border-border bg-card p-4">
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">{metrics.data[key] ?? 0}</p>
              </div>
            ))}
          </section>
        )}

        {!canMetrics && (
          <p className="text-sm text-muted-foreground">Tu rol no incluye métricas. Usa «Usuarios» para tareas de soporte.</p>
        )}
      </div>
    </main>
  );
}
