/**
 * Destino tras el callback de autenticación. Funciones puras para poder probarlas.
 */

const DEFAULT_NEXT = "/dashboard";

/**
 * Solo se aceptan rutas internas: empiezan por una única "/" y no contienen
 * barras invertidas, saltos de línea ni un esquema. Todo lo demás cae al valor
 * por defecto, para que `?next=` no pueda usarse como redirección abierta
 * (p. ej. `@sitio.com`, `//sitio.com`, `https://sitio.com`).
 */
export function sanitizeNextPath(next: string | null | undefined): string {
  if (!next) return DEFAULT_NEXT;
  if (!next.startsWith("/") || next.startsWith("//")) return DEFAULT_NEXT;
  if (/[\\\r\n\t]/.test(next)) return DEFAULT_NEXT;
  return next;
}

/**
 * URL base a la que volver. Detrás de un proxy (Vercel) se usa el host reenviado
 * con su protocolo reenviado; sin proxy, el origen de la petición. Antes se
 * asumía siempre https cuando había `x-forwarded-host`, lo que rompía cualquier
 * entorno HTTP (p. ej. `next start` local).
 */
export function resolveBaseUrl(requestOrigin: string, headers: { get(name: string): string | null }): string {
  const forwardedHost = headers.get("x-forwarded-host")?.split(",")[0].trim();
  if (!forwardedHost) return requestOrigin;

  const forwardedProto = headers.get("x-forwarded-proto")?.split(",")[0].trim();
  const protocol = forwardedProto === "http" || forwardedProto === "https" ? forwardedProto : new URL(requestOrigin).protocol.replace(":", "");
  return `${protocol}://${forwardedHost}`;
}
