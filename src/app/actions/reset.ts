"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function resetUserDataAction(): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };

  const uid = user.id;

  // Orden por FK: hijos primero, luego padres
  await supabase.from("debt_payments").delete().eq("user_id", uid);
  await supabase.from("goal_contributions").delete().eq("user_id", uid);
  await supabase.from("transactions").delete().eq("user_id", uid);
  await supabase.from("debts").delete().eq("user_id", uid);
  await supabase.from("obligations").delete().eq("user_id", uid);
  await supabase.from("subscriptions").delete().eq("user_id", uid);
  await supabase.from("recurring_transactions").delete().eq("user_id", uid);
  await supabase.from("budgets").delete().eq("user_id", uid);
  await supabase.from("goals").delete().eq("user_id", uid);
  await supabase.from("accounts").delete().eq("user_id", uid);
  await supabase.from("profiles").update({ safety_reserve: 0 }).eq("id", uid);

  revalidatePath("/", "layout");
  return { success: true };
}
