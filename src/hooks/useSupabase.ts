import { useMemo } from "react";
import { createSupabaseClient } from "@/lib/supabase";

export function useSupabase() {
  return useMemo(() => createSupabaseClient(), []);
}