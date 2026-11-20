import { TOUR_STEPS, type TourStep } from "./help-content";
import { tourBridge } from "./tour-bridge";

function isVisible(el: Element): el is HTMLElement {
  if (!(el instanceof HTMLElement)) return false;
  const rect = el.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0 && getComputedStyle(el).visibility !== "hidden";
}

/** Primer elemento visible entre los candidatos (la barra lateral solo existe en escritorio). */
function resolveElement(selectors: string[]): HTMLElement | null {
  for (const selector of selectors) {
    for (const el of document.querySelectorAll(selector)) {
      if (isVisible(el)) return el;
    }
  }
  return null;
}

interface ResolvedStep {
  step: TourStep;
  element: HTMLElement | null;
  /** El elemento está dentro del menú móvil: hay que abrirlo antes de mostrarlo. */
  inMenu?: boolean;
}

/** La barra lateral fija solo existe desde 1024px (breakpoint `lg`). */
function isDesktop(): boolean {
  return window.matchMedia("(min-width: 1024px)").matches;
}

const MENU_ANIMATION_MS = 350;
const sleep = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

/** Espera (hasta ~1,5 s) a que algún candidato esté visible. */
async function waitForElement(selectors: string[]): Promise<HTMLElement | null> {
  for (let i = 0; i < 30; i++) {
    const el = resolveElement(selectors);
    if (el) return el;
    await sleep(50);
  }
  return null;
}

/**
 * Pasos aplicables a la pantalla actual: se omiten los que no tienen ningún
 * elemento visible y los que apuntarían al mismo elemento que uno anterior
 * (en móvil varias secciones viven tras el botón «Más»).
 */
export function resolveTourSteps(steps: TourStep[] = TOUR_STEPS): ResolvedStep[] {
  const used = new Set<HTMLElement>();
  const resolved: ResolvedStep[] = [];
  const mobile = !isDesktop();
  for (const step of steps) {
    if (step.selectors.length === 0) {
      resolved.push({ step, element: null });
      continue;
    }
    // En móvil estos elementos no existen hasta abrir el menú: se resuelven al llegar al paso.
    if (mobile && step.inMobileMenu) {
      resolved.push({ step, element: null, inMenu: true });
      continue;
    }
    const element = resolveElement(step.selectors);
    if (!element || used.has(element)) continue;
    used.add(element);
    resolved.push({ step, element });
  }
  return resolved;
}

/** Inicia el recorrido guiado. driver.js se carga bajo demanda: no pesa en el resto de la app. */
export async function startTour(tourSteps: TourStep[] = TOUR_STEPS): Promise<void> {
  const { driver } = await import("driver.js");
  const steps = resolveTourSteps(tourSteps);
  let menuOpen = false;

  const setMenu = async (open: boolean) => {
    if (menuOpen === open) return;
    menuOpen = open;
    tourBridge.setMenuOpen(open);
    await sleep(MENU_ANIMATION_MS);
  };

  // Antes de mostrar un paso se deja la pantalla como lo necesita (menú abierto o cerrado, elemento visible).
  const prepare = async (target: ResolvedStep) => {
    await setMenu(Boolean(target.inMenu));
    if (target.inMenu) await waitForElement(target.step.selectors);
  };

  const go = async (delta: 1 | -1) => {
    const target = steps[(tour.getActiveIndex() ?? 0) + delta];
    if (!target) {
      tour.destroy();
      return;
    }
    await prepare(target);
    if (delta === 1) tour.moveNext();
    else tour.movePrevious();
  };

  const tour = driver({
    showProgress: true,
    progressText: "{{current}} de {{total}}",
    nextBtnText: "Siguiente",
    prevBtnText: "Atrás",
    doneBtnText: "Listo",
    allowClose: true,
    allowKeyboardControl: true,
    overlayOpacity: 0.55,
    stagePadding: 6,
    stageRadius: 10,
    popoverClass: "lukiva-tour",
    onNextClick: () => void go(1),
    onPrevClick: () => void go(-1),
    onDestroyed: () => {
      tourBridge.setActive(false);
      void setMenu(false);
    },
    steps: steps.map(({ step, element, inMenu }) => ({
      // Los pasos del menú móvil se resuelven al mostrarlos, cuando el menú ya está abierto.
      element: inMenu ? () => resolveElement(step.selectors) ?? document.body : (element ?? undefined),
      popover: {
        title: step.title,
        description: step.description,
        side: step.side,
        align: "start" as const,
      },
    })),
  });

  tourBridge.setActive(true);
  tour.drive();
}
