"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createGoalAction } from "@/app/actions/goals";

const initialState = { error: undefined, data: undefined };

export default function NuevaMetaPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(createGoalAction, initialState);

  const createdId = "data" in state && state.data ? state.data.id : undefined;
  useEffect(() => {
    if (createdId) {
      router.push(`/metas/${createdId}`);
      router.refresh();
    }
  }, [createdId, router]);

  const fieldError = (field: string) =>
    "error" in state && state.error && typeof state.error === "object" ? state.error[field]?.[0] : undefined;
  const generalError = "error" in state && typeof state.error === "string" ? state.error : undefined;

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <form action={formAction} className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold text-foreground font-heading">Nueva meta</h1>

        <div>
          <Label htmlFor="name">Nombre *</Label>
          <Input id="name" name="name" required maxLength={100} disabled={isPending} placeholder="Ej: Viaje a la costa" />
          {fieldError("name") && <p className="mt-1 text-sm text-destructive" role="alert">{fieldError("name")}</p>}
        </div>

        <div>
          <Label htmlFor="description">Descripción</Label>
          <Input id="description" name="description" maxLength={500} disabled={isPending} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="target_amount">Monto objetivo *</Label>
            <Input id="target_amount" name="target_amount" type="number" step="0.01" min="0.01" required disabled={isPending} className="tabular-nums" />
            {fieldError("target_amount") && <p className="mt-1 text-sm text-destructive" role="alert">{fieldError("target_amount")}</p>}
          </div>
          <div>
            <Label htmlFor="initial_amount">Ya tengo ahorrado</Label>
            <Input id="initial_amount" name="initial_amount" type="number" step="0.01" min="0" defaultValue="0" disabled={isPending} className="tabular-nums" />
            {fieldError("initial_amount") && <p className="mt-1 text-sm text-destructive" role="alert">{fieldError("initial_amount")}</p>}
          </div>
          <div>
            <Label htmlFor="monthly_commitment_amount">Compromiso mensual</Label>
            <Input id="monthly_commitment_amount" name="monthly_commitment_amount" type="number" step="0.01" min="0" defaultValue="0" disabled={isPending} className="tabular-nums" />
          </div>
          <div>
            <Label htmlFor="target_date">Fecha objetivo</Label>
            <Input id="target_date" name="target_date" type="date" disabled={isPending} />
          </div>
        </div>

        {generalError && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive" role="alert">
            {generalError}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Link href="/metas">
            <Button type="button" variant="outline" disabled={isPending}>Cancelar</Button>
          </Link>
          <Button type="submit" disabled={isPending}>{isPending ? "Guardando..." : "Crear meta"}</Button>
        </div>
      </form>
    </main>
  );
}
