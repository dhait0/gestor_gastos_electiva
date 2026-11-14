"use client";

import { preventFormReset, resetFormFields } from "@/lib/keep-form-on-error";
import { useActionState, useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deleteDebtAction, registerDebtPaymentAction, setDebtStatusAction, voidDebtPaymentAction } from "@/app/actions/debts";

const initialState = { error: undefined, data: undefined };

export function PaymentForm({ debtId, disabled }: { debtId: string; disabled?: boolean }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(registerDebtPaymentAction, initialState);

  const succeeded = "data" in state && !!state.data;
  useEffect(() => {
    if (succeeded) {
      resetFormFields(formRef.current);
      router.refresh();
    }
  }, [succeeded, state, router]);

  const fieldErrors = "error" in state && state.error && typeof state.error === "object" ? state.error : undefined;
  const generalError = "error" in state && typeof state.error === "string" ? state.error : undefined;

  return (
    <form ref={formRef} action={formAction} onReset={preventFormReset} className="space-y-3">
      <input type="hidden" name="debt_id" value={debtId} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label htmlFor="amount">Abono total *</Label>
          <Input id="amount" name="amount" type="number" step="0.01" min="0.01" required disabled={isPending || disabled} className="tabular-nums" />
        </div>
        <div>
          <Label htmlFor="interest">De los cuales, interés</Label>
          <Input id="interest" name="interest" type="number" step="0.01" min="0" defaultValue="0" disabled={isPending || disabled} className="tabular-nums" />
        </div>
      </div>
      <div>
        <Label htmlFor="notes">Nota</Label>
        <Input id="notes" name="notes" maxLength={300} disabled={isPending || disabled} />
      </div>
      {(fieldErrors || generalError) && (
        <p className="text-sm text-destructive" role="alert">
          {generalError ?? fieldErrors?.amount?.[0] ?? fieldErrors?.interest?.[0]}
        </p>
      )}
      <Button type="submit" disabled={isPending || disabled}>
        {isPending ? "Guardando..." : "Registrar abono"}
      </Button>
    </form>
  );
}

export function VoidPaymentButton({ paymentId }: { paymentId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      disabled={isPending}
      aria-label="Anular abono"
      className="text-muted-foreground hover:text-danger"
      onClick={() => {
        if (!window.confirm("¿Anular este abono? El capital vuelve al saldo de la deuda.")) return;
        startTransition(async () => {
          await voidDebtPaymentAction(paymentId);
          router.refresh();
        });
      }}
    >
      <Undo2 className="w-4 h-4" />
    </Button>
  );
}

export function DebtStatusControls({ id, status }: { id: string; status: "ACTIVE" | "PAID" | "PAUSED" | "CANCELLED" }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const change = (next: "ACTIVE" | "PAUSED" | "CANCELLED") =>
    startTransition(async () => {
      await setDebtStatusAction(id, next);
      router.refresh();
    });

  const remove = () => {
    if (!window.confirm("¿Eliminar esta deuda?")) return;
    startTransition(async () => {
      await deleteDebtAction(id);
      router.push("/deudas");
      router.refresh();
    });
  };

  return (
    <div className="flex flex-wrap gap-2">
      {status === "ACTIVE" && (
        <Button type="button" variant="outline" size="sm" disabled={isPending} onClick={() => change("PAUSED")}>Pausar</Button>
      )}
      {(status === "PAUSED" || status === "CANCELLED") && (
        <Button type="button" variant="outline" size="sm" disabled={isPending} onClick={() => change("ACTIVE")}>Reactivar</Button>
      )}
      {(status === "ACTIVE" || status === "PAUSED") && (
        <Button type="button" variant="outline" size="sm" disabled={isPending} onClick={() => change("CANCELLED")}>Cancelar</Button>
      )}
      <Button type="button" variant="ghost" size="sm" disabled={isPending} onClick={remove} className="text-danger">Eliminar</Button>
    </div>
  );
}
