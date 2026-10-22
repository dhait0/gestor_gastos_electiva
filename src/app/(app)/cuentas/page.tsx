import { cn } from "@/lib/utils";
import { Plus, CreditCard, Wallet, Landmark, PiggyBank, Smartphone, MoreHorizontal, Edit, Archive, RotateCcw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { getAccountsWithBalancesAction } from "@/app/actions/accounts";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { archiveAccountAction } from "@/app/actions/accounts";
import type { Decimal } from "decimal.js";

interface Account {
  id: string;
  name: string;
  type: string;
  opening_balance: number;
  current_balance: Decimal;
  currency_code: string;
  color: string | null;
  icon: string | null;
  credit_limit: number | null;
  payment_due_day: number | null;
  statement_closing_day: number | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
  deleted_at: string | null;
}

const accountTypeIcons: Record<string, React.ElementType> = {
  CASH: Wallet,
  CHECKING: Landmark,
  SAVINGS: PiggyBank,
  CREDIT_CARD: CreditCard,
  DIGITAL_WALLET: Smartphone,
  OTHER: MoreHorizontal,
};

const accountTypeLabels: Record<string, string> = {
  CASH: "Efectivo",
  CHECKING: "Corriente",
  SAVINGS: "Ahorros",
  CREDIT_CARD: "Tarjeta de crédito",
  DIGITAL_WALLET: "Billetera digital",
  OTHER: "Otra",
};

export default async function CuentasPage() {
  const result = await getAccountsWithBalancesAction();

  if ("error" in result) {
    return (
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <Card className="border-destructive/50 bg-destructive/10">
            <CardContent className="py-12 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
              <h3 className="text-lg font-medium text-foreground">Error al cargar las cuentas</h3>
              <p className="mt-1 text-sm text-muted-foreground max-w-xs mx-auto">{result.error}</p>
              <Button onClick={() => window.location.reload()} className="mt-4 gap-2">
                <RotateCcw className="w-4 h-4" />
                Reintentar
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  const accountList = result.data ?? [];
  const activeAccounts = accountList.filter((a) => !a.is_archived);
  const archivedAccounts = accountList.filter((a) => a.is_archived);

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-heading">
              Cuentas
            </h1>
            <p className="text-muted-foreground mt-1">
              Gestiona tus cuentas financieras
            </p>
          </div>
          <Link href="/cuentas/nueva">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nueva cuenta
            </Button>
          </Link>
        </header>

        {activeAccounts.length === 0 && archivedAccounts.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <Wallet className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground">Aún no tienes cuentas</h3>
            <p className="mt-1 text-sm text-muted-foreground max-w-xs mx-auto">
              Crea tu primera cuenta para empezar a registrar tus movimientos.
            </p>
            <Link href="/cuentas/nueva" className="mt-6 inline-block">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Crear primera cuenta
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {activeAccounts.length > 0 && (
              <section aria-labelledby="active-accounts-heading" className="space-y-4">
                <h2 id="active-accounts-heading" className="text-lg font-semibold text-foreground">
                  Activas ({activeAccounts.length})
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {activeAccounts.map((account) => (
                    <AccountCard key={account.id} account={account} />
                  ))}
                </div>
              </section>
            )}

            {archivedAccounts.length > 0 && (
              <section aria-labelledby="archived-accounts-heading" className="space-y-4 pt-4 border-t border-border">
                <h2 id="archived-accounts-heading" className="text-lg font-semibold text-muted-foreground">
                  Archivadas ({archivedAccounts.length})
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols=3">
                  {archivedAccounts.map((account) => (
                    <AccountCard key={account.id} account={account} isArchived />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}

function AccountCard({ account, isArchived = false }: { account: Account; isArchived?: boolean }) {
  const Icon = accountTypeIcons[account.type] || MoreHorizontal;

  return (
    <Card className={cn("relative overflow-hidden", isArchived && "opacity-60")}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("p-3 rounded-xl", account.color ? `bg-[${account.color}]/10` : "bg-primary/10")}>
              <Icon className={cn("w-5 h-5", account.color ? `text-[${account.color}]` : "text-primary")} />
            </div>
            <div>
              <CardTitle className="text-base font-medium truncate">{account.name}</CardTitle>
              <span className="text-xs text-muted-foreground">{accountTypeLabels[account.type]}</span>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <Link href={`/cuentas/${account.id}/editar`} className="block">
                <DropdownMenuItem className="flex items-center gap-2 px-2 py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
                  <Edit className="w-4 h-4" />
                  Editar
                </DropdownMenuItem>
              </Link>
              {isArchived ? null : (
                <DropdownMenuItem
                  className="flex items-center gap-2 px-2 py-1.5 text-destructive focus:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2"
                  onClick={() => archiveAccount(account.id)}
                >
                  <Archive className="w-4 h-4" />
                  Archivar
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-right">
            <p className="text-2xl font-bold text-foreground tabular-nums">
              {formatCurrency(account.current_balance.toNumber(), account.currency_code)}
            </p>
            <p className="text-xs text-muted-foreground">Saldo actual</p>
          </div>
        </div>
        {account.opening_balance !== 0 && (
          <div className="mt-3 pt-3 border-t border-border flex items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">Saldo inicial</p>
            <p className="text-sm font-medium text-muted-foreground tabular-nums">
              {formatCurrency(account.opening_balance, account.currency_code)}
            </p>
          </div>
        )}
        {account.type === "CREDIT_CARD" && account.credit_limit && (
          <div className="mt-3 pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground">Límite de crédito</p>
            <p className="text-sm font-medium text-foreground tabular-nums">
              {formatCurrency(account.credit_limit, account.currency_code)}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

async function archiveAccount(accountId: string) {
  const result = await archiveAccountAction(accountId);
  if (result.error) {
    console.error("Error archiving account:", result.error);
  } else {
    window.location.reload();
  }
}

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}