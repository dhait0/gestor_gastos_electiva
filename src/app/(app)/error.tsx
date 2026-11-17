"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Límite de error de la app (UC-46). Muestra un mensaje claro sin detalles
 * internos y permite reintentar; el detalle técnico solo va a la consola del
 * servidor/cliente con el identificador `digest`.
 */
export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[app-error]", error.digest ?? "sin digest");
  }, [error]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div role="alert" className="mx-auto max-w-md rounded-xl border border-border bg-card p-8 text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-destructive" aria-hidden="true" />
        </div>
        <h1 className="text-lg font-medium text-foreground">Algo salió mal</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          No pudimos cargar esta pantalla. Tus datos están a salvo. Intenta de nuevo en unos segundos.
        </p>
        {error.digest && <p className="mt-2 text-xs text-muted-foreground">Código de referencia: {error.digest}</p>}
        <div className="mt-6 flex items-center justify-center gap-3">
          <Button onClick={reset}>Reintentar</Button>
          <Link href="/dashboard" className="text-sm text-primary hover:underline font-medium">
            Ir al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
