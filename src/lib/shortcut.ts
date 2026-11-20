import { createHash, randomBytes } from "node:crypto";

/** Utilidades de los Atajos del iPhone: tokens, lectura de la petición y mensajes de error. */

const TOKEN_PREFIX = "lkv_";

export function generateShortcutToken(): { token: string; hash: string; prefix: string } {
  const token = TOKEN_PREFIX + randomBytes(32).toString("base64url");
  return { token, hash: hashShortcutToken(token), prefix: token.slice(0, 8) };
}

export function hashShortcutToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Token de `Authorization: Bearer lkv_…`; null si falta o no tiene el formato esperado. */
export function readBearerToken(header: string | null): string | null {
  const match = /^Bearer\s+(lkv_[A-Za-z0-9_-]{43})\s*$/.exec(header ?? "");
  return match ? match[1] : null;
}

export interface ShortcutMovementInput {
  tipo: "EXPENSE" | "INCOME";
  monto: number;
  descripcion: string | null;
  cuenta: string | null;
  categoria: string | null;
  fecha: string | null;
  clave: string | null;
}

export type ParsedBody = { ok: true; value: ShortcutMovementInput } | { ok: false; error: string };

function text(value: unknown, max: number): string | null | undefined {
  if (value === undefined || value === null) return null;
  if (typeof value !== "string" && typeof value !== "number") return undefined;
  const trimmed = String(value).trim();
  if (trimmed === "") return null;
  return trimmed.length > max ? undefined : trimmed;
}

/** Valida el JSON que manda el atajo. Acepta «gasto»/«ingreso» (o EXPENSE/INCOME) y el monto como número o texto. */
export function parseMovementBody(body: unknown): ParsedBody {
  if (!body || typeof body !== "object" || Array.isArray(body)) return { ok: false, error: "El cuerpo debe ser un objeto JSON" };
  const raw = body as Record<string, unknown>;

  const tipoRaw = String(raw.tipo ?? "gasto").trim().toLowerCase();
  const tipo = ["gasto", "expense"].includes(tipoRaw) ? "EXPENSE" : ["ingreso", "income"].includes(tipoRaw) ? "INCOME" : null;
  if (!tipo) return { ok: false, error: "El tipo debe ser «gasto» o «ingreso»" };

  let monto: number;
  if (typeof raw.monto === "number") monto = raw.monto;
  else if (typeof raw.monto === "string" && /^\s*\d+(\.\d{1,4})?\s*$/.test(raw.monto)) monto = Number(raw.monto);
  else return { ok: false, error: "El monto debe ser un número positivo, por ejemplo 45000 o 45000.50 (sin separador de miles)" };
  if (!Number.isFinite(monto) || monto <= 0 || monto > 1_000_000_000_000) return { ok: false, error: "El monto debe ser mayor que cero" };

  const descripcion = text(raw.descripcion, 200);
  const cuenta = text(raw.cuenta, 100);
  const categoria = text(raw.categoria, 100);
  const clave = text(raw.clave, 100);
  if (descripcion === undefined) return { ok: false, error: "La descripción es demasiado larga (máximo 200 caracteres)" };
  if (cuenta === undefined || categoria === undefined) return { ok: false, error: "El nombre de la cuenta o la categoría no es válido" };
  if (clave === undefined) return { ok: false, error: "La clave es demasiado larga (máximo 100 caracteres)" };

  const fecha = text(raw.fecha, 10);
  if (fecha === undefined || (fecha !== null && !/^\d{4}-\d{2}-\d{2}$/.test(fecha))) return { ok: false, error: "La fecha debe tener el formato AAAA-MM-DD" };

  return { ok: true, value: { tipo, monto, descripcion, cuenta, categoria, fecha, clave } };
}

const ERRORS: Record<string, { status: number; message: string }> = {
  INVALID_TOKEN: { status: 401, message: "Token inválido o revocado. Crea uno nuevo en Ajustes → Atajos del iPhone." },
  INVALID_TYPE: { status: 400, message: "El tipo debe ser «gasto» o «ingreso»" },
  INVALID_AMOUNT: { status: 400, message: "El monto debe ser mayor que cero" },
  INVALID_DESCRIPTION: { status: 400, message: "La descripción es demasiado larga (máximo 200 caracteres)" },
  INVALID_DATE: { status: 400, message: "La fecha no es válida (no puede ser futura ni de hace más de 10 años)" },
  ACCOUNT_REQUIRED: { status: 400, message: "Indica la cuenta: tienes varias cuentas activas" },
  ACCOUNT_NOT_FOUND: { status: 400, message: "No encontré una cuenta activa con ese nombre" },
  ACCOUNT_AMBIGUOUS: { status: 400, message: "Hay varias cuentas con ese nombre; renombra una en Lukiva" },
  CATEGORY_REQUIRED: { status: 400, message: "Indica la categoría" },
  CATEGORY_NOT_FOUND: { status: 400, message: "No encontré una categoría de ese tipo con ese nombre" },
};

/** Traduce el error de la base de datos a un estado HTTP y un texto para mostrar en el atajo. */
export function describeShortcutError(message: string | undefined): { status: number; code: string; message: string } {
  const code = Object.keys(ERRORS).find((key) => message?.includes(key));
  if (code) return { ...ERRORS[code], code };
  return { status: 500, code: "ERROR", message: "No se pudo registrar el movimiento. Inténtalo de nuevo." };
}
