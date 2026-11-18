import { TOUR_STEPS, type TourStep } from "./help-content";

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
}

/**
 * Pasos aplicables a la pantalla actual: se omiten los que no tienen ningún
 * elemento visible y los que apuntarían al mismo elemento que uno anterior
 * (en móvil varias secciones viven tras el botón «Más»).
 */
export function resolveTourSteps(steps: TourStep[] = TOUR_STEPS): ResolvedStep[] {
  const used = new Set<HTMLElement>();
  const resolved: ResolvedStep[] = [];
  for (const step of steps) {
    if (step.selectors.length === 0) {
      resolved.push({ step, element: null });
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
export async function startTour(): Promise<void> {
  const { driver } = await import("driver.js");
  const steps = resolveTourSteps();

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
    steps: steps.map(({ step, element }) => ({
      element: element ?? undefined,
      popover: {
        title: step.title,
        description: step.description,
        side: step.side,
        align: "start" as const,
      },
    })),
  });

  tour.drive();
}
