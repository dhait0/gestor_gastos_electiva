import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import SignOutButton from "@/components/sign-out-button";
import ThemeToggle from "@/components/theme-toggle";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const isAdmin = session.user.role === "ADMIN";

  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <div className="mb-4 flex justify-end">
        <ThemeToggle />
      </div>
      <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-foreground">
          Hola, {session.user.name ?? session.user.email}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sesión iniciada correctamente. Este es el punto de partida del
          dashboard de FinWise.
        </p>
        <p className="mt-4 text-sm text-muted-foreground">
          ID de usuario: {session.user.id}
        </p>
        {isAdmin && (
          <div className="mt-6">
            <Link
              href="/admin/users"
              className="inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
            >
              Administración de usuarios
            </Link>
          </div>
        )}
        <div className="mt-6">
          <SignOutButton />
        </div>
      </div>
    </main>
  );
}
