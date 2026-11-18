"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Archive, ArchiveRestore } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { archiveAccountAction, unarchiveAccountAction } from "@/app/actions/accounts";
import { archiveCategoryAction } from "@/app/actions/categories";

/**
 * Opción "Archivar" (o "Desarchivar", solo cuentas) de los menús de cuentas y
 * categorías. Es un componente de cliente porque lleva un manejador de eventos:
 * las páginas de lista son componentes de servidor y no pueden pasarlo a los
 * menús de Radix.
 */
export function ArchiveMenuItem({
  id,
  kind,
  restore = false,
}: {
  id: string;
  kind: "account" | "category";
  /** true: devuelve una cuenta archivada a las activas. */
  restore?: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <DropdownMenuItem
      disabled={isPending}
      className={
        restore
          ? "flex items-center gap-2 px-2 py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          : "flex items-center gap-2 px-2 py-1.5 text-destructive focus:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2"
      }
      onSelect={() =>
        startTransition(async () => {
          const result =
            kind === "category"
              ? await archiveCategoryAction(id)
              : restore
                ? await unarchiveAccountAction(id)
                : await archiveAccountAction(id);
          if ("error" in result && result.error) {
            window.alert(restore ? "No se pudo desarchivar. Intenta de nuevo." : "No se pudo archivar. Intenta de nuevo.");
            return;
          }
          router.refresh();
        })
      }
    >
      {restore ? <ArchiveRestore className="w-4 h-4" aria-hidden="true" /> : <Archive className="w-4 h-4" aria-hidden="true" />}
      {restore ? "Desarchivar" : "Archivar"}
    </DropdownMenuItem>
  );
}
