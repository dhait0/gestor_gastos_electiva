import { AlertTriangle, Bell, CheckCircle2, Info, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { getAlertsAction } from "@/app/actions/alerts";
import { AutoRefreshAlerts, MarkAllReadButton, MarkReadButton } from "@/components/alerts/AlertsClient";

const SEVERITY = {
  INFO: { icon: Info, style: "border-primary/30 bg-primary/5", color: "text-primary", label: "Info" },
  SUCCESS: { icon: CheckCircle2, style: "border-success/30 bg-success/5", color: "text-success", label: "Bien hecho" },
  WARNING: { icon: AlertTriangle, style: "border-warning/30 bg-warning/5", color: "text-warning", label: "Atención" },
  CRITICAL: { icon: XCircle, style: "border-danger/30 bg-danger/5", color: "text-danger", label: "Importante" },
} as const;

export default async function AlertasPage() {
  const result = await getAlertsAction();

  if ("error" in result) {
    return (
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-3xl rounded-xl border border-destructive/50 bg-destructive/10 p-6 text-center">
          <p className="text-destructive">Error al cargar las alertas: {result.error}</p>
        </div>
      </main>
    );
  }

  const { alerts, unread } = result.data;

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <AutoRefreshAlerts />
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-heading">Alertas</h1>
            <p className="mt-1 text-muted-foreground" aria-live="polite">
              {unread === 0 ? "Estás al día" : `${unread} sin leer`}
            </p>
          </div>
          {unread > 0 && <MarkAllReadButton />}
        </header>

        {alerts.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-medium text-foreground">Sin alertas por ahora</h2>
            <p className="mt-1 text-sm text-muted-foreground max-w-xs mx-auto">
              Te avisamos aquí, dentro de la app, cuando algo de tu dinero necesite atención.
            </p>
          </div>
        ) : (
          <ul className="space-y-3" role="list">
            {alerts.map((a) => {
              const s = SEVERITY[a.severity];
              const Icon = s.icon;
              return (
                <li key={a.id} className={cn("rounded-xl border p-4", s.style, a.is_read && "opacity-60")}>
                  <div className="flex items-start gap-3">
                    <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", s.color)} aria-hidden="true" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground">
                        <span className="sr-only">{s.label}: </span>
                        {a.title}
                      </p>
                      <p className="mt-0.5 text-sm text-muted-foreground">{a.message}</p>
                    </div>
                    {!a.is_read && <MarkReadButton id={a.id} />}
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
