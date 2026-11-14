"use client";

import { preventFormReset } from "@/lib/keep-form-on-error";
import { useActionState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { copyBudgetsAction, type BudgetCopyCandidate, type CopyBudgetsState } from "@/app/actions/budgets";
import { formatCurrency } from "@/lib/utils";

const initialState: CopyBudgetsState = {};

export function CopyBudgetsForm({ month, candidates }: { month: string; candidates: BudgetCopyCandidate[] }) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(copyBudgetsAction, initialState);

  const created = state.created;
  useEffect(() => {
    if (created) {
      router.push(`/presupuestos?month=${month}`);
      router.refresh();
    }
  }, [created, month, router]);

  const generalError = state.error;

  return (
    <form action={formAction} onReset={preventFormReset} className="space-y-4">
      <input type="hidden" name="month" value={month} />
      <fieldset className="space-y-2">
        <legend className="sr-only">Presupuestos a copiar</legend>
        {candidates.map((c) => (
          <label
            key={c.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm has-[:disabled]:opacity-60"
          >
            <span className="flex items-center gap-3">
              <input type="checkbox" name="budget_id" value={c.id} defaultChecked={!c.alreadyExists} disabled={c.alreadyExists || isPending} />
              <span className="font-medium text-foreground">{c.category_name}</span>
            </span>
            <span className="tabular-nums text-muted-foreground">
              {formatCurrency(Number(c.limit_amount), c.currency_code)}
              {c.alreadyExists && " · ya existe en este mes"}
            </span>
          </label>
        ))}
      </fieldset>

      {generalError && (
        <p className="text-sm text-destructive" role="alert">
          {generalError}
        </p>
      )}

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
        <Link href={`/presupuestos?month=${month}`}>
          <Button type="button" variant="outline" disabled={isPending}>Cancelar</Button>
        </Link>
        <Button type="submit" disabled={isPending}>{isPending ? "Copiando..." : "Copiar seleccionados"}</Button>
      </div>
    </form>
  );
}
