import { requireAdmin } from "@/lib/admin";
import { listUsers } from "@/lib/services/user.service";
import { updateUserRole, deleteUser } from "./actions";
import NewUserForm from "./new-user-form";

export default async function AdminUsersPage() {
  await requireAdmin();
  const users = await listUsers();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">
          Administración de usuarios
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Crea, promueve y elimina usuarios de la plataforma.
        </p>
      </div>

      <NewUserForm />

      <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-200 text-xs uppercase text-zinc-500">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Correo</th>
              <th className="px-4 py-3">Rol</th>
              <th className="px-4 py-3">Proveedor</th>
              <th className="px-4 py-3">Cuentas</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3 text-zinc-800">{u.name ?? "-"}</td>
                <td className="px-4 py-3 text-zinc-600">{u.email}</td>
                <td className="px-4 py-3">
                  <span
                    className={
                      u.role === "ADMIN"
                        ? "rounded-full bg-zinc-900 px-2 py-0.5 text-xs font-medium text-white"
                        : "rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600"
                    }
                  >
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-zinc-600">{u.authProvider}</td>
                <td className="px-4 py-3 text-zinc-600">{u.accountCount}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    {u.role === "ADMIN" ? (
                      <form action={updateUserRole.bind(null, u.id, "USER")}>
                        <button className="rounded-lg border border-zinc-300 px-3 py-1 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50">
                          Quitar admin
                        </button>
                      </form>
                    ) : (
                      <form action={updateUserRole.bind(null, u.id, "ADMIN")}>
                        <button className="rounded-lg border border-zinc-300 px-3 py-1 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50">
                          Hacer admin
                        </button>
                      </form>
                    )}
                    <form action={deleteUser.bind(null, u.id)}>
                      <button className="rounded-lg border border-red-200 px-3 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50">
                        Eliminar
                      </button>
                    </form>
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
