"use client";

/** Último recurso si falla el layout raíz (UC-46). Mínimo y sin dependencias de la app. */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="es">
      <body style={{ fontFamily: "system-ui, sans-serif", display: "grid", placeItems: "center", minHeight: "100vh", margin: 0 }}>
        <div role="alert" style={{ maxWidth: 420, textAlign: "center", padding: 24 }}>
          <h1 style={{ fontSize: 22 }}>Algo salió mal</h1>
          <p style={{ color: "#555" }}>No pudimos cargar Lukiva. Tus datos están a salvo. Intenta de nuevo.</p>
          <button onClick={reset} style={{ padding: "10px 18px", borderRadius: 10, border: 0, background: "#315CF5", color: "#fff", fontWeight: 600, cursor: "pointer" }}>
            Reintentar
          </button>
        </div>
      </body>
    </html>
  );
}
