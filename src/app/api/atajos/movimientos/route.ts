import { NextResponse } from "next/server";
import { createSupabaseAnonClient } from "@/lib/supabase/anon";
import { describeShortcutError, hashShortcutToken, parseMovementBody, readBearerToken, type ShortcutMovementInput } from "@/lib/shortcut";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

const fail = (status: number, message: string, code: string) =>
  NextResponse.json({ ok: false, codigo: code, error: message, mensaje: message }, { status, headers: { "Cache-Control": "no-store" } });

/** Registra el movimiento con el token y responde con el mensaje que el atajo muestra. */
async function register(token: string, input: ShortcutMovementInput) {
  const supabase = createSupabaseAnonClient();
  const { data, error } = await supabase.rpc("shortcut_register_movement", {
    p_token_hash: hashShortcutToken(token),
    p_type: input.tipo,
    p_amount: input.monto,
    p_description: input.descripcion ?? undefined,
    p_account: input.cuenta ?? undefined,
    p_category: input.categoria ?? undefined,
    p_date: input.fecha ?? undefined,
    p_key: input.clave ?? undefined,
  });
  if (error) {
    const failure = describeShortcutError(error.message);
    return fail(failure.status, failure.message, failure.code);
  }

  const movement = data as { id: string; duplicado: boolean; cuenta: string; categoria: string; moneda: string; monto: number; tipo: string; fecha: string };
  const noun = movement.tipo === "INCOME" ? "Ingreso" : "Gasto";
  const mensaje = movement.duplicado
    ? `Ya estaba registrado: ${noun.toLowerCase()} de ${formatCurrency(movement.monto, movement.moneda)} en ${movement.cuenta}`
    : `${noun} de ${formatCurrency(movement.monto, movement.moneda)} registrado en ${movement.cuenta} (${movement.categoria})`;

  return NextResponse.json({ ok: true, mensaje, movimiento: movement }, { headers: { "Cache-Control": "no-store" } });
}

/**
 * POST /api/atajos/movimientos — registra un gasto o ingreso desde la app Atajos del iPhone.
 * Autorización: `Authorization: Bearer lkv_…` (token creado en Ajustes). Cuerpo JSON:
 * { tipo: "gasto"|"ingreso", monto, descripcion?, cuenta?, categoria, fecha?, clave? }
 */
export async function POST(request: Request) {
  const token = readBearerToken(request.headers.get("authorization"));
  if (!token) return fail(401, "Falta el token. Usa el encabezado Authorization: Bearer <token>", "INVALID_TOKEN");

  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > 10_000) return fail(413, "La petición es demasiado grande", "TOO_LARGE");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail(400, "El cuerpo debe ser JSON válido", "INVALID_BODY");
  }
  const parsed = parseMovementBody(body);
  if (!parsed.ok) return fail(400, parsed.error, "INVALID_BODY");
  return register(token, parsed.value);
}

/**
 * GET /api/atajos/movimientos?tipo=gasto&monto=45000&descripcion=Almuerzo&cuenta=Efectivo&categoria=Alimentación
 * Lo mismo que el POST pero sin cuerpo: la acción «Obtener contenido de URL» de Atajos falla a veces al armar
 * cuerpos JSON. El token va en el encabezado (nunca en la URL, que queda en registros). Para evitar duplicados
 * si se dispara dos veces, usa el parámetro `clave`.
 */
export async function GET(request: Request) {
  const token = readBearerToken(request.headers.get("authorization"));
  if (!token) return fail(401, "Falta el token. Usa el encabezado Authorization: Bearer <token>", "INVALID_TOKEN");

  const params = new URL(request.url).searchParams;
  const parsed = parseMovementBody(Object.fromEntries(params.entries()));
  if (!parsed.ok) return fail(400, parsed.error, "INVALID_BODY");
  return register(token, parsed.value);
}
