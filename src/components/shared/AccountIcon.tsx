import { createElement } from "react";
import { getAccountIcon } from "@/lib/account-icons";

/** Icono de una cuenta: el que eligió la persona o, si no hay, el de su tipo. */
export function AccountIcon({ icon, type, className }: { icon: string | null | undefined; type: string; className?: string }) {
  return createElement(getAccountIcon(icon, type), { className, "aria-hidden": true });
}
