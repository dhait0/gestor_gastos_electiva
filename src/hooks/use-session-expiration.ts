"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function useSessionExpiration(checkIntervalMs = 60_000) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status !== "authenticated") {
      return;
    }

    const interval = setInterval(async () => {
      try {
        await fetch("/api/auth/session", { method: "GET", cache: "no-store" });
      } catch {
        router.push("/login");
      }
    }, checkIntervalMs);

    return () => clearInterval(interval);
  }, [status, router, checkIntervalMs]);

  return { session, status };
}
