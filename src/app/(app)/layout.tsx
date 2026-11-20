import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AppLayoutClient } from "@/components/layout/AppLayoutClient";
import { getAuthorizationContext } from "@/lib/auth/permissions";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase.from("profiles").select("display_name").eq("id", user.id).single();

  // Solo para pintar el acceso: la autorización real se vuelve a comprobar en /admin
  const authorization = await getAuthorizationContext();
  const showAdmin = authorization?.permissions.includes("admin.access") ?? false;

  return <AppLayoutClient showAdmin={showAdmin} displayName={profile?.display_name ?? null}>{children}</AppLayoutClient>;
}