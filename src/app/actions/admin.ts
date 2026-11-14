"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/auth/permissions";
import { isRoleKey, type RoleKey } from "@/domain/permissions";

export interface AdminUserRow {
  id: string;
  display_name: string | null;
  email: string;
  created_at: string;
  role_key: RoleKey;
}

export interface AuditLogRow {
  id: string;
  actor_email: string | null;
  action: string;
  target_email: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

/** Cada acción vuelve a exigir el permiso en servidor; la base de datos lo exige una vez más. */
export async function getAdminUsersAction(): Promise<{ data: AdminUserRow[] } | { error: string }> {
  await requirePermission("users.read");
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("admin_list_users", { p_limit: 100, p_offset: 0 });
  if (error) return { error: "Error al obtener los usuarios" };
  return {
    data: (data ?? []).map((u) => ({
      id: u.id,
      display_name: u.display_name,
      email: u.email,
      created_at: u.created_at,
      role_key: isRoleKey(u.role_key) ? u.role_key : "user",
    })),
  };
}

export async function setUserRoleAction(targetUserId: string, role: string) {
  await requirePermission("users.roles.manage");
  if (!isRoleKey(role)) return { error: "Rol inválido" };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("admin_set_user_role", { p_target: targetUserId, p_role_key: role });
  if (error) {
    if (error.code === "42501") return { error: error.message === "No puedes cambiar tu propio rol" ? error.message : "Sin permiso" };
    if (error.code === "23514") return { error: error.message };
    return { error: "Error al cambiar el rol" };
  }
  return { success: true };
}

export async function getAdminMetricsAction(): Promise<{ data: Record<string, number> } | { error: string }> {
  await requirePermission("metrics.read");
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("admin_aggregate_metrics");
  if (error) return { error: "Error al obtener las métricas" };
  return { data: Object.fromEntries((data ?? []).map((m) => [m.metric, Number(m.value)])) };
}

export async function getAuditLogsAction(): Promise<{ data: AuditLogRow[] } | { error: string }> {
  await requirePermission("audit.read");
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("admin_list_audit_logs", { p_limit: 100 });
  if (error) return { error: "Error al obtener la auditoría" };
  return {
    data: (data ?? []).map((l) => ({
      id: l.id,
      actor_email: l.actor_email,
      action: l.action,
      target_email: l.target_email,
      metadata: (l.metadata ?? {}) as Record<string, unknown>,
      created_at: l.created_at,
    })),
  };
}
