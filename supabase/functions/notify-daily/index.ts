/**
 * notify-daily — Edge Function de Supabase
 *
 * Envía notificaciones push personalizadas a los usuarios activos:
 *   - Obligaciones que vencen en los próximos 3 días
 *   - Resumen del día (disponible actual)
 *   - Resumen de cierre de mes (último día del mes)
 *   - Proyección del mes siguiente (primer día del mes)
 *
 * Se invoca con un cron desde el dashboard de Supabase:
 *   Schedule: 0 13 * * *  → 8:00am Colombia (UTC-5)
 *
 * Requiere variables de entorno en Supabase Secrets:
 *   VAPID_SUBJECT  — mailto:tu@correo.com
 *   VAPID_PRIVATE_KEY — clave privada VAPID (base64url)
 *   VAPID_PUBLIC_KEY  — clave pública VAPID (base64url)
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT") ?? "mailto:lukiva@example.com";
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY");
const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY");

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

function todayCol(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Bogota" });
}

function addDays(date: string, n: number): string {
  const d = new Date(date + "T00:00:00");
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function formatCOP(n: number): string {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);
}

async function sendWebPush(subscription: { endpoint: string; p256dh: string; auth_key: string }, payload: { title: string; body: string; url: string; tag?: string }) {
  if (!VAPID_PRIVATE_KEY || !VAPID_PUBLIC_KEY) {
    console.warn("VAPID keys not configured — skipping push");
    return;
  }

  // Build the push message using the web-push compatible Deno library
  const { default: webpush } = await import("https://esm.sh/web-push@3.6.7");

  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

  try {
    await webpush.sendNotification(
      { endpoint: subscription.endpoint, keys: { p256dh: subscription.p256dh, auth: subscription.auth_key } },
      JSON.stringify(payload),
      { TTL: 86400 }
    );
  } catch (err: unknown) {
    // 410 Gone: suscripción expirada — eliminarla
    if (err && typeof err === "object" && "statusCode" in err && err.statusCode === 410) {
      await supabase.from("push_subscriptions").delete().eq("endpoint", subscription.endpoint);
    } else {
      console.error("push error", err);
    }
  }
}

async function processUser(userId: string) {
  const today = todayCol();
  const in3Days = addDays(today, 3);

  // Obligaciones que vencen en los próximos 3 días
  const { data: obligations } = await supabase
    .from("obligations")
    .select("name, amount, currency_code, due_date")
    .eq("user_id", userId)
    .eq("status", "PENDING")
    .is("deleted_at", null)
    .gte("due_date", today)
    .lte("due_date", in3Days)
    .order("due_date");

  // Saldo disponible actual (desde la vista de resumen financiero, simplificado)
  const { data: profile } = await supabase
    .from("profiles")
    .select("safety_reserve, currency_code")
    .eq("id", userId)
    .single();

  const { data: accounts } = await supabase
    .from("accounts")
    .select("opening_balance, currency_code")
    .eq("user_id", userId)
    .eq("is_archived", false)
    .is("deleted_at", null);

  const { data: transactions } = await supabase
    .from("transactions")
    .select("type, direction, amount, currency_code")
    .eq("user_id", userId)
    .is("deleted_at", null);

  const baseCurrency = profile?.currency_code ?? "COP";

  // Cálculo simplificado del saldo disponible
  const liquidBalance = (accounts ?? [])
    .filter((a) => a.currency_code === baseCurrency)
    .reduce((sum, a) => sum + (Number(a.opening_balance) || 0), 0) +
    (transactions ?? [])
      .filter((t) => t.currency_code === baseCurrency)
      .reduce((sum, t) => {
        if (t.type === "TRANSFER") return sum;
        return t.direction === "INFLOW" ? sum + Number(t.amount) : sum - Number(t.amount);
      }, 0);

  const pendingObs = await supabase
    .from("obligations")
    .select("amount, currency_code")
    .eq("user_id", userId)
    .eq("status", "PENDING")
    .is("deleted_at", null);

  const totalPending = (pendingObs.data ?? [])
    .filter((o) => o.currency_code === baseCurrency)
    .reduce((sum, o) => sum + Number(o.amount), 0);

  const available = liquidBalance - totalPending - (Number(profile?.safety_reserve) || 0);

  // Subscripciones push del usuario
  const { data: subs } = await (supabase as ReturnType<typeof createClient>)
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth_key")
    .eq("user_id", userId);

  if (!subs || subs.length === 0) return;

  // 1. Notificaciones de obligaciones próximas
  for (const ob of (obligations ?? [])) {
    const days = Math.ceil((new Date(ob.due_date + "T00:00:00").getTime() - new Date(today + "T00:00:00").getTime()) / 86400000);
    const dueLabel = days === 0 ? "Hoy" : days === 1 ? "Mañana" : `En ${days} días`;
    for (const sub of subs) {
      await sendWebPush(sub, {
        title: `${dueLabel}: ${ob.name}`,
        body: `Vence ${dueLabel.toLowerCase()} · ${formatCOP(Number(ob.amount))}`,
        url: "/obligaciones",
        tag: `obligation-${ob.due_date}`,
      });
    }
  }

  // 2. Resumen diario de disponible (solo si no hay obligaciones urgentes, para no saturar)
  if ((obligations ?? []).length === 0) {
    const availableLabel = available >= 0
      ? `Podés gastar hasta ${formatCOP(available)}`
      : `Tus compromisos superan tu saldo en ${formatCOP(Math.abs(available))}`;

    for (const sub of subs) {
      await sendWebPush(sub, {
        title: "Buenos días — Lukiva",
        body: availableLabel,
        url: "/dashboard",
        tag: "daily-summary",
      });
    }
  }

  // 3. Cierre de mes (último día)
  const lastDay = new Date(today + "T00:00:00");
  const nextDay = new Date(lastDay);
  nextDay.setDate(nextDay.getDate() + 1);
  const isLastDayOfMonth = nextDay.getDate() === 1;

  if (isLastDayOfMonth) {
    for (const sub of subs) {
      await sendWebPush(sub, {
        title: "Cierre de mes — Lukiva",
        body: "Revisá cómo te fue este mes antes de que termine.",
        url: "/resumen",
        tag: "month-close",
      });
    }
  }

  // 4. Inicio de mes (primer día)
  const isFirstDayOfMonth = new Date(today + "T00:00:00").getDate() === 1;

  if (isFirstDayOfMonth) {
    for (const sub of subs) {
      await sendWebPush(sub, {
        title: "Nuevo mes — Lukiva",
        body: "Ya podés ver la proyección de lo que se viene este mes.",
        url: "/resumen",
        tag: "month-open",
      });
    }
  }
}

Deno.serve(async (req) => {
  // Verificar que la llamada viene del scheduler de Supabase o de una invocación autorizada
  const authHeader = req.headers.get("Authorization");
  if (authHeader !== `Bearer ${SUPABASE_SERVICE_KEY}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Obtener todos los usuarios con suscripciones push activas
  const { data: activeSubs, error } = await (supabase as ReturnType<typeof createClient>)
    .from("push_subscriptions")
    .select("user_id")
    .order("user_id");

  if (error) {
    console.error("Error fetching subscriptions:", error);
    return new Response("Error", { status: 500 });
  }

  // Deduplicar user IDs
  const userIds = [...new Set((activeSubs ?? []).map((s: { user_id: string }) => s.user_id))];
  console.log(`Processing ${userIds.length} users`);

  await Promise.allSettled(userIds.map(processUser));

  return new Response(JSON.stringify({ processed: userIds.length }), {
    headers: { "Content-Type": "application/json" },
  });
});
