import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { getDebtDetailAction } from "@/app/actions/debts";
import { simulatePayoff } from "@/domain/debts";
import { GoalProgressBar } from "@/components/goals/GoalProgressBar";
import { DebtStatusControls, PaymentForm, VoidPaymentButton } from "@/components/debts/DebtControls";

const STATUS_LABEL = { ACTIVE: "Activa", PAID: "Pagada", PAUSED: "En pausa", CANCELLED: "Cancelada" } as const;

export default async function DeudaDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getDebtDetailAction(id);
  if ("error" in result) notFound();

  const { debt, payments } = result.data;
  const money = (v: string | number) => formatCurrency(Number(v), debt.currency_code);
  const payoff =
    debt.status === "ACTIVE" && Number(debt.minimum_payment) > 0
      ? simulatePayoff(debt.current_balance, debt.interest_rate_percent, debt.minimum_payment)
      : null;
  const canPay = debt.status === "ACTIVE" || debt.status === "PAUSED";

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <Link href="/deudas" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" />
          Deudas
        </Link>

        <header className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground font-heading">{debt.name}</h1>
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{STATUS_LABEL[debt.status]}</span>
          </div>
          <Link
            href={`/deudas/${id}/editar`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-muted text-foreground"
          >
            <Pencil className="w-3.5 h-3.5" />
            Editar
          </Link>
        </header>

        <section aria-label="Saldo" className="rounded-xl border border-border bg-card p-5 space-y-3">
          <GoalProgressBar percent={debt.paidPercent} label={`${debt.name}: ${debt.paidPercent}% pagado`} />
          <p className="text-lg font-semibold tabular-nums text-foreground">
            Debes {money(debt.current_balance)}{" "}
            <span className="text-muted-foreground font-normal">de {money(debt.original_amount)} · {debt.paidPercent}% pagado</span>
          </p>
          {debt.status === "PAID" && <p className="text-sm text-success">¡Deuda liquidada! 🎉</p>}
          {Number(debt.interest_rate_percent) > 0 && (
            <p className="text-sm text-muted-foreground">Tasa: {debt.interest_rate_percent}% anual</p>
          )}
          {payoff && (
            <p className="text-sm text-muted-foreground">
              Pagando {money(debt.minimum_payment)} al mes terminarías en {payoff.months} {payoff.months === 1 ? "mes" : "meses"}
              {Number(payoff.totalInterest) > 0 ? ` y pagarías ${money(payoff.totalInterest.toDecimalPlaces(2).toString())} de intereses` : ""}.
            </p>
          )}
          {debt.status === "ACTIVE" && Number(debt.minimum_payment) > 0 && payoff === null && (
            <p className="text-sm text-warning">Con el pago mínimo actual no alcanzas a cubrir los intereses.</p>
          )}
        </section>

        <section aria-labelledby="pay-heading" className="rounded-xl border border-border bg-card p-5 space-y-3">
          <h2 id="pay-heading" className="text-lg font-semibold text-foreground">Nuevo abono</h2>
          <p className="text-xs text-muted-foreground">Solo el capital reduce lo que debes; el interés no descuenta del saldo.</p>
          <PaymentForm debtId={debt.id} disabled={!canPay} />
        </section>

        <section aria-labelledby="history-heading" className="space-y-3">
          <h2 id="history-heading" className="text-lg font-semibold text-foreground">Abonos</h2>
          {payments.length === 0 ? (
            <p className="text-sm text-muted-foreground">Todavía no hay abonos.</p>
          ) : (
            <ul className="divide-y divide-border rounded-xl border border-border bg-card" role="list">
              {payments.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div>
                    <p className="font-medium tabular-nums text-foreground">{money(p.amount)}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.payment_date} · capital {money(p.principal_amount)}
                      {Number(p.interest_amount) > 0 ? ` · interés ${money(p.interest_amount)}` : ""}
                      {p.notes ? ` · ${p.notes}` : ""}
                    </p>
                  </div>
                  <VoidPaymentButton paymentId={p.id} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <DebtStatusControls id={debt.id} status={debt.status} />
      </div>
    </main>
  );
}
