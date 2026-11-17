"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setUserRoleAction } from "@/app/actions/admin";
import { ROLE_KEYS, ROLE_LABELS, type RoleKey } from "@/domain/permissions";

export function RoleSelect({ userId, role, email }: { userId: string; role: RoleKey; email: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <select
        aria-label={`Rol de ${email}`}
        value={role}
        disabled={isPending}
        className="h-9 rounded-lg border border-input bg-background px-2 text-sm"
        onChange={(e) => {
          const next = e.target.value;
          setError(null);
          startTransition(async () => {
            const result = await setUserRoleAction(userId, next);
            if ("error" in result && result.error) setError(result.error);
            router.refresh();
          });
        }}
      >
        {ROLE_KEYS.map((r) => (
          <option key={r} value={r}>
            {ROLE_LABELS[r]}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
