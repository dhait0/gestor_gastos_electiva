/**
 * Temas de la app: un modo (claro, oscuro o el del sistema) y un color de acento.
 * Se guardan en este dispositivo (localStorage) y se aplican antes de pintar con
 * `THEME_INIT_SCRIPT`, para que no haya un destello del tema equivocado.
 */
export const THEME_STORAGE_KEY = "lukiva:tema";
export const THEME_EVENT = "lukiva:tema-cambio";

export const THEME_MODES = [
  { value: "system", label: "Automático", description: "Sigue el modo de tu dispositivo" },
  { value: "light", label: "Claro", description: "Fondo claro" },
  { value: "dark", label: "Oscuro", description: "Descansa la vista de noche" },
] as const;

/** `swatch` es solo para mostrar la muestra en Ajustes; el color real vive en globals.css. */
export const THEME_ACCENTS = [
  { value: "oceano", label: "Océano", swatch: "#315CF5" },
  { value: "menta", label: "Menta", swatch: "#0B7A69" },
  { value: "atardecer", label: "Atardecer", swatch: "#C2410C" },
  { value: "violeta", label: "Violeta", swatch: "#6D28D9" },
] as const;

export type ThemeMode = (typeof THEME_MODES)[number]["value"];
export type ThemeAccent = (typeof THEME_ACCENTS)[number]["value"];
export interface ThemeChoice {
  mode: ThemeMode;
  accent: ThemeAccent;
}

export const DEFAULT_THEME: ThemeChoice = { mode: "system", accent: "oceano" };

const MODES = THEME_MODES.map((m) => m.value) as string[];
const ACCENTS = THEME_ACCENTS.map((a) => a.value) as string[];

/** Lee un valor guardado, ignorando cualquier cosa inválida (texto corrupto, valores antiguos). */
export function parseTheme(raw: string | null | undefined): ThemeChoice {
  if (!raw) return DEFAULT_THEME;
  try {
    const parsed = JSON.parse(raw) as Partial<ThemeChoice> | null;
    return {
      mode: parsed && MODES.includes(parsed.mode as string) ? (parsed.mode as ThemeMode) : DEFAULT_THEME.mode,
      accent: parsed && ACCENTS.includes(parsed.accent as string) ? (parsed.accent as ThemeAccent) : DEFAULT_THEME.accent,
    };
  } catch {
    return DEFAULT_THEME;
  }
}

export function isDark(mode: ThemeMode, systemPrefersDark: boolean): boolean {
  return mode === "dark" || (mode === "system" && systemPrefersDark);
}

/** Aplica el tema al <html>: clase `dark` y atributo `data-theme` con el acento. */
export function applyTheme(choice: ThemeChoice): void {
  const root = document.documentElement;
  root.classList.toggle("dark", isDark(choice.mode, window.matchMedia("(prefers-color-scheme: dark)").matches));
  root.dataset.theme = choice.accent;
}

export function readStoredTheme(): string | null {
  try {
    return window.localStorage.getItem(THEME_STORAGE_KEY);
  } catch {
    return null; // localStorage puede no estar disponible (modo privado, datos bloqueados)
  }
}

export function saveTheme(choice: ThemeChoice): void {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(choice));
  } catch {
    // sin persistencia: el tema se aplica en esta sesión y no pasa nada más
  }
  applyTheme(choice);
  window.dispatchEvent(new Event(THEME_EVENT));
}

/**
 * Se ejecuta en el <head> antes de pintar la página. Debe seguir siendo autónomo (no puede importar
 * nada) y tolerar un localStorage ausente o corrupto.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var d={mode:"system",accent:"oceano"},t=d;try{var r=JSON.parse(localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY
)})||"null");if(r&&typeof r==="object"){t={mode:${JSON.stringify(MODES)}.indexOf(r.mode)>=0?r.mode:d.mode,accent:${JSON.stringify(
  ACCENTS
)}.indexOf(r.accent)>=0?r.accent:d.accent}}}catch(e){}var e=document.documentElement,s=window.matchMedia("(prefers-color-scheme: dark)").matches;e.classList.toggle("dark",t.mode==="dark"||(t.mode==="system"&&s));e.dataset.theme=t.accent}catch(e){}})();`;
