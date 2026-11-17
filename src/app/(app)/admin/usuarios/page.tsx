import { getAuthorizationContext, requirePermission } from "@/lib/auth/permissions";
import { getAdminUsersAction } from "@/app/actions/admin";
import { ROLE_LABELS } from "@/domain/permissions";
import { RoleSelect } from "@/components/admin/RoleSelect";

export default async function AdminUsuariosPage() {
  await requirePermission("users.read");
  const ctx = await getAuthorizationContext();
  const canManage = ctx?.permissions.includes("users.roles.manage") ?? false;
  const result = await getAdminUsersAction();

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <header>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-heading">Usuarios</h1>
          <p className="mt-1 text-muted-foreground">Datos de cuenta mínimos. Nunca datos financieros.</p>
        </header>

        {"error" in result ? (
          <p className="text-destructive" role="alert">{result.error}</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="border-b border-border text-left text-muted-foreground">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">Usuario</th>
                  <th scope="col" className="px-4 py-3 font-medium">Alta</th>
                  <th scope="col" className="px-4 py-3 font-medium">Rol</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {result.data.map((u) => (
                  <tr key={u.id}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{u.display_name || "Sin nombre"}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </td>
                    <td className="px-4 py-3 tabular-nums text-muted-foreground">{u.created_at.slice(0, 10)}</td>
                    <td className="px-4 py-3">
                      {canManage && u.id !== ctx?.userId ? (
                        <RoleSelect userId={u.id} role={u.role_key} email={u.email} />
                      ) : (
                        ROLE_LABELS[u.role_key]
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
