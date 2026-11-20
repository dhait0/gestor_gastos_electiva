"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CircleHelp, Compass, MapPin } from "lucide-react";
import "driver.js/dist/driver.css";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { FLOW_STEPS, GLOSSARY, getPageHelp, getPageTour } from "./help-content";
import { startTour } from "./tour";
import type { TourStep } from "./help-content";

const SEEN_KEY = "lukiva:ayuda-vista";
const SEEN_EVENT = "lukiva:ayuda-vista-cambio";

// El aviso "nuevo" lee localStorage como fuente externa: en el servidor siempre es false (sin desajuste de hidratación).
function subscribeSeen(onChange: () => void) {
  window.addEventListener(SEEN_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(SEEN_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function getUnseen(): boolean {
  try {
    return window.localStorage.getItem(SEEN_KEY) === null;
  } catch {
    return false; // localStorage puede no estar disponible (modo privado, datos bloqueados)
  }
}

/**
 * Botón flotante «?» con la ayuda de Lukiva: flujo de uso recomendado, qué
 * significa cada número, consejos de la sección actual y el recorrido guiado.
 * No abre nada por sí solo (no bloquea la pantalla); mientras no se haya abierto
 * nunca, el botón late suavemente para que se note.
 */
export function HelpButton() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const unseen = useSyncExternalStore(subscribeSeen, getUnseen, () => false);

  const markSeen = () => {
    try {
      window.localStorage.setItem(SEEN_KEY, "1");
    } catch {
      // sin persistencia: el aviso volverá a aparecer, no pasa nada
    }
    window.dispatchEvent(new Event(SEEN_EVENT));
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) markSeen();
  };

  const pageTour = getPageTour(pathname);

  const handleStartTour = (steps?: TourStep[]) => {
    setOpen(false);
    // Espera a que el panel termine de cerrarse: mientras está abierto el resto de la página no es interactivo.
    window.setTimeout(() => void startTour(steps), 300);
  };

  const page = getPageHelp(pathname);

  return (
    <>
      <button
        type="button"
        data-tour="ayuda"
        onClick={() => handleOpenChange(true)}
        aria-label="Ayuda y recorrido guiado"
        aria-haspopup="dialog"
        className="fixed bottom-24 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 lg:bottom-6 lg:right-6 print:hidden"
      >
        <CircleHelp className="h-6 w-6" aria-hidden="true" />
        {unseen && (
          <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75 motion-safe:animate-ping" />
            <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-secondary" />
          </span>
        )}
      </button>

      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="font-heading text-xl">Ayuda de Lukiva</SheetTitle>
            <SheetDescription>Tu dinero, a tu ritmo. Así se usa la app.</SheetDescription>
          </SheetHeader>

          <div className="space-y-6 px-6 pb-8">
            <div className="space-y-2">
              {pageTour && (
                <Button type="button" onClick={() => handleStartTour(pageTour.steps)} className="w-full">
                  <MapPin className="mr-2 h-4 w-4" aria-hidden="true" />
                  Recorrido de esta pantalla: {pageTour.name}
                </Button>
              )}
              <Button type="button" variant={pageTour ? "outline" : "default"} onClick={() => handleStartTour()} className="w-full">
                <Compass className="mr-2 h-4 w-4" aria-hidden="true" />
                Recorrido general de Lukiva
              </Button>
            </div>

            <section aria-labelledby="ayuda-aqui">
              <h3 id="ayuda-aqui" className="text-sm font-semibold text-foreground">
                En esta pantalla: {page.title}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">{page.summary}</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-foreground">
                {page.tips.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="ayuda-flujo">
              <h3 id="ayuda-flujo" className="text-sm font-semibold text-foreground">
                Cómo usar Lukiva, paso a paso
              </h3>
              <ol className="mt-2 space-y-3">
                {FLOW_STEPS.map((step, index) => (
                  <li key={step.title} className="flex gap-3">
                    <span
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary"
                      aria-hidden="true"
                    >
                      {index + 1}
                    </span>
                    <div className="text-sm">
                      <p className="font-medium text-foreground">{step.title}</p>
                      <p className="text-muted-foreground">{step.description}</p>
                      <Link
                        href={step.href}
                        onClick={() => setOpen(false)}
                        className="mt-1 inline-block text-primary underline-offset-2 hover:underline"
                      >
                        {step.cta}
                      </Link>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            <section aria-labelledby="ayuda-glosario">
              <h3 id="ayuda-glosario" className="text-sm font-semibold text-foreground">
                Qué significa cada número
              </h3>
              <dl className="mt-2 space-y-3 text-sm">
                {GLOSSARY.map((item) => (
                  <div key={item.term}>
                    <dt className="font-medium text-foreground">{item.term}</dt>
                    <dd className="text-muted-foreground">{item.meaning}</dd>
                  </div>
                ))}
              </dl>
            </section>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
