import Link from "next/link";
import { requirePermission } from "@/lib/auth/permissions";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Verificación en servidor: sin sesión → /login; sin permiso → 404
  const ctx = await requirePermission("admin.access");
  const can = (p: string) => ctx.permissions.includes(p as never);

  return (
    <div>
      <nav aria-label="Administración" className="border-b border-border bg-card px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-5xl gap-1 overflow-x-auto py-2 text-sm">
          <Link href="/admin" className="rounded-lg px-3 py-1.5 hover:bg-muted">Resumen</Link>
          {can("users.read") && <Link href="/admin/usuarios" className="rounded-lg px-3 py-1.5 hover:bg-muted">Usuarios</Link>}
          {can("audit.read") && <Link href="/admin/auditoria" className="rounded-lg px-3 py-1.5 hover:bg-muted">Auditoría</Link>}
        </div>
      </nav>
      {children}
    </div>
  );
}
