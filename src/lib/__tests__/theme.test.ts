import { describe, expect, it } from "vitest";
import { DEFAULT_THEME, THEME_ACCENTS, THEME_INIT_SCRIPT, isDark, parseTheme } from "../theme";

describe("parseTheme", () => {
  it("usa el tema por defecto si no hay nada guardado o está corrupto", () => {
    expect(parseTheme(null)).toEqual(DEFAULT_THEME);
    expect(parseTheme("{no es json")).toEqual(DEFAULT_THEME);
    expect(parseTheme("null")).toEqual(DEFAULT_THEME);
  });
  it("acepta valores válidos y reemplaza solo los inválidos", () => {
    expect(parseTheme('{"mode":"dark","accent":"menta"}')).toEqual({ mode: "dark", accent: "menta" });
    expect(parseTheme('{"mode":"neon","accent":"violeta"}')).toEqual({ mode: "system", accent: "violeta" });
  });
});

describe("isDark", () => {
  it("oscuro siempre es oscuro, claro nunca, y automático sigue al sistema", () => {
    expect(isDark("dark", false)).toBe(true);
    expect(isDark("light", true)).toBe(false);
    expect(isDark("system", true)).toBe(true);
    expect(isDark("system", false)).toBe(false);
  });
});

describe("THEME_INIT_SCRIPT", () => {
  it("es JavaScript válido y conoce todos los acentos", () => {
    expect(() => new Function(THEME_INIT_SCRIPT)).not.toThrow();
    for (const accent of THEME_ACCENTS) expect(THEME_INIT_SCRIPT).toContain(accent.value);
  });
  it("cada acento tiene reglas de color en globals.css (claro y oscuro)", async () => {
    const { readFileSync } = await import("node:fs");
    const css = readFileSync(`${process.cwd()}/src/app/globals.css`, "utf8");
    for (const accent of THEME_ACCENTS.filter((a) => a.value !== "oceano")) {
      expect(css, accent.value).toContain(`:root[data-theme="${accent.value}"] {`);
      expect(css, accent.value).toContain(`:root[data-theme="${accent.value}"].dark {`);
    }
  });
});
