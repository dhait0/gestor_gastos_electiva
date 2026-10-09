"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CreditCard, Wallet, Landmark, PiggyBank, Smartphone, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { createAccountAction } from "@/app/actions/accounts";
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

function NewAccountForm() {
  const router = useRouter();
  const [showCreditFields, setShowCreditFields] = useState(false);
  const [formState, formAction, isPending] = useActionState(createAccountAction, initialState);

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
      router.push("/cuentas");
      router.refresh();
    }
  };

  // Call handleSuccess after render if there's data
  if ("data" in formState && formState.data) {
    handleSuccess();
  }

  return (
    <form action={formAction} className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/cuentas" className="p-2 hover:bg-muted rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground font-heading">Nueva cuenta</h1>
          <p className="text-sm text-muted-foreground">Configura una nueva cuenta financiera</p>
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
              onValueChange={(value) => setShowCreditFields(value === "CREDIT_CARD")}
              aria-describedby={getFieldError("type") ? "type-error" : undefined}
              defaultValue="CASH"
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
              defaultValue="0"
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
              defaultValue="COP"
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
              defaultValue="#2563EB"
              disabled={isPending}
            />
          </div>

          <div>
            <Label htmlFor="icon">Icono (opcional)</Label>
            <Input
              id="icon"
              name="icon"
              placeholder="Ej: wallet, credit-card, banknote"
              disabled={isPending}
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
        <Link href="/cuentas">
          <Button type="button" variant="outline" disabled={isPending}>
            Cancelar
          </Button>
        </Link>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Creando..." : "Crear cuenta"}
        </Button>
      </div>
    </form>
  );
}

export default function NuevaCuentaPage() {
  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-2xl">
        <NewAccountForm />
      </div>
    </main>
  );
}