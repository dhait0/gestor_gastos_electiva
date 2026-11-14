import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getBudgetCopyPreviewAction } from "@/app/actions/budgets";
import { CopyBudgetsForm } from "@/components/budgets/CopyBudgetsForm";

const MONTH_NAMES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const label = (m: string) => `${MONTH_NAMES[Number(m.slice(5, 7)) - 1]} ${m.slice(0, 4)}`;

export default async function CopiarPresupuestosPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string | string[] }>;
}) {
  const raw = (await searchParams).month;
  const month = Array.isArray(raw) ? raw[0] : raw;
  const result = month ? await getBudgetCopyPreviewAction(month) : { error: "Falta el mes" };

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <Link href={month ? `/presupuestos?month=${month}` : "/presupuestos"} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Presupuestos
        </Link>

        {"error" in result || !month ? (
          <p className="text-destructive" role="alert">{"error" in result ? result.error : "Falta el mes"}</p>
        ) : (
          <>
            <header>
              <h1 className="text-2xl font-bold text-foreground font-heading capitalize">Copiar a {label(month)}</h1>
              <p className="mt-1 text-muted-foreground">
                Presupuestos de {label(result.data.source)}. Elige cuáles copiar; los que ya existen no se duplican.
              </p>
            </header>
            {result.data.candidates.length === 0 ? (
              <p className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
                No hay presupuestos en {label(result.data.source)} para copiar.
              </p>
            ) : (
              <CopyBudgetsForm month={month} candidates={result.data.candidates} />
            )}
          </>
        )}
      </div>
    </main>
  );
}
