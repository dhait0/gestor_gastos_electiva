import type { FormEvent } from "react";

/**
 * Evita que React 19 vacíe el formulario al terminar una acción de servidor.
 *
 * Con `<form action={...}>` React llama a `form.reset()` cuando la acción termina,
 * incluso si falló: el usuario perdía lo que había escrito (UC-46, "conservar la
 * información razonablemente"). Ese reinicio dispara un evento `reset` cancelable;
 * al cancelarlo, los campos conservan su valor.
 *
 * Se mantiene `action={...}` (en lugar de `onSubmit`) para no perder la mejora
 * progresiva: un envío hecho antes de que termine la hidratación lo reproduce React.
 *
 * Uso: `<form action={formAction} onReset={preventFormReset}>`.
 * Para limpiar a propósito tras un éxito, usar `resetFormFields(form)`.
 */
export function preventFormReset(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();
}

/** Limpia a propósito los campos visibles de un formulario (vuelven a su `defaultValue`). */
export function resetFormFields(form: HTMLFormElement | null) {
  if (!form) return;
  for (const el of Array.from(form.elements)) {
    if (el instanceof HTMLInputElement && el.type !== "hidden" && el.type !== "submit" && el.type !== "button") {
      el.value = el.defaultValue;
    } else if (el instanceof HTMLTextAreaElement) {
      el.value = el.defaultValue;
    }
  }
}
