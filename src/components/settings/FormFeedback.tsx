import type { AccountActionResult } from "@/app/actions/account";

/** Mensaje de éxito o error de un formulario de Ajustes, anunciado a lectores de pantalla. */
export function FormFeedback({ state }: { state: AccountActionResult }) {
  if (state.success) {
    return (
      <p role="status" className="rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">
        {state.message}
      </p>
    );
  }
  if (state.error) {
    return (
      <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
        {state.error}
      </p>
    );
  }
  return null;
}

export function FieldError({ state, name }: { state: AccountActionResult; name: string }) {
  const message = !state.success ? state.fieldErrors?.[name]?.[0] : undefined;
  return message ? (
    <p id={`${name}-error`} className="mt-1 text-xs text-destructive">
      {message}
    </p>
  ) : null;
}
