"use client";

import { useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { markAlertReadAction, markAllAlertsReadAction, refreshAlertsAction } from "@/app/actions/alerts";

/** Evalúa las reglas de alertas una sola vez al abrir el centro de notificaciones. */
export function AutoRefreshAlerts() {
  const router = useRouter();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    refreshAlertsAction().then((r) => {
      if (r.created > 0) router.refresh();
    });
  }, [router]);

  return null;
}

export function MarkReadButton({ id }: { id: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await markAlertReadAction(id);
          router.refresh();
        })
      }
    >
      Marcar leída
    </Button>
  );
}

export function MarkAllReadButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await markAllAlertsReadAction();
          router.refresh();
        })
      }
    >
      Marcar todas como leídas
    </Button>
  );
}
