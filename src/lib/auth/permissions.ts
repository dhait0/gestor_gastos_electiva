import { notFound, redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isRoleKey, type PermissionKey, type RoleKey } from "@/domain/permissions";

export interface AuthorizationContext {
  userId: string;
  role: RoleKey;
  permissions: PermissionKey[];
}

/**
 * Lee el rol y los permisos del usuario autenticado desde la base de datos.
 * Nunca se confía en nada enviado por el cliente: la fuente es `user_roles`
 * a través de funciones que usan `auth.uid()` del JWT verificado.
 */
export async function getAuthorizationContext(): Promise<AuthorizationContext | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;

  const [{ data: role }, { data: permissions }] = await Promise.all([
    supabase.rpc("current_user_role"),
    supabase.rpc("current_user_permissions"),
  ]);

  return {
    userId: user.id,
    role: role && isRoleKey(role) ? role : "user",
    permissions: (permissions ?? []).map((p: { permission_key: string }) => p.permission_key as PermissionKey),
  };
}

/**
 * Exige un permiso en el servidor. Sin sesión → /login. Con sesión pero sin
 * permiso → 404 (no se revela que la consola existe).
 */
export async function requirePermission(permission: PermissionKey): Promise<AuthorizationContext> {
  const ctx = await getAuthorizationContext();
  if (!ctx) redirect("/login");
  if (!ctx.permissions.includes(permission)) notFound();
  return ctx;
}
