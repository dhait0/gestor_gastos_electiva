"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface IconPickerOption {
  value: string;
  label: string;
  node: ReactNode;
}

/**
 * Selector visual de iconos: una rejilla de opciones (radios nativos), sin escribir nada.
 * Envía el valor elegido con el formulario bajo `name`. Si el valor actual no está en la lista
 * (p. ej. un texto escrito antes de que existiera el selector) se muestra como una opción más
 * para no perderlo al editar.
 */
export function IconPicker({
  name,
  legend,
  options,
  defaultValue,
  disabled,
}: {
  name: string;
  legend: string;
  options: IconPickerOption[];
  defaultValue?: string | null;
  disabled?: boolean;
}) {
  const current = defaultValue ?? "";
  const all =
    current && !options.some((option) => option.value === current)
      ? [{ value: current, label: `Actual: ${current}`, node: <span className="text-xs">{current.slice(0, 4)}</span> }, ...options]
      : options;

  return (
    <fieldset disabled={disabled} className="space-y-2">
      <legend className="text-sm font-medium text-foreground">{legend}</legend>
      <div className="grid grid-cols-6 gap-2 sm:grid-cols-8" role="radiogroup" aria-label={legend}>
        {all.map((option) => (
          <label key={option.value} title={option.label} className="relative cursor-pointer">
            <input
              type="radio"
              name={name}
              value={option.value}
              defaultChecked={option.value === current}
              className="peer sr-only"
              aria-label={option.label}
            />
            <span
              className={cn(
                "flex h-11 w-full items-center justify-center rounded-lg border border-border bg-card text-lg text-muted-foreground transition-colors",
                "hover:bg-muted peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:text-primary",
                "peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-disabled:opacity-50"
              )}
            >
              {option.node}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
