import Link from "next/link";

export const metadata = { title: "Política de privacidad · Lukiva" };

export default function LegalPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-xl space-y-4 text-center">
        <h1 className="text-3xl font-bold text-foreground font-heading">Política de privacidad</h1>
        <p className="text-muted-foreground">
          Este documento está en preparación y pendiente de revisión jurídica. Lukiva no lo presenta como definitivo.
        </p>
        <Link href="/login" className="inline-block text-sm text-primary hover:underline font-medium">
          Volver
        </Link>
      </div>
    </main>
  );
}
