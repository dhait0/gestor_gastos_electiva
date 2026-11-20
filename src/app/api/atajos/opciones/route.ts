import { NextResponse } from "next/server";
import { createSupabaseAnonClient } from "@/lib/supabase/anon";
import { describeShortcutError, hashShortcutToken, readBearerToken } from "@/lib/shortcut";

export const dynamic = "force-dynamic";

/** GET /api/atajos/opciones — nombres de tus cuentas y categorías, para armar listas de elección en el atajo. */
export async function GET(request: Request) {
  const token = readBearerToken(request.headers.get("authorization"));
  if (!token) {
    return NextResponse.json({ ok: false, codigo: "INVALID_TOKEN", error: "Falta el token. Usa el encabezado Authorization: Bearer <token>" }, { status: 401 });
  }

  const { data, error } = await createSupabaseAnonClient().rpc("shortcut_options", { p_token_hash: hashShortcutToken(token) });
  if (error) {
    const failure = describeShortcutError(error.message);
    return NextResponse.json({ ok: false, codigo: failure.code, error: failure.message }, { status: failure.status });
  }
  const options = data as { cuentas: { nombre: string; moneda: string }[] };
  // `cuentas_nombres` es una lista simple de textos: la acción «Elegir de la lista» de Atajos la muestra tal cual.
  return NextResponse.json(
    { ok: true, ...options, cuentas_nombres: options.cuentas.map((account) => account.nombre) },
    { headers: { "Cache-Control": "no-store" } }
  );
}
