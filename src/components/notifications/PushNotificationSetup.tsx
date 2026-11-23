"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff, BellRing } from "lucide-react";
import { cn } from "@/lib/utils";

type PermissionState = "default" | "granted" | "denied" | "unsupported";

async function subscribeUser() {
  const reg = await navigator.serviceWorker.ready;
  const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  if (!vapidKey) return null;

  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidKey),
  });

  await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      endpoint: sub.endpoint,
      keys: {
        p256dh: arrayBufferToBase64(sub.getKey("p256dh")!),
        auth: arrayBufferToBase64(sub.getKey("auth")!),
      },
      userAgent: navigator.userAgent,
    }),
  });

  return sub;
}

async function unsubscribeUser() {
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  if (!sub) return;

  await fetch("/api/push/subscribe", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ endpoint: sub.endpoint }),
  });

  await sub.unsubscribe();
}

function urlBase64ToUint8Array(base64: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0))).buffer as ArrayBuffer;
}

function arrayBufferToBase64(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}

export function PushNotificationSetup() {
  const [permission, setPermission] = useState<PermissionState>(() => {
    if (typeof window === "undefined") return "default";
    if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window))
      return "unsupported";
    return Notification.permission as PermissionState;
  });
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (permission === "unsupported") return;
    navigator.serviceWorker.ready.then((reg) => {
      reg.pushManager.getSubscription().then((sub) => setSubscribed(!!sub));
    });
  }, [permission]);

  const handleEnable = async () => {
    setLoading(true);
    try {
      const result = await Notification.requestPermission();
      setPermission(result as PermissionState);
      if (result === "granted") {
        await subscribeUser();
        setSubscribed(true);
      }
    } catch {
      // silently ignore
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    setLoading(true);
    try {
      await unsubscribeUser();
      setSubscribed(false);
    } finally {
      setLoading(false);
    }
  };

  if (permission === "unsupported") {
    return (
      <div className="rounded-xl border border-border bg-muted/30 p-4 flex items-start gap-3">
        <BellOff className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-foreground">Notificaciones no disponibles</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Tu navegador no soporta notificaciones push. Para recibirlas, instalá Lukiva desde Safari y usá iOS 16.4+.
          </p>
        </div>
      </div>
    );
  }

  if (permission === "denied") {
    return (
      <div className="rounded-xl border border-warning/30 bg-warning/8 p-4 flex items-start gap-3">
        <BellOff className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-foreground">Notificaciones bloqueadas</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Las notificaciones están bloqueadas en tu dispositivo. Habilitálas desde Ajustes → Safari → Notificaciones → Lukiva.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        {subscribed
          ? <BellRing className="w-5 h-5 text-primary flex-shrink-0" />
          : <Bell className="w-5 h-5 text-muted-foreground flex-shrink-0" />}
        <div>
          <p className="text-sm font-medium text-foreground">
            {subscribed ? "Notificaciones activas" : "Activar notificaciones"}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {subscribed
              ? "Recibís alertas de pagos, resumen diario y cierre de mes."
              : "Recibí alertas cuando vence un pago o cuando tu saldo está bajo."}
          </p>
        </div>
      </div>
      <button
        onClick={subscribed ? handleDisable : handleEnable}
        disabled={loading}
        className={cn(
          "flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
          subscribed
            ? "border border-border bg-muted/50 text-muted-foreground hover:bg-muted"
            : "bg-primary text-primary-foreground hover:bg-primary/90",
          loading && "opacity-50 pointer-events-none"
        )}
      >
        {loading ? "..." : subscribed ? "Desactivar" : "Activar"}
      </button>
    </div>
  );
}
