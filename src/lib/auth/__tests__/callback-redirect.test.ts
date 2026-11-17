import { describe, it, expect } from "vitest";
import { resolveBaseUrl, sanitizeNextPath } from "../callback-redirect";

const headers = (h: Record<string, string>) => ({ get: (n: string) => h[n.toLowerCase()] ?? null });

describe("sanitizeNextPath", () => {
  it("acepta rutas internas", () => {
    expect(sanitizeNextPath("/reset-password")).toBe("/reset-password");
    expect(sanitizeNextPath("/presupuestos?month=2026-11")).toBe("/presupuestos?month=2026-11");
  });
  it("sin valor usa el dashboard", () => {
    expect(sanitizeNextPath(null)).toBe("/dashboard");
    expect(sanitizeNextPath("")).toBe("/dashboard");
  });
  it.each([
    "@evil.com",
    "//evil.com",
    "https://evil.com",
    "javascript:alert(1)",
    "/\\evil.com",
    "/ok\r\nSet-Cookie: x=1",
    "evil.com/x",
  ])("rechaza redirecciones externas o peligrosas: %s", (next) => {
    expect(sanitizeNextPath(next)).toBe("/dashboard");
  });
});

describe("resolveBaseUrl", () => {
  it("sin proxy usa el origen de la petición", () => {
    expect(resolveBaseUrl("http://localhost:3000", headers({}))).toBe("http://localhost:3000");
  });
  it("detrás de un proxy usa el host y el protocolo reenviados", () => {
    expect(resolveBaseUrl("http://10.0.0.1", headers({ "x-forwarded-host": "app.lukiva.co", "x-forwarded-proto": "https" }))).toBe("https://app.lukiva.co");
  });
  it("respeta http reenviado (antes forzaba https y rompía entornos sin TLS)", () => {
    expect(resolveBaseUrl("http://localhost:3217", headers({ "x-forwarded-host": "localhost:3217", "x-forwarded-proto": "http" }))).toBe("http://localhost:3217");
  });
  it("sin protocolo reenviado conserva el de la petición", () => {
    expect(resolveBaseUrl("http://localhost:3217", headers({ "x-forwarded-host": "localhost:3217" }))).toBe("http://localhost:3217");
    expect(resolveBaseUrl("https://x.co", headers({ "x-forwarded-host": "app.lukiva.co" }))).toBe("https://app.lukiva.co");
  });
  it("ignora valores de protocolo desconocidos y toma el primero de una lista", () => {
    expect(resolveBaseUrl("https://x.co", headers({ "x-forwarded-host": "a.co, b.co", "x-forwarded-proto": "ftp" }))).toBe("https://a.co");
    expect(resolveBaseUrl("http://x.co", headers({ "x-forwarded-host": "a.co", "x-forwarded-proto": "https, http" }))).toBe("https://a.co");
  });
});
