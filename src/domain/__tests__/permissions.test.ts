import { describe, it, expect } from "vitest";
import { ROLE_KEYS, ROLE_PERMISSIONS, isRoleKey, roleHasPermission } from "../permissions";

describe("matriz de permisos (ADR-008)", () => {
  it("el rol user no tiene ningún permiso (denegación por defecto)", () => {
    expect(ROLE_PERMISSIONS.user).toEqual([]);
  });

  it("support es un subconjunto estricto de admin", () => {
    for (const p of ROLE_PERMISSIONS.support) expect(ROLE_PERMISSIONS.admin).toContain(p);
    expect(ROLE_PERMISSIONS.admin.length).toBeGreaterThan(ROLE_PERMISSIONS.support.length);
  });

  it("support no puede gestionar roles, ver métricas ni leer la auditoría (sin escalada)", () => {
    expect(roleHasPermission("support", "users.roles.manage")).toBe(false);
    expect(roleHasPermission("support", "metrics.read")).toBe(false);
    expect(roleHasPermission("support", "audit.read")).toBe(false);
  });

  it("solo admin gestiona roles", () => {
    const withManage = ROLE_KEYS.filter((r) => roleHasPermission(r, "users.roles.manage"));
    expect(withManage).toEqual(["admin"]);
  });

  it("ningún permiso concede acceso a datos financieros ajenos", () => {
    const all = ROLE_KEYS.flatMap((r) => ROLE_PERMISSIONS[r]);
    expect(all.filter((p) => /transaction|account|budget|goal|debt|financ/.test(p))).toEqual([]);
  });

  it("isRoleKey valida los roles conocidos y rechaza el resto", () => {
    expect(isRoleKey("admin")).toBe(true);
    expect(isRoleKey("superadmin")).toBe(false);
    expect(isRoleKey("")).toBe(false);
  });
});
