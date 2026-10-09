"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, CreditCard, Wallet, Landmark, PiggyBank, Smartphone, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { updateAccountAction } from "@/app/actions/accounts";
import { useActionState } from "react";

const accountTypes = [
  { value: "CASH", label: "Efectivo", icon: Wallet, description: "Dinero en efectivo" },
  { value: "CHECKING", label: "Cuenta corriente", icon: Landmark, description: "Cuenta bancaria principal" },
  { value: "SAVINGS", label: "Cuenta de ahorros", icon: PiggyBank, description: "Para ahorrar dinero" },
  { value: "CREDIT_CARD", label: "Tarjeta de crédito", icon: CreditCard, description: "Tarjeta de crédito bancaria" },
  { value: "DIGITAL_WALLET", label: "Billetera digital", icon: Smartphone, description: "Nequi, Daviplata, etc." },
  { value: "OTHER", label: "Otra", icon: MoreHorizontal, description: "Otro tipo de cuenta" },
];

const currencyOptions = [
  { value: "COP", label: "COP - Peso colombiano" },
  { value: "USD", label: "USD - Dólar estadounidense" },
  { value: "EUR", label: "EUR - Euro" },
];

type FormState =
  | { error: string }
  | { error: Record<string, string[]> }
  | { data: { id: string } }
  | { error?: undefined; data?: undefined };

const initialState: FormState = { error: undefined, data: undefined };

interface AccountData {
  id: string;
  name: string;
  type: string;
  opening_balance: number;
  currency_code: string;
  color: string | null;
  icon: string | null;
  credit_limit: number | null;
  payment_due_day: number | null;
  statement_closing_day: number | null;
  is_archived: boolean;
}

