import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { FLOW_STEPS, GLOSSARY, PAGE_HELP, PAGE_TOURS, TOUR_STEPS, getPageHelp, getPageTour } from "../help-content";

const root = process.cwd();
const read = (rel: string) => readFileSync(join(root, rel), "utf8");
const layout = read("src/components/layout/AppLayoutClient.tsx");
const dashboard = read("src/app/(app)/dashboard/page.tsx");
const helpButton = read("src/components/help/HelpButton.tsx");

describe("contenido de la ayuda", () => {
  it("los pasos del recorrido tienen id único y texto", () => {
    const ids = TOUR_STEPS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const s of TOUR_STEPS) {
      expect(s.title.trim()).not.toBe("");
      expect(s.description.trim()).not.toBe("");
    }
  });

  it("solo el paso de bienvenida va sin elemento", () => {
    expect(TOUR_STEPS.filter((s) => s.selectors.length === 0).map((s) => s.id)).toEqual(["bienvenida"]);
  });

  it("cada selector del recorrido apunta a un data-tour que existe en el código", () => {
    const source = layout + dashboard + helpButton;
    for (const step of TOUR_STEPS) {
      for (const selector of step.selectors) {
        const value = /\[data-tour="([^"]+)"\]/.exec(selector)?.[1];
        expect(value, `selector mal formado: ${selector}`).toBeDefined();
        if (value!.startsWith("nav-")) {
          // los enlaces del menú reciben data-tour={`nav-${slug de la ruta}`}
          expect(layout).toContain('data-tour={`nav-${item.href.slice(1)}`}');
          expect(layout, `no hay ruta /${value!.slice(4)} en el menú`).toContain(`href: "/${value!.slice(4)}"`);
        } else {
          // atributo literal (data-tour="x") o argumento del helper de la barra móvil ("x")
          expect(source, `falta data-tour "${value}"`).toContain(`"${value}"`);
        }
      }
    }
  });

  it("el flujo recomendado enlaza a rutas con ayuda propia", () => {
    expect(FLOW_STEPS).toHaveLength(4);
    for (const step of FLOW_STEPS) expect(PAGE_HELP[step.href], step.href).toBeDefined();
  });

  it("el glosario no tiene términos repetidos", () => {
    const terms = GLOSSARY.map((g) => g.term);
    expect(new Set(terms).size).toBe(terms.length);
  });
});

describe("getPageHelp", () => {
  it("cada sección del menú tiene ayuda propia", () => {
    for (const route of Object.keys(PAGE_HELP)) expect(getPageHelp(route).title).not.toBe("Lukiva");
  });

  it("las subrutas heredan la ayuda de su sección", () => {
    expect(getPageHelp("/cuentas/abc/editar").title).toBe("Cuentas");
    expect(getPageHelp("/transacciones/nuevo").title).toBe("Movimientos");
  });

  it("una ruta desconocida usa la ayuda general", () => {
    expect(getPageHelp("/no-existe").title).toBe("Lukiva");
  });

  it("no confunde prefijos parciales (/cuentasx no es /cuentas)", () => {
    expect(getPageHelp("/cuentasx").title).toBe("Lukiva");
  });
});

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (entry === "__tests__") return [];
    return statSync(full).isDirectory() ? sourceFiles(full) : /\.(tsx?|ts)$/.test(entry) ? [full] : [];
  });
}

describe("recorridos por pantalla", () => {
  const allSource = sourceFiles(join(root, "src"))
    .map((file) => readFileSync(file, "utf8"))
    .join("\n");

  it("cada sección con ayuda tiene su recorrido", () => {
    for (const route of Object.keys(PAGE_HELP)) expect(getPageTour(route), route).not.toBeNull();
  });

  it("cada recorrido corresponde a una pantalla que existe", () => {
    for (const route of Object.keys(PAGE_TOURS)) {
      expect(existsSync(join(root, "src/app/(app)", route, "page.tsx")), route).toBe(true);
    }
  });

  it("empieza diciendo en qué pantalla estás y tiene más de un paso", () => {
    for (const [route, tour] of Object.entries(PAGE_TOURS)) {
      expect(tour.steps.length, route).toBeGreaterThanOrEqual(2);
      expect(tour.steps[0].title, route).toBe(`Estás en: ${tour.name}`);
      const ids = tour.steps.map((step) => step.id);
      expect(new Set(ids).size, route).toBe(ids.length);
      for (const step of tour.steps) {
        expect(step.selectors.length, `${route}/${step.id}`).toBeGreaterThan(0);
        expect(step.description.trim(), `${route}/${step.id}`).not.toBe("");
      }
    }
  });

  it("cada data-tour usado por un recorrido existe en el código", () => {
    for (const [route, tour] of Object.entries(PAGE_TOURS)) {
      for (const step of tour.steps) {
        for (const selector of step.selectors) {
          const value = /\[data-tour="([^"]+)"\]/.exec(selector)?.[1];
          if (value) expect(allSource, `${route}/${step.id}: falta data-tour "${value}"`).toContain(`data-tour="${value}"`);
        }
      }
    }
  });

  it("solo coincide la ruta exacta: las pantallas de edición no heredan el recorrido de la lista", () => {
    expect(getPageTour("/cuentas")?.name).toBe("Cuentas");
    expect(getPageTour("/cuentas/")?.name).toBe("Cuentas");
    expect(getPageTour("/cuentas/abc/editar")).toBeNull();
    expect(getPageTour("/transacciones/transferir")?.name).toBe("Transferir entre cuentas");
  });
});
