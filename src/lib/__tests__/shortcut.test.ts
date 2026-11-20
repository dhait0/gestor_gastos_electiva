import { describe, expect, it } from "vitest";
import { describeShortcutError, generateShortcutToken, hashShortcutToken, parseAmountText, parseMovementBody, readBearerToken } from "../shortcut";

describe("tokens de atajos", () => {
  it("genera tokens únicos con prefijo, hash SHA-256 y formato aceptado por el servidor", () => {
    const a = generateShortcutToken();
    const b = generateShortcutToken();
    expect(a.token).toMatch(/^lkv_[A-Za-z0-9_-]{43}$/);
    expect(a.token).not.toBe(b.token);
    expect(a.hash).toMatch(/^[0-9a-f]{64}$/);
    expect(a.hash).toBe(hashShortcutToken(a.token));
    expect(a.prefix).toBe(a.token.slice(0, 8));
    expect(a.hash).not.toContain(a.token);
  });

  it("lee el token del encabezado Authorization y rechaza formatos raros", () => {
    const { token } = generateShortcutToken();
    expect(readBearerToken(`Bearer ${token}`)).toBe(token);
    expect(readBearerToken(`Bearer ${token}  `)).toBe(token);
    expect(readBearerToken(token)).toBeNull();
    expect(readBearerToken(`Basic ${token}`)).toBeNull();
    expect(readBearerToken("Bearer lkv_corto")).toBeNull();
    expect(readBearerToken(null)).toBeNull();
  });
});

describe("parseMovementBody", () => {
  const ok = { tipo: "gasto", monto: 45000, descripcion: "Almuerzo", cuenta: "Efectivo", categoria: "Comida" };

  it("acepta un gasto válido y normaliza campos vacíos a null", () => {
    expect(parseMovementBody(ok)).toEqual({
      ok: true,
      value: { tipo: "EXPENSE", monto: 45000, descripcion: "Almuerzo", cuenta: "Efectivo", categoria: "Comida", fecha: null, clave: null },
    });
    const sinOpcionales = parseMovementBody({ monto: 10, categoria: "Comida", descripcion: "  ", cuenta: "" });
    expect(sinOpcionales).toMatchObject({ ok: true, value: { tipo: "EXPENSE", descripcion: null, cuenta: null } });
  });

  it("entiende ingreso/income sin importar mayúsculas y rechaza otros tipos", () => {
    expect(parseMovementBody({ ...ok, tipo: "Ingreso" })).toMatchObject({ ok: true, value: { tipo: "INCOME" } });
    expect(parseMovementBody({ ...ok, tipo: "INCOME" })).toMatchObject({ ok: true, value: { tipo: "INCOME" } });
    expect(parseMovementBody({ ...ok, tipo: "transferencia" })).toMatchObject({ ok: false });
  });

  it("acepta el monto como número o como texto numérico, y rechaza el resto", () => {
    expect(parseMovementBody({ ...ok, monto: "45000.50" })).toMatchObject({ ok: true, value: { monto: 45000.5 } });
    for (const monto of [0, -1, "abc", "", "1.2.3", "-5", null, undefined, NaN, Infinity, 2e12]) {
      expect(parseMovementBody({ ...ok, monto }), String(monto)).toMatchObject({ ok: false });
    }
  });

  it("valida la fecha, la clave y los largos", () => {
    expect(parseMovementBody({ ...ok, fecha: "2026-11-20" })).toMatchObject({ ok: true, value: { fecha: "2026-11-20" } });
    expect(parseMovementBody({ ...ok, fecha: "20/11/2026" })).toMatchObject({ ok: false });
    expect(parseMovementBody({ ...ok, descripcion: "x".repeat(201) })).toMatchObject({ ok: false });
    expect(parseMovementBody({ ...ok, clave: "x".repeat(101) })).toMatchObject({ ok: false });
    expect(parseMovementBody({ ...ok, cuenta: { nombre: "x" } })).toMatchObject({ ok: false });
  });

  it("rechaza cuerpos que no son un objeto", () => {
    for (const body of [null, "texto", 5, [], undefined]) expect(parseMovementBody(body)).toMatchObject({ ok: false });
  });
});

describe("describeShortcutError", () => {
  it("traduce los errores de la base de datos a estado y mensaje para la persona", () => {
    expect(describeShortcutError("INVALID_TOKEN")).toMatchObject({ status: 401, code: "INVALID_TOKEN" });
    expect(describeShortcutError("ACCOUNT_NOT_FOUND")).toMatchObject({ status: 400 });
    expect(describeShortcutError("CATEGORY_NOT_FOUND")).toMatchObject({ status: 400 });
  });
  it("no filtra errores desconocidos: responde un mensaje genérico", () => {
    const unknown = describeShortcutError('relation "x" does not exist');
    expect(unknown.status).toBe(500);
    expect(unknown.message).not.toContain("relation");
  });
});

describe("parseAmountText", () => {
  it("entiende el formato colombiano que Atajos produce al convertir un número a texto", () => {
    expect(parseAmountText("45000")).toBe(45000);
    expect(parseAmountText("45.000")).toBe(45000);
    expect(parseAmountText("1.250.000")).toBe(1250000);
    expect(parseAmountText("45.000,50")).toBe(45000.5);
    expect(parseAmountText("45000,5")).toBe(45000.5);
    expect(parseAmountText("45000.50")).toBe(45000.5);
    expect(parseAmountText(" $ 45.000 ")).toBe(45000);
  });
  it("rechaza lo que no es un monto", () => {
    for (const text of ["", "abc", "1.2.3", "45,000,000", "-5", "1e6", "45.0000.00"]) expect(parseAmountText(text), text).toBeNull();
  });
});
