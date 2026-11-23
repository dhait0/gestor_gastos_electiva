import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

interface ImportRow { [key: string]: string | number | undefined }

function str(v: unknown): string { return String(v ?? "").trim(); }
function num(v: unknown): number { return Number(v) || 0; }
function numOrNull(v: unknown): number | null { const n = Number(v); return isNaN(n) || v === "" || v === undefined ? null : n; }

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json() as {
    cuentas: ImportRow[];
    deudas: ImportRow[];
    obligaciones: ImportRow[];
    recurrentes: ImportRow[];
    suscripciones: ImportRow[];
    presupuestos: ImportRow[];
    transacciones: ImportRow[];
  };

  const { data: profile } = await supabase.from("profiles").select("currency_code").eq("id", user.id).single();
  const currency = profile?.currency_code ?? "COP";

  const errors: string[] = [];

  // ── Cuentas ──────────────────────────────────────────────────────────────
  const accountMap: Record<string, string> = {}; // name → id
  if (body.cuentas?.length) {
    for (const row of body.cuentas) {
      const name = str(row["nombre *"] ?? row.nombre);
      const type = str(row["tipo *"] ?? row.tipo).toUpperCase();
      if (!name || !type) { errors.push(`Cuenta sin nombre o tipo`); continue; }
      const { data, error } = await supabase.from("accounts").insert({
        user_id: user.id, name, type: type as "SAVINGS",
        opening_balance: num(row.saldo_inicial ?? row["saldo_inicial"] ?? 0),
        credit_limit: numOrNull(row.limite_credito ?? row["limite_credito"]),
        currency_code: str(row.moneda || currency),
      }).select("id, name").single();
      if (error) errors.push(`Cuenta "${name}": ${error.message}`);
      else if (data) accountMap[name.toLowerCase()] = data.id;
    }
  }

  // Cargar cuentas existentes también (para transacciones que referencian cuentas previas)
  const { data: existingAccounts } = await supabase.from("accounts").select("id, name").eq("user_id", user.id).is("deleted_at", null);
  for (const a of (existingAccounts ?? [])) {
    if (!accountMap[a.name.toLowerCase()]) accountMap[a.name.toLowerCase()] = a.id;
  }

  const findAccount = (name: string) => accountMap[name.toLowerCase().trim()];

  // ── Deudas ───────────────────────────────────────────────────────────────
  if (body.deudas?.length) {
    for (const row of body.deudas) {
      const name = str(row["nombre *"] ?? row.nombre);
      const type = str(row["tipo *"] ?? row.tipo).toUpperCase();
      const original = num(row["monto_total *"] ?? row.monto_total);
      if (!name) { errors.push("Deuda sin nombre"); continue; }
      const { error } = await supabase.from("debts").insert({
        user_id: user.id, name, type: type as "OTHER",
        original_amount: original,
        current_balance: num(row.saldo_actual ?? original),
        interest_rate_percent: num(row.tasa_mensual_pct ?? 0),
        minimum_payment: num(row.pago_minimo ?? 0),
        payment_day: numOrNull(row.dia_pago),
        currency_code: currency,
      });
      if (error) errors.push(`Deuda "${name}": ${error.message}`);
    }
  }

  // ── Obligaciones ──────────────────────────────────────────────────────────
  if (body.obligaciones?.length) {
    for (const row of body.obligaciones) {
      const name = str(row["nombre *"] ?? row.nombre);
      const amount = num(row["monto *"] ?? row.monto);
      const dueDate = str(row["fecha_vencimiento *"] ?? row.fecha_vencimiento);
      if (!name || !dueDate) { errors.push(`Obligación sin nombre o fecha`); continue; }
      const { error } = await supabase.from("obligations").insert({
        user_id: user.id, name, amount, due_date: dueDate,
        currency_code: str(row.moneda || currency),
        description: str(row.notas || ""),
      });
      if (error) errors.push(`Obligación "${name}": ${error.message}`);
    }
  }

  // ── Suscripciones ─────────────────────────────────────────────────────────
  if (body.suscripciones?.length) {
    // Fecha de próximo pago: aproximamos como el dia_facturacion del mes actual/siguiente
    const today = new Date();
    for (const row of body.suscripciones) {
      const name = str(row["nombre *"] ?? row.nombre);
      const amount = num(row["monto *"] ?? row.monto);
      const billingDay = num(row["dia_facturacion *"] ?? row.dia_facturacion ?? 1);
      if (!name) { errors.push("Suscripción sin nombre"); continue; }
      const nextDate = new Date(today.getFullYear(), today.getMonth() + (today.getDate() > billingDay ? 1 : 0), billingDay);
      const { error } = await supabase.from("subscriptions").insert({
        user_id: user.id, name, amount,
        frequency: "MONTHLY" as const,
        next_payment_date: nextDate.toISOString().slice(0, 10),
        currency_code: str(row.moneda || currency),
        status: "ACTIVE",
      });
      if (error) errors.push(`Suscripción "${name}": ${error.message}`);
    }
  }

  // ── Transacciones ─────────────────────────────────────────────────────────
  if (body.transacciones?.length) {
    // Cargar categorías del usuario para resolver nombres
    const { data: cats } = await supabase.from("categories").select("id, name").eq("user_id", user.id).is("deleted_at", null);
    const catMap: Record<string, string> = {};
    for (const c of (cats ?? [])) catMap[c.name.toLowerCase()] = c.id;

    for (const row of body.transacciones) {
      const fecha = str(row["fecha *"] ?? row.fecha);
      const tipo = str(row["tipo *"] ?? row.tipo).toUpperCase();
      const monto = num(row["monto *"] ?? row.monto);
      const cuentaName = str(row["cuenta *"] ?? row.cuenta);
      const descripcion = str(row["descripcion *"] ?? row.descripcion);
      const accountId = findAccount(cuentaName);

      if (!fecha || !monto || !accountId) {
        errors.push(`Transacción "${descripcion}": cuenta "${cuentaName}" no encontrada o datos faltantes`);
        continue;
      }

      const catName = str(row.categoria).toLowerCase();
      const categoryId = catMap[catName] ?? null;
      const direction = tipo === "INCOME" ? "INFLOW" : "OUTFLOW";
      const type = (tipo === "INCOME" || tipo === "EXPENSE" || tipo === "TRANSFER") ? tipo : "EXPENSE";

      const { error } = await supabase.from("transactions").insert({
        user_id: user.id, account_id: accountId, type, direction,
        amount: monto, description: descripcion,
        transaction_date: fecha, currency_code: currency,
        category_id: categoryId,
        notes: str(row.notas || ""),
      });
      if (error) errors.push(`Transacción "${descripcion}": ${error.message}`);
    }
  }

  return NextResponse.json({
    imported: {
      cuentas: body.cuentas?.length ?? 0,
      deudas: body.deudas?.length ?? 0,
      obligaciones: body.obligaciones?.length ?? 0,
      suscripciones: body.suscripciones?.length ?? 0,
      transacciones: body.transacciones?.length ?? 0,
    },
    errors: errors.slice(0, 10),
  });
}
