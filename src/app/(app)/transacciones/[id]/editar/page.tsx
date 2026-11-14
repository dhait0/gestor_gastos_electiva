import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { getTransactionByIdAction } from "@/app/actions/transactions";
import { getAccountsAction } from "@/app/actions/accounts";
import { getCategoriesByTypeAction } from "@/app/actions/categories";
import { DeleteTransactionButton, EditTransactionForm } from "@/components/transactions/EditTransactionForm";

export default async function EditarTransaccionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getTransactionByIdAction(id);
  if (!("data" in result) || !result.data) notFound();
  const tx = result.data;

  const header = (
    <>
      <Link href="/transacciones" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        Movimientos
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-foreground font-heading">
        {tx.type === "TRANSFER" ? "Transferencia" : "Editar movimiento"}
      </h1>
    </>
  );

  if (tx.type === "TRANSFER") {
    return (
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-2xl space-y-6">
          <div>{header}</div>
          <section className="rounded-xl border border-border bg-card p-5 space-y-2">
            <p className="font-medium text-foreground">{tx.description}</p>
            <p className="text-sm tabular-nums text-muted-foreground">
              {formatCurrency(Number(tx.amount), tx.currency_code)} · {tx.transaction_date} · {tx.direction === "INFLOW" ? "Entrada" : "Salida"} · {tx.accounts?.name}
            </p>
            <p className="text-sm text-muted-foreground">
              Las transferencias no se editan para mantener tu patrimonio cuadrado. Si hubo un error, elimínala (se eliminan ambas partes) y créala de nuevo.
            </p>
          </section>
          <DeleteTransactionButton id={tx.id} isTransfer />
        </div>
      </main>
    );
  }

  const [accountsResult, categoriesResult] = await Promise.all([
    getAccountsAction({ includeArchived: true }),
    getCategoriesByTypeAction(tx.type),
  ]);
  const accounts = "data" in accountsResult && accountsResult.data ? accountsResult.data : [];
  const categories = "data" in categoriesResult && categoriesResult.data ? categoriesResult.data : [];

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>{header}</div>
        <EditTransactionForm
          tx={{
            id: tx.id,
            type: tx.type,
            amount: String(tx.amount),
            description: tx.description,
            transaction_date: tx.transaction_date,
            notes: tx.notes,
            account_id: tx.account_id,
            category_id: tx.category_id,
            currency_code: tx.currency_code,
          }}
          accounts={accounts}
          categories={categories}
        />
      </div>
    </main>
  );
}
