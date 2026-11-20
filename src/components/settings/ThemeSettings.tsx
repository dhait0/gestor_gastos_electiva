"use client";

import { useSyncExternalStore } from "react";
import { Check, Monitor, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { THEME_ACCENTS, THEME_EVENT, THEME_MODES, parseTheme, readStoredTheme, saveTheme, type ThemeAccent, type ThemeMode } from "@/lib/theme";

const MODE_ICONS = { system: Monitor, light: Sun, dark: Moon } as const;

function subscribe(onChange: () => void) {
  window.addEventListener(THEME_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(THEME_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** Modo (automático, claro, oscuro) y color de acento. Se aplica al instante y se recuerda en este dispositivo. */
export function ThemeSettings() {
  // El valor guardado es la fuente externa; en el servidor no hay ninguno y se muestra el tema por defecto.
  const stored = useSyncExternalStore(subscribe, readStoredTheme, () => null);
  const theme = parseTheme(stored);

  return (
    <div className="space-y-6">
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-foreground">Modo</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {THEME_MODES.map((mode) => {
            const Icon = MODE_ICONS[mode.value];
            return (
              <label key={mode.value} className="relative cursor-pointer">
                <input
                  type="radio"
                  name="theme-mode"
                  value={mode.value}
                  checked={theme.mode === mode.value}
                  onChange={() => saveTheme({ ...theme, mode: mode.value as ThemeMode })}
                  className="peer sr-only"
                />
                <span className="flex h-full items-start gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-muted peer-checked:border-primary peer-checked:bg-primary/10 peer-focus-visible:ring-2 peer-focus-visible:ring-ring">
                  <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                  <span>
                    <span className="block text-sm font-medium text-foreground">{mode.label}</span>
                    <span className="block text-xs text-muted-foreground">{mode.description}</span>
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-foreground">Color</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {THEME_ACCENTS.map((accent) => (
            <label key={accent.value} className="relative cursor-pointer">
              <input
                type="radio"
                name="theme-accent"
                value={accent.value}
                checked={theme.accent === accent.value}
                onChange={() => saveTheme({ ...theme, accent: accent.value as ThemeAccent })}
                className="peer sr-only"
              />
              <span className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-muted peer-checked:border-primary peer-checked:bg-primary/10 peer-focus-visible:ring-2 peer-focus-visible:ring-ring">
                <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white")} style={{ backgroundColor: accent.swatch }} aria-hidden="true">
                  {theme.accent === accent.value && <Check className="h-3.5 w-3.5" />}
                </span>
                <span className="text-sm font-medium text-foreground">{accent.label}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <p className="text-xs text-muted-foreground">Tu elección se guarda en este dispositivo y cambia al instante.</p>
    </div>
  );
}
