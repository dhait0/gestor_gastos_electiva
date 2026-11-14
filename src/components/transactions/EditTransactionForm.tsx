"use client";

import { preventFormReset } from "@/lib/keep-form-on-error";
import { useActionState, useEffect, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deleteTransactionAction, updateTransactionAction } from "@/app/actions/transactions";

const initialState = { error: undefined, data: undefined };
const selectClass =
  "flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export interface EditableTx {
  id: string;
  type: "INCOME" | "EXPENSE" | "TRANSFER";
  amount: string;
  description: string;
  transaction_date: string;
  notes: string | null;
  account_id: string;
  category_id: string | null;
  currency_code: string;
}

interface Option {
  id: string;
  name: string;
  currency_code?: string;
}

export function DeleteTransactionButton({ id, isTransfer }: { id: string; isTransfer: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  return (
    <Button
      type="button"
      variant="outline"
      disabled={isPending}
      className="text-danger"
      onClick={() => {
        const message = isTransfer
          ? "¿Eliminar esta transferencia? Se eliminarán ambas partes (salida y entrada)."
          : "¿Eliminar este movimiento?";
        if (!window.confirm(message)) return;
        startTransition(async () => {
          await deleteTransactionAction(id);
          router.push("/transacciones");
          router.refresh();
        });
      }}
    >
      {isPending ? "Eliminando..." : isTransfer ? "Eliminar transferencia" : "Eliminar movimiento"}
    </Button>
  );
}

export function EditTransactionForm({
  tx,
  accounts,
  categories,
}: {
  tx: EditableTx;
  accounts: Option[];
  categories: Option[];
}) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(updateTransactionAction, initialState);

  const saved = "data" in state && !!state.data;
  useEffect(() => {
    if (saved) {
      router.push("/transacciones");
      router.refresh();
    }
  }, [saved, router]);

  const fieldError = (field: string) =>
    "error" in state && state.error && typeof state.error === "object" ? state.error[field]?.[0] : undefined;
  const generalError = "error" in state && typeof state.error === "string" ? state.error : undefined;
  // Solo cuentas de la misma moneda del movimiento
  const sameCurrency = accounts.filter((a) => !a.currency_code || a.currency_code === tx.currency_code);

  return (
    <form action={formAction} onReset={preventFormReset} className="space-y-6">
      <input type="hidden" name="id" value={tx.id} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="amount">Monto *</Label>
          <Input id="amount" name="amount" type="number" step="0.01" min="0.01" required defaultValue={tx.amount} disabled={isPending} className="tabular-nums" />
          {fieldError("amount") && <p className="mt-1 text-sm text-destructive" role="alert">{fieldError("amount")}</p>}
        </div>
        <div>
          <Label htmlFor="transaction_date">Fecha *</Label>
          <Input id="transaction_date" name="transaction_date" type="date" required defaultValue={tx.transaction_date} disabled={isPending} />
          {fieldError("transaction_date") && <p className="mt-1 text-sm text-destructive" role="alert">{fieldError("transaction_date")}</p>}
        </div>
        <div>
          <Label htmlFor="account_id">Cuenta *</Label>
          <select id="account_id" name="account_id" required defaultValue={tx.account_id} className={selectClass} disabled={isPending}>
            {sameCurrency.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>
        <div>
          <Label htmlFor="category_id">Categoría *</Label>
          <select id="category_id" name="category_id" required defaultValue={tx.category_id ?? ""} className={selectClass} disabled={isPending}>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="description">Descripción *</Label>
          <Input id="description" name="description" required maxLength={200} defaultValue={tx.description} disabled={isPending} />
          {fieldError("description") && <p className="mt-1 text-sm text-destructive" role="alert">{fieldError("description")}</p>}
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="notes">Notas</Label>
          <Input id="notes" name="notes" maxLength={500} defaultValue={tx.notes ?? ""} disabled={isPending} />
        </div>
      </div>

      {generalError && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive" role="alert">
          {generalError}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border">
        <DeleteTransactionButton id={tx.id} isTransfer={false} />
        <div className="flex items-center gap-3">
          <Link href="/transacciones">
            <Button type="button" variant="outline" disabled={isPending}>Cancelar</Button>
          </Link>
          <Button type="submit" disabled={isPending}>{isPending ? "Guardando..." : "Guardar cambios"}</Button>
        </div>
      </div>
    </form>
  );
}
