import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getBudgetAction } from "@/app/actions/budgets";
import { EditBudgetForm } from "@/components/budgets/EditBudgetForm";

export default async function EditarPresupuestoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getBudgetAction(id);
  if ("error" in result) notFound();
  const budget = result.data;
  const month = budget.period_month.slice(0, 7);

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <Link href={`/presupuestos?month=${month}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Presupuestos
        </Link>
        <header>
          <h1 className="text-2xl font-bold text-foreground font-heading">Editar presupuesto</h1>
          <p className="mt-1 text-muted-foreground">
            {budget.category_name} · {month}. La categoría y el mes no cambian: elimina el presupuesto y crea otro si te equivocaste.
          </p>
        </header>
        <EditBudgetForm id={budget.id} limit={budget.limit_amount} month={month} />
      </div>
    </main>
  );
}
