"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateBudgetAction } from "@/app/actions/budgets";

const initialState = { error: undefined, data: undefined };

export function EditBudgetForm({ id, limit, month }: { id: string; limit: string; month: string }) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(updateBudgetAction, initialState);

  const saved = "data" in state && !!state.data;
  useEffect(() => {
    if (saved) {
      router.push(`/presupuestos?month=${month}`);
      router.refresh();
    }
  }, [saved, month, router]);

  const fieldError = "error" in state && state.error && typeof state.error === "object" ? state.error.limit_amount?.[0] : undefined;
  const generalError = "error" in state && typeof state.error === "string" ? state.error : undefined;

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="id" value={id} />
      <div>
        <Label htmlFor="limit_amount">Límite *</Label>
        <Input id="limit_amount" name="limit_amount" type="number" step="0.01" min="0.01" required defaultValue={limit} disabled={isPending} className="tabular-nums" />
        {fieldError && <p className="mt-1 text-sm text-destructive" role="alert">{fieldError}</p>}
      </div>
      {generalError && <p className="text-sm text-destructive" role="alert">{generalError}</p>}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
        <Link href={`/presupuestos?month=${month}`}>
          <Button type="button" variant="outline" disabled={isPending}>Cancelar</Button>
        </Link>
        <Button type="submit" disabled={isPending}>{isPending ? "Guardando..." : "Guardar límite"}</Button>
      </div>
    </form>
  );
}
