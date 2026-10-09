"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, TrendingUp, CreditCard, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { createTransactionAction } from "@/app/actions/transactions";
import { getAccountsAction } from "@/app/actions/accounts";
import { getCategoriesByTypeAction } from "@/app/actions/categories";
import { useActionState } from "react";

type TransactionType = "income" | "expense";

const initialState = { error: undefined, data: undefined };

function NewTransactionForm({ type }: { type: TransactionType }) {
  const router = useRouter();
  const [accounts, setAccounts] = useState<Array<{ id: string; name: string; type: string; currency_code: string }>>([]);
  const [categories, setCategories] = useState<Array<{ id: string; name: string; color: string | null }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formState, formAction, isPending] = useActionState(createTransactionAction, initialState);

  useEffect(() => {
    async function loadData() {
      const [accountsRes, categoriesRes] = await Promise.all([
        getAccountsAction(),
        getCategoriesByTypeAction(type.toUpperCase() as "INCOME" | "EXPENSE"),
      ]);

      if (accountsRes.data) {
        setAccounts(accountsRes.data);
      }
      if (categoriesRes.data) {
        setCategories(categoriesRes.data);
      }
      setIsLoading(false);
    }
    loadData();
  }, [type]);

  const getFieldError = (field: string) => {
    if ("error" in formState && formState.error && typeof formState.error === "object" && !("message" in formState.error)) {
      return formState.error[field]?.[0];
    }
    return undefined;
  };

  const getGeneralError = () => {
    if ("error" in formState && formState.error && typeof formState.error === "string") {
      return formState.error;
    }
    return undefined;
  };

  const handleSuccess = () => {
    if ("data" in formState && formState.data) {
      router.push("/dashboard");
      router.refresh();
    }
  };

  if ("data" in formState && formState.data) {
    handleSuccess();
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const isIncome = type === "income";
  const typeLabel = isIncome ? "Ingreso" : "Gasto";
  const TypeIcon = isIncome ? TrendingUp : CreditCard;
  const typeColor = isIncome ? "text-success" : "text-danger";
  const typeBgColor = isIncome ? "bg-success/10" : "bg-danger/10";
  const direction = isIncome ? "INFLOW" : "OUTFLOW";
  const transactionType = isIncome ? "INCOME" : "EXPENSE";

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="type" value={transactionType} />
      <input type="hidden" name="direction" value={direction} />
      <input type="hidden" name="currency_code" value="COP" />

      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard" className="p-2 hover:bg-muted rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground font-heading">Registrar {typeLabel.toLowerCase()}</h1>
          <p className="text-sm text-muted-foreground">{isIncome ? "Añade un nuevo ingreso" : "Añade un nuevo gasto"}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TypeIcon className={`w-5 h-5 ${typeColor}`} aria-hidden="true" />
            Información del {typeLabel.toLowerCase()}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="amount">Monto *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                required
                disabled={isPending}
                className="pl-7 text-2xl font-medium tabular-nums"
                aria-describedby={getFieldError("amount") ? "amount-error" : undefined}
              />
            </div>
            {getFieldError("amount") && (
              <p id="amount-error" className="mt-1 text-sm text-destructive" role="alert">
                {getFieldError("amount")}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="account_id">Cuenta *</Label>
            <Select
              name="account_id"
              required
              disabled={isPending}
              aria-describedby={getFieldError("account_id") ? "account_id-error" : undefined}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una cuenta" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    <div className="flex items-center gap-3 py-1">
                      <Wallet className="w-4 h-4 text-muted-foreground" />
                      <div className="flex-1 text-left">
                        <p className="font-medium">{account.name}</p>
                        <p className="text-xs text-muted-foreground">{account.type} • {account.currency_code}</p>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {getFieldError("account_id") && (
              <p id="account_id-error" className="mt-1 text-sm text-destructive" role="alert">
                {getFieldError("account_id")}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="category_id">Categoría *</Label>
            <Select
              name="category_id"
              required
              disabled={isPending}
              aria-describedby={getFieldError("category_id") ? "category_id-error" : undefined}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-3 py-1">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color || "#2563EB" }}
                      />
                      <span>{category.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {getFieldError("category_id") && (
              <p id="category_id-error" className="mt-1 text-sm text-destructive" role="alert">
                {getFieldError("category_id")}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="transaction_date">Fecha *</Label>
            <Input
              id="transaction_date"
              name="transaction_date"
              type="date"
              required
              disabled={isPending}
              defaultValue={new Date().toISOString().split("T")[0]}
              className="pl-10"
              aria-describedby={getFieldError("transaction_date") ? "transaction_date-error" : undefined}
            />
            {getFieldError("transaction_date") && (
              <p id="transaction_date-error" className="mt-1 text-sm text-destructive" role="alert">
                {getFieldError("transaction_date")}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Descripción *</Label>
            <Input
              id="description"
              name="description"
              placeholder={isIncome ? "Ej: Salario, Venta, Reembolso" : "Ej: Supermercado, Transporte, Suscripción"}
              required
              disabled={isPending}
              aria-describedby={getFieldError("description") ? "description-error" : undefined}
            />
            {getFieldError("description") && (
              <p id="description-error" className="mt-1 text-sm text-destructive" role="alert">
                {getFieldError("description")}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Detalles adicionales..."
              disabled={isPending}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {getGeneralError() && (
        <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-destructive text-sm" role="alert">
          {getGeneralError()}
        </div>
      )}

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
        <Link href="/dashboard">
          <Button type="button" variant="outline" disabled={isPending}>
            Cancelar
          </Button>
        </Link>
        <Button type="submit" disabled={isPending} className={typeBgColor + " hover:opacity-90"}>
          {isPending ? "Guardando..." : `Guardar ${typeLabel.toLowerCase()}`}
        </Button>
      </div>
    </form>
  );
}

export default function NuevaTransaccionPage() {
  const searchParams = useSearchParams();
  const type = (searchParams.get("type") as TransactionType) || "expense";

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-2xl">
        <NewTransactionForm type={type} />
      </div>
    </main>
  );
}