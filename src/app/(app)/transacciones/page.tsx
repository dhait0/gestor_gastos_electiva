import Link from "next/link";
import { Fragment } from "react";
import { AlertCircle, ArrowLeftRight, ArrowUpRight, Pencil, Search } from "lucide-react";
import { format, parseISO, subDays } from "date-fns";
import { es } from "date-fns/locale";
import { cn, formatCurrency } from "@/lib/utils";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getTransactionsAction } from "@/app/actions/transactions";
import { getAccountsAction } from "@/app/actions/accounts";
import { getCategoriesAction } from "@/app/actions/categories";
import { todayInTimezone } from "@/domain/dates";
import {
  TRANSACTIONS_PAGE_SIZE,
  countActiveFilters,
  getTotalPages,
  parseTransactionFilters,
  type TransactionFilters,
} from "@/domain/transaction-filters";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

function buildQuery(filters: TransactionFilters, overrides: Partial<TransactionFilters> = {}): string {
  const f = { ...filters, ...overrides };
  const params = new URLSearchParams();
  if (f.type) params.set("type", f.type);
  if (f.accountId) params.set("account", f.accountId);
  if (f.categoryId) params.set("category", f.categoryId);
  if (f.from) params.set("from", f.from);
  if (f.to) params.set("to", f.to);
  if (f.search) params.set("q", f.search);
  if (f.page > 1) params.set("page", String(f.page));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

const selectClass =
  "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export default async function TransaccionesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = parseTransactionFilters(await searchParams);
  const activeFilters = countActiveFilters(filters);

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from("profiles").select("timezone").eq("id", user.id).single()
    : { data: null };
  const today = todayInTimezone(profile?.timezone || "America/Bogota");
  const yesterday = format(subDays(parseISO(today), 1), "yyyy-MM-dd");

  const [result, accountsResult, categoriesResult] = await Promise.all([
    getTransactionsAction({
      type: filters.type,
      accountId: filters.accountId,
      categoryId: filters.categoryId,
      startDate: filters.from,
      endDate: filters.to,
      search: filters.search,
      limit: TRANSACTIONS_PAGE_SIZE,
      offset: (filters.page - 1) * TRANSACTIONS_PAGE_SIZE,
    }),
    getAccountsAction({ includeArchived: true }),
    getCategoriesAction(),
  ]);

  const accounts = "data" in accountsResult && accountsResult.data ? accountsResult.data : [];
  const categories = "data" in categoriesResult && categoriesResult.data ? categoriesResult.data : [];
  const transactions = "data" in result && result.data ? result.data : [];
  const count = "count" in result && typeof result.count === "number" ? result.count : transactions.length;
  const totalPages = getTotalPages(count);

  const grouped = transactions.reduce(
    (acc, tx) => {
      (acc[tx.transaction_date] ??= []).push(tx);
      return acc;
    },
    {} as Record<string, typeof transactions>
  );
  const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  const actionLink = "inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors";

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-heading">Movimientos</h1>
            <p className="text-muted-foreground mt-1">Historial de tus transacciones</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/transacciones/transferir" className={cn(actionLink, "border border-border bg-card text-foreground hover:bg-muted/50")}>
              <ArrowLeftRight className="w-4 h-4" aria-hidden="true" />
              Transferir
            </Link>
            <Link href="/transacciones/nuevo?type=income" className={cn(actionLink, "border border-border bg-card text-foreground hover:bg-muted/50")}>
              Registrar ingreso
            </Link>
            <Link href="/transacciones/nuevo?type=expense" className={cn(actionLink, "bg-primary text-primary-foreground hover:shadow-finn-elevated")}>
              Registrar gasto
            </Link>
          </div>
        </header>

        <form method="get" role="search" aria-label="Filtrar movimientos" className="rounded-xl border border-border bg-card p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="lg:col-span-2">
              <label htmlFor="q" className="text-sm font-medium text-foreground">Buscar</label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
                <input id="q" name="q" type="search" defaultValue={filters.search} maxLength={100} placeholder="Descripción del movimiento" className={cn(selectClass, "pl-9")} />
              </div>
            </div>
            <div>
              <label htmlFor="type" className="text-sm font-medium text-foreground">Tipo</label>
              <select id="type" name="type" defaultValue={filters.type ?? ""} className={cn(selectClass, "mt-1")}>
                <option value="">Todos</option>
                <option value="EXPENSE">Gastos</option>
                <option value="INCOME">Ingresos</option>
                <option value="TRANSFER">Transferencias</option>
              </select>
            </div>
            <div>
              <label htmlFor="account" className="text-sm font-medium text-foreground">Cuenta</label>
              <select id="account" name="account" defaultValue={filters.accountId ?? ""} className={cn(selectClass, "mt-1")}>
                <option value="">Todas</option>
                {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="category" className="text-sm font-medium text-foreground">Categoría</label>
              <select id="category" name="category" defaultValue={filters.categoryId ?? ""} className={cn(selectClass, "mt-1")}>
                <option value="">Todas</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="from" className="text-sm font-medium text-foreground">Desde</label>
              <input id="from" name="from" type="date" defaultValue={filters.from} className={cn(selectClass, "mt-1")} />
            </div>
            <div>
              <label htmlFor="to" className="text-sm font-medium text-foreground">Hasta</label>
              <input id="to" name="to" type="date" defaultValue={filters.to} className={cn(selectClass, "mt-1")} />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" className="h-10 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground">Filtrar</button>
            {activeFilters > 0 && (
              <Link href="/transacciones" className="text-sm text-primary hover:underline font-medium">
                Limpiar filtros ({activeFilters})
              </Link>
            )}
          </div>
        </form>

        {"error" in result && result.error ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center" role="alert">
            <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-destructive" aria-hidden="true" />
            </div>
            <h2 className="text-lg font-medium text-foreground">Error al cargar los movimientos</h2>
            <p className="mt-1 text-sm text-muted-foreground">{result.error}</p>
            <Link href={`/transacciones${buildQuery(filters)}`} className="mt-4 inline-block text-sm text-primary hover:underline font-medium">
              Reintentar
            </Link>
          </div>
        ) : transactions.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-muted-foreground" aria-hidden="true" />
            </div>
            {activeFilters > 0 ? (
              <>
                <h2 className="text-lg font-medium text-foreground">Ningún movimiento coincide con tu búsqueda</h2>
                <p className="mt-1 text-sm text-muted-foreground">Prueba con otros filtros.</p>
              </>
            ) : (
              <>
                <h2 className="text-lg font-medium text-foreground">Aún no tienes movimientos</h2>
                <p className="mt-1 text-sm text-muted-foreground max-w-xs mx-auto">
                  Registra tu primer ingreso o gasto para comenzar a entender tus finanzas.
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-left">Descripción</TableHead>
                    <TableHead className="text-left hidden md:table-cell">Categoría</TableHead>
                    <TableHead className="text-left hidden lg:table-cell">Cuenta</TableHead>
                    <TableHead className="text-left hidden md:table-cell">Tipo</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                    <TableHead className="w-12"><span className="sr-only">Acciones</span></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dates.map((dateKey) => (
                    <Fragment key={dateKey}>
                      <TableRow className="bg-muted/30">
                        <TableCell colSpan={6} className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          {dateKey === today ? "Hoy" : dateKey === yesterday ? "Ayer" : format(parseISO(dateKey), "d 'de' MMMM 'de' yyyy", { locale: es })}
                        </TableCell>
                      </TableRow>
                      {grouped[dateKey].map((tx) => (
                        <TableRow key={tx.id} className="hover:bg-muted/30 transition-colors">
                          <TableCell className="text-left">
                            <div className="flex items-center gap-3">
                              <div
                                className={cn(
                                  "p-2 rounded-lg",
                                  tx.type === "INCOME" ? "bg-success/10 text-success" : tx.type === "EXPENSE" ? "bg-danger/10 text-danger" : "bg-primary/10 text-primary"
                                )}
                              >
                                {tx.categories ? (
                                  <span className="text-lg" aria-hidden="true">{tx.categories.icon || "💰"}</span>
                                ) : (
                                  <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-foreground truncate">{tx.description}</p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {[tx.categories?.name, tx.accounts?.name].filter(Boolean).join(" · ")}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{tx.categories?.name || "—"}</TableCell>
                          <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{tx.accounts?.name || "—"}</TableCell>
                          <TableCell className="hidden md:table-cell">
                            <span
                              className={cn(
                                "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                                tx.type === "INCOME" && "bg-success/10 text-success",
                                tx.type === "EXPENSE" && "bg-danger/10 text-danger",
                                tx.type === "TRANSFER" && "bg-primary/10 text-primary"
                              )}
                            >
                              {tx.type === "INCOME" ? "Ingreso" : tx.type === "EXPENSE" ? "Gasto" : "Transferencia"}
                            </span>
                          </TableCell>
                          <TableCell className="text-right font-semibold tabular-nums">
                            <p className={cn(tx.type === "INCOME" ? "text-success" : tx.type === "EXPENSE" ? "text-danger" : "text-primary")}>
                              {tx.type === "INCOME" ? "+" : tx.type === "EXPENSE" ? "-" : ""}
                              {formatCurrency(Number(tx.amount), tx.currency_code)}
                            </p>
                            {tx.type === "TRANSFER" && (
                              <p className="text-xs text-muted-foreground mt-0.5">{tx.direction === "INFLOW" ? "Entrada" : "Salida"}</p>
                            )}
                          </TableCell>
                          <TableCell>
                            <Link
                              href={`/transacciones/${tx.id}/editar`}
                              aria-label={`Ver o editar ${tx.description}`}
                              className="inline-flex p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                            >
                              <Pencil className="w-4 h-4" aria-hidden="true" />
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </Fragment>
                  ))}
                </TableBody>
              </Table>
            </div>

            <nav aria-label="Paginación" className="flex items-center justify-between gap-3 border-t border-border p-4 text-sm text-muted-foreground">
              <span aria-live="polite">
                {count} {count === 1 ? "movimiento" : "movimientos"} · página {filters.page} de {totalPages}
              </span>
              <div className="flex gap-2">
                {filters.page > 1 && (
                  <Link href={`/transacciones${buildQuery(filters, { page: filters.page - 1 })}`} className="rounded-lg border border-border px-3 py-1.5 hover:bg-muted">
                    Anterior
                  </Link>
                )}
                {filters.page < totalPages && (
                  <Link href={`/transacciones${buildQuery(filters, { page: filters.page + 1 })}`} className="rounded-lg border border-border px-3 py-1.5 hover:bg-muted">
                    Siguiente
                  </Link>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </main>
  );
}
