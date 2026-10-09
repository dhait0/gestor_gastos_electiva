import { Suspense } from "react";
import { cn, formatCurrency } from "@/lib/utils";
import { Search, Filter, ArrowUpRight, RotateCcw, AlertCircle } from "lucide-react";
import { getTransactionsAction } from "@/app/actions/transactions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format, subDays } from "date-fns";
import { es } from "date-fns/locale";

async function TransactionsList({
  initialType,
}: {
  initialType?: "INCOME" | "EXPENSE" | "TRANSFER";
}) {
  const { data: transactions, count, error } = await getTransactionsAction({
    type: initialType,
    limit: 50,
  });

  if (error) {
    return (
      <div className="rounded-xl border border-border bg-card p-12 text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-destructive" />
        </div>
        <h3 className="text-lg font-medium text-foreground">Error al cargar los movimientos</h3>
        <p className="mt-1 text-sm text-muted-foreground max-w-xs mx-auto">{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4 gap-2">
          <RotateCcw className="w-4 h-4" />
          Reintentar
        </Button>
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-12 text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
          <Search className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground">Aún no tienes movimientos</h3>
        <p className="mt-1 text-sm text-muted-foreground max-w-xs mx-auto">
          Registra tu primer ingreso o gasto para comenzar a ver tu historial.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <a
            href="/transacciones/nuevo?type=expense"
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2",
              "bg-primary text-primary-foreground",
              "rounded-lg font-medium text-sm",
              "hover:shadow-finn-elevated hover:-translate-y-0.5",
              "transition-all duration-150"
            )}
          >
            Registrar gasto
          </a>
          <a
            href="/transacciones/nuevo?type=income"
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2",
              "border border-border bg-card text-foreground",
              "rounded-lg font-medium text-sm",
              "hover:bg-muted/50",
              "transition-colors"
            )}
          >
            Registrar ingreso
          </a>
        </div>
      </div>
    );
  }

  const groupedTransactions = transactions.reduce(
    (acc, tx) => {
      const dateKey = tx.transaction_date;
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(tx);
      return acc;
    },
    {} as Record<string, typeof transactions>
  );

  const sortedDates = Object.keys(groupedTransactions).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <ScrollArea className="h-[600px] lg:h-auto max-h-[600px]">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <TableRow>
                <TableHead className="text-left">Fecha</TableHead>
                <TableHead className="text-left">Descripción</TableHead>
                <TableHead className="text-left hidden md:table-cell">Categoría</TableHead>
                <TableHead className="text-left hidden lg:table-cell">Cuenta</TableHead>
                <TableHead className="text-left hidden md:table-cell">Tipo</TableHead>
                <TableHead className="text-right">Monto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedDates.map((dateKey) => {
                const dayTransactions = groupedTransactions[dateKey];
                const dateObj = new Date(dateKey + "T00:00:00");
                const today = new Date();
                const isToday = dateKey === format(today, "yyyy-MM-dd");
                const isYesterday = dateKey === format(subDays(today, 1), "yyyy-MM-dd");

                return (
                  <tbody key={dateKey} className="divide-y divide-border/50">
                    <TableRow className="bg-muted/30">
                      <TableCell colSpan={6} className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {isToday ? "Hoy" : isYesterday ? "Ayer" : format(dateObj, "d 'de' MMMM 'de' yyyy", { locale: es })}
                      </TableCell>
                    </TableRow>
                    {dayTransactions.map((transaction) => (
                      <TableRow key={transaction.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="text-sm text-muted-foreground hidden sm:table-cell">
                          {format(new Date(transaction.transaction_date + "T00:00:00"), "HH:mm", { locale: es })}
                        </TableCell>
                        <TableCell className="text-left">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "p-2 rounded-lg",
                              transaction.type === "INCOME" ? "bg-success/10 text-success" :
                              transaction.type === "EXPENSE" ? "bg-danger/10 text-danger" :
                              "bg-primary/10 text-primary"
                            )}>
                              {transaction.categories && (
                                <span className="text-lg" aria-hidden="true">
                                  {transaction.categories.icon || "💰"}
                                </span>
                              )}
                              {!transaction.categories && (
                                <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground truncate">
                                {transaction.description}
                              </p>
                              <p className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
                                {transaction.categories && <span>{transaction.categories.name}</span>}
                                {transaction.accounts && (
                                  <>
                                    {transaction.categories && <span>·</span>}
                                    <span>{transaction.accounts.name}</span>
                                  </>
                                )}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                          {transaction.categories?.name || "—"}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                          {transaction.accounts?.name || "—"}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <span className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                            transaction.type === "INCOME" && "bg-success/10 text-success",
                            transaction.type === "EXPENSE" && "bg-danger/10 text-danger",
                            transaction.type === "TRANSFER" && "bg-primary/10 text-primary"
                          )}>
                            {transaction.type === "INCOME" && "Ingreso"}
                            {transaction.type === "EXPENSE" && "Gasto"}
                            {transaction.type === "TRANSFER" && "Transferencia"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-semibold tabular-nums">
                          <p className={cn(
                            transaction.type === "INCOME" ? "text-success" :
                            transaction.type === "EXPENSE" ? "text-danger" :
                            "text-primary"
                          )}>
                            {transaction.type === "INCOME" ? "+" : transaction.type === "EXPENSE" ? "-" : ""}
                            {formatCurrency(Number(transaction.amount), transaction.currency_code)}
                          </p>
                          {transaction.type === "TRANSFER" && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {transaction.direction === "INFLOW" ? "Entrada" : "Salida"}
                            </p>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </tbody>
                );
              })}
            </TableBody>
          </Table>
        </ScrollArea>
        {count && count > 50 && (
          <div className="border-t border-border p-4 text-center text-sm text-muted-foreground">
            Mostrando 50 de {count} movimientos. Filtros avanzados próximamente.
          </div>
        )}
      </div>
    </div>
  );
}

export default async function TransaccionesPage() {
  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-heading">
              Movimientos
            </h1>
            <p className="text-muted-foreground mt-1">
              Historial de tus transacciones
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/transacciones/nuevo?type=expense"
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2",
                "bg-primary text-primary-foreground",
                "rounded-lg font-medium text-sm",
                "hover:shadow-finn-elevated hover:-translate-y-0.5",
                "transition-all duration-150"
              )}
            >
              Registrar gasto
            </a>
          </div>
        </header>

        <div className="rounded-xl border border-border bg-card p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <Tabs defaultValue="all" className="w-full sm:w-auto">
              <TabsList className="grid w-full sm:w-auto grid-cols-3 bg-muted p-1">
                <TabsTrigger value="all" className="data-[state=active]:bg-background data-[state=active]:shadow-finn-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
                  Todos
                </TabsTrigger>
                <TabsTrigger value="EXPENSE" className="data-[state=active]:bg-background data-[state=active]:shadow-finn-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
                  Gastos
                </TabsTrigger>
                <TabsTrigger value="INCOME" className="data-[state=active]:bg-background data-[state=active]:shadow-finn-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
                  Ingresos
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
                <Input
                  type="search"
                  placeholder="Buscar movimientos..."
                  className="pl-10 pr-4 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  aria-label="Buscar movimientos"
                />
              </div>
              <Button variant="outline" size="icon" className="hidden sm:flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <Suspense fallback={
            <div className="rounded-xl border border-border bg-card p-8 text-center">
              <div className="animate-pulse flex justify-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
              </div>
              <p className="mt-4 text-sm text-muted-foreground">Cargando movimientos...</p>
            </div>
          }>
            <Tabs defaultValue="all">
              <TabsContent value="all">
                <TransactionsList />
              </TabsContent>
              <TabsContent value="EXPENSE">
                <TransactionsList initialType="EXPENSE" />
              </TabsContent>
              <TabsContent value="INCOME">
                <TransactionsList initialType="INCOME" />
              </TabsContent>
            </Tabs>
          </Suspense>
        </div>
      </div>
    </main>
  );
}