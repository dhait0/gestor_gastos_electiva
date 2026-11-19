/**
 * Puente entre el recorrido guiado y el layout: el recorrido necesita abrir y
 * cerrar el menú lateral de móvil (que vive en AppLayoutClient) para poder
 * señalar los enlaces que están dentro de él.
 */
type Listener = () => void;

let active = false;
let menuController: ((open: boolean) => void) | null = null;
const listeners = new Set<Listener>();

export const tourBridge = {
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  /** true mientras el recorrido está en curso. */
  isActive: () => active,
  setActive(next: boolean) {
    active = next;
    listeners.forEach((listener) => listener());
  },
  /** El layout registra aquí cómo abrir/cerrar su menú móvil. */
  registerMenu(controller: (open: boolean) => void) {
    menuController = controller;
    return () => {
      if (menuController === controller) menuController = null;
    };
  },
  setMenuOpen(open: boolean) {
    menuController?.(open);
  },
};
