/**
 * Matriz de permisos (ADR-008). Es un espejo documentado de los datos sembrados
 * en la migración `20261114180000_rbac_admin.sql`; la autoridad real es la base
 * de datos. Una prueba de contrato impide que ambas diverjan en lo esencial.
 */
export type RoleKey = "user" | "support" | "admin";

export type PermissionKey =
  | "admin.access"
  | "users.read"
  | "users.roles.manage"
  | "metrics.read"
  | "audit.read";

export const ROLE_KEYS: RoleKey[] = ["user", "support", "admin"];

export const ROLE_LABELS: Record<RoleKey, string> = {
  user: "Usuario",
  support: "Soporte",
  admin: "Administrador",
};

export const ROLE_PERMISSIONS: Record<RoleKey, PermissionKey[]> = {
  user: [],
  support: ["admin.access", "users.read"],
  admin: ["admin.access", "users.read", "users.roles.manage", "metrics.read", "audit.read"],
};

export function isRoleKey(value: string): value is RoleKey {
  return (ROLE_KEYS as string[]).includes(value);
}

export function roleHasPermission(role: RoleKey, permission: PermissionKey): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

/** Etiquetas de las métricas agregadas (solo conteos). */
export const METRIC_LABELS: Record<string, string> = {
  users_total: "Usuarios registrados",
  users_last_30_days: "Altas en los últimos 30 días",
  users_support: "Usuarios de soporte",
  users_admin: "Administradores",
  accounts_total: "Cuentas activas",
  transactions_total: "Movimientos registrados",
};
