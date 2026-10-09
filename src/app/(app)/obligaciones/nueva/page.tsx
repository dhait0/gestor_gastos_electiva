"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, AlertCircle, CreditCard, Repeat, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { createObligationAction } from "@/app/actions/obligations";
import { useActionState } from "react";

const sourceOptions = [
  { value: "MANUAL", label: "Manual", icon: MoreHorizontal, description: "Obligación creada manualmente" },
  { value: "SUBSCRIPTION", label: "Suscripción", icon: CreditCard, description: "Pago recurrente automático" },
  { value: "RECURRING", label: "Recurrente", icon: Repeat, description: "Pago periódico programado" },
  { value: "OTHER", label: "Otro", icon: AlertCircle, description: "Otro tipo de obligación" },
];

const currencyOptions = [
  { value: "COP", label: "COP - Peso colombiano" },
  { value: "USD", label: "USD - Dólar estadounidense" },
  { value: "EUR", label: "EUR - Euro" },
];

const initialState = { error: undefined, data: undefined };

function NewObligationForm() {
  const router = useRouter();
  const [formState, formAction, isPending] = useActionState(createObligationAction, initialState);

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
      router.push("/obligaciones");
      router.refresh();
    }
  };

  if ("data" in formState && formState.data) {
    handleSuccess();
  }

  return (
    <form action={formAction} className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/obligaciones" className="p-2 hover:bg-muted rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground font-heading">Nueva obligación</h1>
          <p className="text-sm text-muted-foreground">Registra un compromiso de pago futuro</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-warning" />
            Información de la obligación
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              name="name"
              placeholder="Ej: Alquiler, Tarjeta de crédito, Préstamo"
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            <div>
              <Label htmlFor="due_date">Fecha de vencimiento *</Label>
              <Input
                id="due_date"
                name="due_date"
                type="date"
                required
                disabled={isPending}
                defaultValue={new Date().toISOString().split("T")[0]}
                aria-describedby={getFieldError("due_date") ? "due_date-error" : undefined}
              />
              {getFieldError("due_date") && (
                <p id="due_date-error" className="mt-1 text-sm text-destructive" role="alert">
                  {getFieldError("due_date")}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="source">Origen</Label>
            <Select
              name="source"
              disabled={isPending}
              defaultValue="MANUAL"
              aria-describedby={getFieldError("source") ? "source-error" : undefined}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el origen" />
              </SelectTrigger>
              <SelectContent>
                {sourceOptions.map((source) => (
                  <SelectItem key={source.value} value={source.value}>
                    <div className="flex items-center gap-3 py-1">
                      <source.icon className="w-4 h-4 text-muted-foreground" />
                      <div className="flex-1 text-left">
                        <p className="font-medium">{source.label}</p>
                        <p className="text-xs text-muted-foreground">{source.description}</p>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {getFieldError("source") && (
              <p id="source-error" className="mt-1 text-sm text-destructive" role="alert">
                {getFieldError("source")}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Descripción (opcional)</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Detalles adicionales, notas, referencia..."
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
        <Link href="/obligaciones">
          <Button type="button" variant="outline" disabled={isPending}>
            Cancelar
          </Button>
        </Link>
        <Button type="submit" disabled={isPending} className="bg-warning/10 hover:bg-warning/20 text-warning hover:text-warning-foreground border-warning/30">
          {isPending ? "Guardando..." : "Crear obligación"}
        </Button>
      </div>
    </form>
  );
}

export default function NuevaObligacionPage() {
  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-2xl">
        <NewObligationForm />
      </div>
    </main>
  );
}