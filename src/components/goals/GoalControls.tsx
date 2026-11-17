"use client";

import { preventFormReset, resetFormFields } from "@/lib/keep-form-on-error";
import { useActionState, useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  addContributionAction,
  archiveGoalAction,
  deleteContributionAction,
  setGoalStatusAction,
} from "@/app/actions/goals";

const initialState = { error: undefined, data: undefined };

export function AddContributionForm({ goalId, disabled }: { goalId: string; disabled?: boolean }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(addContributionAction, initialState);

  const succeeded = "data" in state && !!state.data;
  useEffect(() => {
    if (succeeded) {
      resetFormFields(formRef.current);
      router.refresh();
    }
  }, [succeeded, state, router]);

  const fieldError =
    "error" in state && state.error && typeof state.error === "object" ? state.error.amount?.[0] : undefined;
  const generalError = "error" in state && typeof state.error === "string" ? state.error : undefined;

  return (
    <form ref={formRef} action={formAction} onReset={preventFormReset} className="space-y-3">
      <input type="hidden" name="goal_id" value={goalId} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label htmlFor="amount">Aporte *</Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            required
            disabled={isPending || disabled}
            className="tabular-nums"
          />
        </div>
        <div>
          <Label htmlFor="notes">Nota</Label>
          <Input id="notes" name="notes" maxLength={300} disabled={isPending || disabled} />
        </div>
      </div>
      {(fieldError || generalError) && (
        <p className="text-sm text-destructive" role="alert">
          {fieldError ?? generalError}
        </p>
      )}
      <Button type="submit" disabled={isPending || disabled}>
        {isPending ? "Guardando..." : "Registrar aporte"}
      </Button>
    </form>
  );
}

export function DeleteContributionButton({ contributionId, goalId }: { contributionId: string; goalId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      disabled={isPending}
      aria-label="Eliminar aporte"
      className="text-muted-foreground hover:text-danger"
      onClick={() => {
        if (!window.confirm("¿Eliminar este aporte?")) return;
        startTransition(async () => {
          await deleteContributionAction(contributionId, goalId);
          router.refresh();
        });
      }}
    >
      <Trash2 className="w-4 h-4" />
    </Button>
  );
}

export function GoalStatusControls({
  goalId,
  status,
}: {
  goalId: string;
  status: "ACTIVE" | "COMPLETED" | "PAUSED" | "CANCELLED";
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const change = (next: "ACTIVE" | "PAUSED" | "CANCELLED") =>
    startTransition(async () => {
      await setGoalStatusAction(goalId, next);
      router.refresh();
    });

  const remove = () => {
    if (!window.confirm("¿Eliminar esta meta y sus aportes de tu vista?")) return;
    startTransition(async () => {
      await archiveGoalAction(goalId);
      router.push("/metas");
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
      {(status === "ACTIVE" || status === "PAUSED") && (
        <Button type="button" variant="outline" size="sm" disabled={isPending} onClick={() => change("CANCELLED")}>
          Cancelar meta
        </Button>
      )}
      <Button type="button" variant="ghost" size="sm" disabled={isPending} onClick={remove} className="text-danger">
        Eliminar
      </Button>
    </div>
  );
}
