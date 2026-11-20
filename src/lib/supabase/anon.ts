import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

/** Cliente sin sesión (clave pública). Solo para funciones de base de datos que se autorizan por sí mismas, como los atajos. */
export function createSupabaseAnonClient() {
  return createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