function EditAccountForm({ initialData }: { initialData: AccountData }) {
  const router = useRouter();
  const params = useParams();
  const accountId = params.id as string;
  const [showCreditFields, setShowCreditFields] = useState(initialData.type === "CREDIT_CARD");
  const [formState, formAction, isPending] = useActionState(updateAccountAction, initialState);

  useEffect(() => {
    if ("data" in formState && formState.data) {
      router.push("/cuentas");
      router.refresh();
    }
  }, [formState, router]);

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

  const handleSubmit = (formData: FormData) => {
    formData.set("id", accountId);
    formAction(formData);
  };

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/cuentas" className="p-2 hover:bg-muted rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground font-heading">Editar cuenta</h1>
          <p className="text-sm text-muted-foreground">Modifica la configuración de tu cuenta</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Información básica</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Nombre de la cuenta *</Label>
            <Input
              id="name"
              name="name"
              placeholder="Ej: Efectivo, Cuenta nómina, Tarjeta Visa"
              required
              disabled={isPending}
              defaultValue={initialData.name}
              aria-describedby={getFieldError("name") ? "name-error" : undefined}
            />
            {getFieldError("name") && (
              <p id="name-error" className="mt-1 text-sm text-destructive" role="alert">
                {getFieldError("name")}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="type">Tipo de cuenta *</Label>
            <Select
              name="type"
              required
              disabled={isPending}
              defaultValue={initialData.type}
              onValueChange={(value) => setShowCreditFields(value === "CREDIT_CARD")}
              aria-describedby={getFieldError("type") ? "type-error" : undefined}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un tipo" />
              </SelectTrigger>
              <SelectContent>
                {accountTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-3 py-1">
                      <type.icon className="w-4 h-4 text-muted-foreground" />
                      <div className="flex-1 text-left">
                        <p className="font-medium">{type.label}</p>
                        <p className="text-xs text-muted-foreground">{type.description}</p>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {getFieldError("type") && (
              <p id="type-error" className="mt-1 text-sm text-destructive" role="alert">
                {getFieldError("type")}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="opening_balance">Saldo inicial</Label>
            <Input
              id="opening_balance"
              name="opening_balance"
              type="number"
              step="0.01"
              min="0"
              placeholder="0"
              defaultValue={initialData.opening_balance.toString()}
              disabled={isPending}
              aria-describedby={getFieldError("opening_balance") ? "opening_balance-error" : undefined}
            />
            {getFieldError("opening_balance") && (
              <p id="opening_balance-error" className="mt-1 text-sm text-destructive" role="alert">
                {getFieldError("opening_balance")}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="currency_code">Moneda *</Label>
            <Select
              name="currency_code"
              required
              disabled={isPending}
              defaultValue={initialData.currency_code}
              aria-describedby={getFieldError("currency_code") ? "currency_code-error" : undefined}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una moneda" />
              </SelectTrigger>
              <SelectContent>
                {currencyOptions.map((currency) => (
                  <SelectItem key={currency.value} value={currency.value}>
                    {currency.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {getFieldError("currency_code") && (
              <p id="currency_code-error" className="mt-1 text-sm text-destructive" role="alert">
                {getFieldError("currency_code")}
              </p>
            )}
          </div>

          {showCreditFields && (
            <div className="space-y-4 pt-4 border-t border-border">
              <p className="text-sm font-medium text-foreground">Configuración de tarjeta de crédito</p>
              <div>
                <Label htmlFor="credit_limit">Límite de crédito</Label>
                <Input
                  id="credit_limit"
                  name="credit_limit"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="Ej: 5000000"
                  defaultValue={initialData.credit_limit?.toString() || ""}
                  disabled={isPending}
                  aria-describedby={getFieldError("credit_limit") ? "credit_limit-error" : undefined}
                />
                {getFieldError("credit_limit") && (
                  <p id="credit_limit-error" className="mt-1 text-sm text-destructive" role="alert">
                    {getFieldError("credit_limit")}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="payment_due_day">Día de pago (1-31)</Label>
                  <Input
                    id="payment_due_day"
                    name="payment_due_day"
                    type="number"
                    min="1"
                    max="31"
                    placeholder="Ej: 15"
                    defaultValue={initialData.payment_due_day?.toString() || ""}
                    disabled={isPending}
                    aria-describedby={getFieldError("payment_due_day") ? "payment_due_day-error" : undefined}
                  />
                  {getFieldError("payment_due_day") && (
                    <p id="payment_due_day-error" className="mt-1 text-sm text-destructive" role="alert">
                      {getFieldError("payment_due_day")}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="statement_closing_day">Día de corte (1-31)</Label>
                  <Input
                    id="statement_closing_day"
                    name="statement_closing_day"
                    type="number"
                    min="1"
                    max="31"
                    placeholder="Ej: 1"
                    defaultValue={initialData.statement_closing_day?.toString() || ""}
                    disabled={isPending}
                    aria-describedby={getFieldError("statement_closing_day") ? "statement_closing_day-error" : undefined}
                  />
                  {getFieldError("statement_closing_day") && (
                    <p id="statement_closing_day-error" className="mt-1 text-sm text-destructive" role="alert">
                      {getFieldError("statement_closing_day")}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-border">
            <Label htmlFor="color">Color (opcional)</Label>
            <Input
              id="color"
              name="color"
              type="color"
              defaultValue={initialData.color || "#2563EB"}
              disabled={isPending}
            />
          </div>

          <div>
            <Label htmlFor="icon">Icono (opcional)</Label>
            <Input
              id="icon"
              name="icon"
              placeholder="Ej: wallet, credit-card, banknote"
              defaultValue={initialData.icon || ""}
              disabled={isPending}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_archived"
              name="is_archived"
              defaultChecked={initialData.is_archived}
              disabled={isPending}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label htmlFor="is_archived" className="text-sm font-normal text-foreground cursor-pointer">
              Archivada
            </Label>
          </div>
        </CardContent>
      </Card>

      {getGeneralError() && (
        <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-destructive text-sm" role="alert">
          {getGeneralError()}
        </div>
      )}

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
        <Link href="/cuentas">
          <Button type="button" variant="outline" disabled={isPending}>
            Cancelar
          </Button>
        </Link>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}

export default async function EditarCuentaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // Call the server action directly
  const { getAccountsAction } = await import("@/app/actions/accounts");
  const { data: accounts } = await getAccountsAction();
  const account = accounts?.find((a) => a.id === id);

  if (!account) {
    return (
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-destructive">Cuenta no encontrada</p>
          <Link href="/cuentas" className="mt-4 inline-block">
            <Button variant="outline">Volver a cuentas</Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-2xl">
        <EditAccountForm initialData={account} />
      </div>
    </main>
  );
}