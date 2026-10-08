"use client";

import { useTransition } from "react";
import { logoutAction } from "@/app/actions/auth";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

export function LogoutButton() {
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
    });
  };

  return (
    <form action={handleLogout}>
      <button
        type="submit"
        disabled={isPending}
        className={cn(
          "inline-flex items-center gap-2 px-3 py-2",
          "rounded-lg border border-border",
          "bg-card hover:bg-muted/50",
          "text-sm font-medium text-foreground",
          "transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
      >
        <LogOut className="w-4 h-4" />
        <span className="hidden sm:inline">Cerrar sesión</span>
      </button>
    </form>
  );
}