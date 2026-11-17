import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="max-w-md text-center space-y-3">
        <p className="text-sm font-medium text-primary">Error 404</p>
        <h1 className="text-3xl font-bold text-foreground font-heading">No encontramos esa página</h1>
        <p className="text-muted-foreground">Puede que el enlace esté mal escrito o que ya no exista.</p>
        <Link href="/dashboard" className="inline-block text-sm text-primary hover:underline font-medium">
          Ir al inicio
        </Link>
      </div>
    </main>
  );
}
