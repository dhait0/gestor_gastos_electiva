import { describe, expect, it } from "vitest";
import { changeEmailSchema, changePasswordSchema, profileSettingsSchema } from "../account";

const profile = { displayName: "Ana", currencyCode: "COP", timezone: "America/Bogota", safetyReserve: "100000" };

describe("profileSettingsSchema", () => {
  it("acepta un perfil válido y convierte la reserva a número", () => {
    expect(profileSettingsSchema.parse(profile).safetyReserve).toBe(100000);
  });
  it("rechaza nombre vacío, moneda o zona no disponibles y reserva negativa", () => {
    expect(profileSettingsSchema.safeParse({ ...profile, displayName: "   " }).success).toBe(false);
    expect(profileSettingsSchema.safeParse({ ...profile, currencyCode: "JPY" }).success).toBe(false);
    expect(profileSettingsSchema.safeParse({ ...profile, timezone: "Mars/Base" }).success).toBe(false);
    expect(profileSettingsSchema.safeParse({ ...profile, safetyReserve: "-1" }).success).toBe(false);
    expect(profileSettingsSchema.safeParse({ ...profile, safetyReserve: "abc" }).success).toBe(false);
  });
});

describe("changeEmailSchema", () => {
  it("normaliza a minúsculas y valida el formato", () => {
    expect(changeEmailSchema.parse({ email: "  Ana@Correo.COM " }).email).toBe("ana@correo.com");
    expect(changeEmailSchema.safeParse({ email: "sin-arroba" }).success).toBe(false);
  });
});

describe("changePasswordSchema", () => {
  const ok = { currentPassword: "vieja-clave", password: "nueva-clave-1", confirmPassword: "nueva-clave-1" };
  it("acepta un cambio válido", () => expect(changePasswordSchema.safeParse(ok).success).toBe(true));
  it("exige 8 caracteres, que coincidan y que sea distinta de la actual", () => {
    expect(changePasswordSchema.safeParse({ ...ok, password: "corta", confirmPassword: "corta" }).success).toBe(false);
    expect(changePasswordSchema.safeParse({ ...ok, confirmPassword: "otra-distinta" }).success).toBe(false);
    expect(changePasswordSchema.safeParse({ ...ok, password: "vieja-clave", confirmPassword: "vieja-clave" }).success).toBe(false);
    expect(changePasswordSchema.safeParse({ ...ok, currentPassword: "" }).success).toBe(false);
  });
});
