import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

interface ImportRow { [key: string]: string | number | undefined }

function str(v: unknown): string { return String(v ?? "").trim(); }
function num(v: unknown): number { return Number(v) || 0; }
function numOrNull(v: unknown): number | null {
  if (v === "" || v === undefined || v === null) return null;
  const n = Number(v);
  return isNaN(n) ? null : n;
}
function bool(v: unknown): boolean {
  const s = str(v).toLowerCase();
  return s === "si" || s === "sí" || s === "yes" || s === "true" || s === "1";
}

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
  const now = new Date();
  const periodMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const errors: string[] = [];
  const importedCount = { cuentas: 0, deudas: 0, obligaciones: 0, recurrentes: 0, suscripciones: 0, presupuestos: 0, transacciones: 0 };

  // ── Categorías: cargar existentes y crear las que falten ──────────────────
  const { data: existingCats } = await supabase
    .from("categories").select("id, name, type").eq("user_id", user.id).is("deleted_at", null);
  const catMap: Record<string, string> = {}; // "nombre_lower:tipo" → id
  for (const c of (existingCats ?? [])) {
    catMap[`${c.name.toLowerCase()}:${c.type}`] = c.id;
    catMap[c.name.toLowerCase()] = c.id; // también por nombre solo
  }

  async function getOrCreateCategory(name: string, type: "INCOME" | "EXPENSE" = "EXPENSE"): Promise<string | null> {
    if (!name) return null;
    const key = `${name.toLowerCase()}:${type}`;
    if (catMap[key]) return catMap[key];
    if (catMap[name.toLowerCase()]) return catMap[name.toLowerCase()];
    // Crear la categoría
    const { data, error } = await supabase.from("categories").insert({
      user_id: user!.id, name, type, color: "#6B7280", icon: "tag",
    }).select("id").single();
    if (error || !data) return null;
    catMap[key] = data.id;
    catMap[name.toLowerCase()] = data.id;
    return data.id;
  }

  // ── Cuentas ───────────────────────────────────────────────────────────────
  const accountMap: Record<string, string> = {};
  if (body.cuentas?.length) {
    for (const row of body.cuentas) {
      const name = str(row["nombre *"] ?? row.nombre);
      const type = str(row["tipo *"] ?? row.tipo).toUpperCase();
      if (!name || !type) { errors.push("Cuenta sin nombre o tipo"); continue; }
      const { data, error } = await supabase.from("accounts").insert({
        user_id: user.id, name, type: type as "SAVINGS",
        opening_balance: num(row.saldo_inicial ?? 0),
        credit_limit: numOrNull(row.limite_credito),
        currency_code: str(row.moneda || currency),
      }).select("id, name").single();
      if (error) errors.push(`Cuenta "${name}": ${error.message}`);
      else if (data) { accountMap[name.toLowerCase()] = data.id; importedCount.cuentas++; }
    }
  }

  // Cargar cuentas existentes para resolver las de transacciones
  const { data: existingAccounts } = await supabase.from("accounts").select("id, name").eq("user_id", user.id).is("deleted_at", null);
  for (const a of (existingAccounts ?? [])) {
    if (!accountMap[a.name.toLowerCase()]) accountMap[a.name.toLowerCase()] = a.id;
  }
  const findAccount = (name: string) => accountMap[name.toLowerCase().trim()];

  // ── Deudas ────────────────────────────────────────────────────────────────
  if (body.deudas?.length) {
    for (const row of body.deudas) {
      const name = str(row["nombre *"] ?? row.nombre);
      const type = str(row["tipo *"] ?? row.tipo).toUpperCase() || "OTHER";
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
      else importedCount.deudas++;
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
        description: str(row.notas || "").slice(0, 500),
      });
      if (error) errors.push(`Obligación "${name}": ${error.message}`);
      else importedCount.obligaciones++;
    }
  }

  // ── Recurrentes ───────────────────────────────────────────────────────────
  if (body.recurrentes?.length) {
    for (const row of body.recurrentes) {
      const name = str(row["nombre *"] ?? row.nombre);
      const amount = num(row["monto *"] ?? row.monto);
      const tipo = str(row["tipo *"] ?? row.tipo).toUpperCase();
      const frequency = str(row["frecuencia *"] ?? row.frecuencia).toUpperCase() || "MONTHLY";
      const startDate = str(row["fecha_inicio *"] ?? row.fecha_inicio) || periodMonth + "-01";
      const cuentaName = str(row["cuenta *"] ?? row.cuenta);
      const catName = str(row.categoria);

      if (!name) { errors.push("Recurrente sin nombre"); continue; }
      const accountId = findAccount(cuentaName);
      if (!accountId) { errors.push(`Recurrente "${name}": cuenta "${cuentaName}" no encontrada`); continue; }

      const catType = tipo === "INCOME" ? "INCOME" : "EXPENSE";
      const categoryId = catName ? await getOrCreateCategory(catName, catType as "INCOME" | "EXPENSE") : null;
      if (!categoryId) { errors.push(`Recurrente "${name}": categoría requerida no encontrada`); continue; }

      const { error } = await supabase.from("recurring_transactions").insert({
        user_id: user.id, name, amount,
        type: catType as "INCOME" | "EXPENSE",
        frequency: frequency as "MONTHLY",
        start_date: startDate,
        next_execution_date: startDate,
        account_id: accountId,
        category_id: categoryId,
        is_automatic: bool(row.es_automatico),
        currency_code: currency,
        status: "ACTIVE",
      });
      if (error) errors.push(`Recurrente "${name}": ${error.message}`);
      else importedCount.recurrentes++;
    }
  }

  // ── Suscripciones ─────────────────────────────────────────────────────────
  if (body.suscripciones?.length) {
    for (const row of body.suscripciones) {
      const name = str(row["nombre *"] ?? row.nombre);
      const amount = num(row["monto *"] ?? row.monto);
      const billingDay = num(row["dia_facturacion *"] ?? row.dia_facturacion ?? 1);
      if (!name) { errors.push("Suscripción sin nombre"); continue; }
      const nextDate = new Date(now.getFullYear(), now.getMonth() + (now.getDate() > billingDay ? 1 : 0), billingDay);
      const { error } = await supabase.from("subscriptions").insert({
        user_id: user.id, name, amount,
        frequency: "MONTHLY" as const,
        next_payment_date: nextDate.toISOString().slice(0, 10),
        currency_code: str(row.moneda || currency),
        status: "ACTIVE",
      });
      if (error) errors.push(`Suscripción "${name}": ${error.message}`);
      else importedCount.suscripciones++;
    }
  }

  // ── Presupuestos ──────────────────────────────────────────────────────────
  if (body.presupuestos?.length) {
    for (const row of body.presupuestos) {
      const catName = str(row["categoria *"] ?? row.categoria);
      const limit = num(row["limite_mensual *"] ?? row.limite_mensual);
      if (!catName) { errors.push("Presupuesto sin categoría"); continue; }

      const categoryId = await getOrCreateCategory(catName, "EXPENSE");
      if (!categoryId) { errors.push(`Presupuesto "${catName}": no se pudo crear la categoría`); continue; }

      const { error } = await supabase.from("budgets").insert({
        user_id: user.id, category_id: categoryId,
        limit_amount: limit, period_month: periodMonth,
        currency_code: currency,
      });
      if (error) errors.push(`Presupuesto "${catName}": ${error.message}`);
      else importedCount.presupuestos++;
    }
  }

  // ── Transacciones ─────────────────────────────────────────────────────────
  if (body.transacciones?.length) {
    for (const row of body.transacciones) {
      const fecha = str(row["fecha *"] ?? row.fecha);
      const tipo = str(row["tipo *"] ?? row.tipo).toUpperCase();
      const monto = num(row["monto *"] ?? row.monto);
      const cuentaName = str(row["cuenta *"] ?? row.cuenta);
      const descripcion = str(row["descripcion *"] ?? row.descripcion) || "Sin descripción";
      const accountId = findAccount(cuentaName);

      if (!fecha || !monto || !accountId) {
        errors.push(`Tx "${descripcion.slice(0, 40)}": cuenta "${cuentaName}" no encontrada o datos faltantes`);
        continue;
      }

      const catName = str(row.categoria);
      const catType = tipo === "INCOME" ? "INCOME" : "EXPENSE";
      const categoryId = catName ? await getOrCreateCategory(catName, catType as "INCOME" | "EXPENSE") : null;

      const direction = tipo === "INCOME" ? "INFLOW" : "OUTFLOW";
      const type: "INCOME" | "EXPENSE" | "TRANSFER" =
        tipo === "INCOME" ? "INCOME" : tipo === "TRANSFER" ? "TRANSFER" : "EXPENSE";

      const { error } = await supabase.from("transactions").insert({
        user_id: user.id, account_id: accountId, type, direction,
        amount: monto, description: descripcion.slice(0, 500),
        transaction_date: fecha, currency_code: currency,
        category_id: categoryId,
        notes: str(row.notas || "").slice(0, 1000),
      });
      if (error) errors.push(`Tx "${descripcion.slice(0, 40)}": ${error.message}`);
      else importedCount.transacciones++;
    }
  }

  return NextResponse.json({ imported: importedCount, errors: errors.slice(0, 20) });
}
