import { requireAdmin } from "@/lib/admin";
import { listUsers } from "@/lib/services/user.service";
import { updateUserRole } from "./actions";
import NewUserForm from "./new-user-form";
import DeleteUserButton from "./delete-user-button";

export default async function AdminUsersPage() {
  await requireAdmin();
  const users = await listUsers();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Administración de usuarios
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Crea, promueve y elimina usuarios de la plataforma.
        </p>
      </div>

      <NewUserForm />

      <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Correo</th>
              <th className="px-4 py-3">Rol</th>
              <th className="px-4 py-3">Proveedor</th>
              <th className="px-4 py-3">Cuentas</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3 text-foreground">{u.name ?? "-"}</td>
                <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                <td className="px-4 py-3">
                  <span
                    className={
                      u.role === "ADMIN"
                        ? "rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground"
                        : "rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
                    }
                  >
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {u.authProvider}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {u.accountCount}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    {u.role === "ADMIN" ? (
                      <form action={updateUserRole.bind(null, u.id, "USER")}>
                        <button className="rounded-lg border border-border px-3 py-1 text-xs font-medium text-foreground transition hover:bg-muted">
                          Quitar admin
                        </button>
                      </form>
                    ) : (
                      <form action={updateUserRole.bind(null, u.id, "ADMIN")}>
                        <button className="rounded-lg border border-border px-3 py-1 text-xs font-medium text-foreground transition hover:bg-muted">
                          Hacer admin
                        </button>
                      </form>
                    )}
                      <DeleteUserButton id={u.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
