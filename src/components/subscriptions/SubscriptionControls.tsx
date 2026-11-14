"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { deleteSubscriptionAction, markSubscriptionPaidAction, setSubscriptionStatusAction } from "@/app/actions/subscriptions";

export function SubscriptionControls({
  id,
  status,
}: {
  id: string;
  status: "ACTIVE" | "PAUSED" | "CANCELLED";
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const run = (fn: () => Promise<unknown>) =>
    startTransition(async () => {
      await fn();
      router.refresh();
    });

  return (
    <div className="flex flex-wrap gap-2">
      {status === "ACTIVE" && (
        <Button type="button" size="sm" disabled={isPending} onClick={() => run(() => markSubscriptionPaidAction(id))}>
          Marcar pagada
        </Button>
      )}
      {status === "ACTIVE" && (
        <Button type="button" variant="outline" size="sm" disabled={isPending} onClick={() => run(() => setSubscriptionStatusAction(id, "PAUSED"))}>
          Pausar
        </Button>
      )}
      {(status === "PAUSED" || status === "CANCELLED") && (
        <Button type="button" variant="outline" size="sm" disabled={isPending} onClick={() => run(() => setSubscriptionStatusAction(id, "ACTIVE"))}>
          Reactivar
        </Button>
      )}
      {status !== "CANCELLED" && (
        <Button type="button" variant="outline" size="sm" disabled={isPending} onClick={() => run(() => setSubscriptionStatusAction(id, "CANCELLED"))}>
          Cancelar
        </Button>
      )}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={isPending}
        className="text-danger"
        onClick={() => {
          if (window.confirm("¿Eliminar esta suscripción?")) run(() => deleteSubscriptionAction(id));
        }}
      >
        Eliminar
      </Button>
    </div>
  );
}
