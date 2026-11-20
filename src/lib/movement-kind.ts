import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight, type LucideIcon } from "lucide-react";

export type MovementTone = "income" | "expense" | "transfer";

export interface MovementKind {
  tone: MovementTone;
  /** Nombre corto del tipo: «Ingreso», «Gasto» o «Transferencia». */
  label: string;
  /** Qué significa para esta cuenta: entra, sale o solo cambia de lugar. */
  detail: string;
  Icon: LucideIcon;
  /** Signo con el que se muestra el monto: las transferencias no son ni ganancia ni gasto. */
  sign: "+" | "-" | "";
}

/** Cómo se identifica un movimiento en pantalla (icono, color, nombre y signo), igual en toda la app. */
export function describeMovement(type: string, direction?: string | null): MovementKind {
  if (type === "INCOME") return { tone: "income", label: "Ingreso", detail: "Entra dinero", Icon: ArrowDownLeft, sign: "+" };
  if (type === "EXPENSE") return { tone: "expense", label: "Gasto", detail: "Sale dinero", Icon: ArrowUpRight, sign: "-" };
  return {
    tone: "transfer",
    label: "Transferencia",
    detail: direction === "INFLOW" ? "Entra desde otra cuenta" : "Sale hacia otra cuenta",
    Icon: ArrowLeftRight,
    sign: "",
  };
}

export const MOVEMENT_TONE_CLASSES: Record<MovementTone, { badge: string; text: string; icon: string }> = {
  income: { badge: "bg-success/10 text-success", text: "text-success", icon: "bg-success/10 text-success" },
  expense: { badge: "bg-danger/10 text-danger", text: "text-danger", icon: "bg-danger/10 text-danger" },
  transfer: { badge: "bg-primary/10 text-primary", text: "text-primary", icon: "bg-primary/10 text-primary" },
};
