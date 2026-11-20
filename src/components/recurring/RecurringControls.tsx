"use client";

import { useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { deleteRecurringAction, registerDueOccurrencesAction, setRecurringStatusAction } from "@/app/actions/recurring";

/** Registra en segundo plano las ocurrencias vencidas de las recurrencias automáticas, una sola vez al abrir. */
export function AutoRegister({ hasDueAutomatic }: { hasDueAutomatic: boolean }) {
  const router = useRouter();
  const ran = useRef(false);

  useEffect(() => {
    if (!hasDueAutomatic || ran.current) return;
    ran.current = true;
    registerDueOccurrencesAction({ onlyAutomatic: true }).then(() => router.refresh());
  }, [hasDueAutomatic, router]);

  return null;
}

export function RegisterDueButton({ recurringId, dueCount }: { recurringId: string; dueCount: number }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  return (
    <Button
      data-tour="recurrente-vencidos"
      type="button"
      size="sm"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await registerDueOccurrencesAction({ recurringId });
          router.refresh();
        })
      }
    >
      {isPending ? "Registrando..." : `Registrar ${dueCount} vencido${dueCount === 1 ? "" : "s"}`}
    </Button>
  );
}

export function RecurringStatusControls({
  id,
  status,
}: {
  id: string;
  status: "ACTIVE" | "PAUSED" | "CANCELLED";
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const change = (next: "ACTIVE" | "PAUSED" | "CANCELLED") =>
    startTransition(async () => {
      await setRecurringStatusAction(id, next);
      router.refresh();
    });

  const remove = () => {
    if (!window.confirm("¿Eliminar este movimiento recurrente? Los movimientos ya registrados se conservan.")) return;
    startTransition(async () => {
      await deleteRecurringAction(id);
      router.refresh();
    });
  };

  return (
    <div className="flex flex-wrap gap-2">
      {status === "ACTIVE" && (
        <Button type="button" variant="outline" size="sm" disabled={isPending} onClick={() => change("PAUSED")}>
          Pausar
        </Button>
      )}
      {(status === "PAUSED" || status === "CANCELLED") && (
        <Button type="button" variant="outline" size="sm" disabled={isPending} onClick={() => change("ACTIVE")}>
          Reanudar
        </Button>
      )}
      {status !== "CANCELLED" && (
        <Button type="button" variant="outline" size="sm" disabled={isPending} onClick={() => change("CANCELLED")}>
          Cancelar
        </Button>
      )}
      <Button type="button" variant="ghost" size="sm" disabled={isPending} onClick={remove} className="text-danger">
        Eliminar
      </Button>
    </div>
  );
}
