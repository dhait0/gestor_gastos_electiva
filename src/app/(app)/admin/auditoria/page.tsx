import { requirePermission } from "@/lib/auth/permissions";
import { getAuditLogsAction } from "@/app/actions/admin";

const ACTION_LABELS: Record<string, string> = {
  "role.changed": "Cambio de rol",
  "role.bootstrap": "Alta del primer administrador",
};

export default async function AdminAuditoriaPage() {
  await requirePermission("audit.read");
  const result = await getAuditLogsAction();

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <header>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-heading">Auditoría</h1>
          <p className="mt-1 text-muted-foreground">Quién cambió qué. Solo se registran cambios de roles.</p>
        </header>

        {"error" in result ? (
          <p className="text-destructive" role="alert">{result.error}</p>
        ) : result.data.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aún no hay registros.</p>
        ) : (
          <ul className="divide-y divide-border rounded-xl border border-border bg-card" role="list">
            {result.data.map((l) => (
              <li key={l.id} className="px-4 py-3 text-sm">
                <p className="font-medium text-foreground">
                  {ACTION_LABELS[l.action] ?? l.action}
                  {l.target_email ? ` · ${l.target_email}` : ""}
                </p>
                <p className="text-xs text-muted-foreground">
                  {String(l.metadata.from ?? "—")} → {String(l.metadata.to ?? "—")} · por {l.actor_email ?? "sistema"} ·{" "}
                  {l.created_at.replace("T", " ").slice(0, 16)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
