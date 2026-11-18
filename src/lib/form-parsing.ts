/**
 * Utilidades para leer `FormData` antes de validar con Zod.
 *
 * Un checkbox desmarcado NO se envía (get() devuelve null) y uno marcado envía
 * "on"; pasar eso directo a `z.boolean()` hacía fallar TODA edición en silencio.
 * Los inputs numéricos vacíos llegan como "" y `z.coerce.number()` los convertía
 * en 0 (p. ej. "límite de crédito" vacío fallaba como "debe ser positivo").
 */

/** Checkbox HTML → boolean. Marcado: "on" (o "true"); desmarcado: ausente. */
export function readCheckbox(formData: FormData, name: string): boolean {
  const value = formData.get(name);
  return value === "on" || value === "true";
}

/** Campo de texto/número → string, o `undefined` si falta o viene vacío. */
export function readOptional(formData: FormData, name: string): string | undefined {
  const value = formData.get(name);
  if (typeof value !== "string") return undefined;
  return value.trim() === "" ? undefined : value;
}
