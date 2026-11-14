"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Archive } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { archiveAccountAction } from "@/app/actions/accounts";
import { archiveCategoryAction } from "@/app/actions/categories";

/**
 * Opción "Archivar" de los menús de cuentas y categorías. Es un componente de
 * cliente porque lleva un manejador de eventos: las páginas de lista son
 * componentes de servidor y no pueden pasarlo a los menús de Radix.
 */
export function ArchiveMenuItem({ id, kind }: { id: string; kind: "account" | "category" }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <DropdownMenuItem
      disabled={isPending}
      className="flex items-center gap-2 px-2 py-1.5 text-destructive focus:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2"
      onSelect={() =>
        startTransition(async () => {
          const result = kind === "account" ? await archiveAccountAction(id) : await archiveCategoryAction(id);
          if ("error" in result && result.error) {
            window.alert("No se pudo archivar. Intenta de nuevo.");
            return;
          }
          router.refresh();
        })
      }
    >
      <Archive className="w-4 h-4" aria-hidden="true" />
      Archivar
    </DropdownMenuItem>
  );
}
