import { redirect } from "next/navigation";
import { auth } from "@/auth";

/**
 * Garantiza que el usuario actual sea ADMIN.
 * Redirige a /dashboard en caso contrario.
 */
export async function requireAdmin() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return session;
}
