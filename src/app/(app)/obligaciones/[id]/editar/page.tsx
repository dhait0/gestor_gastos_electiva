"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, AlertCircle, CreditCard, Repeat, MoreHorizontal, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { getObligationByIdAction, updateObligationAction, markObligationPaidAction, archiveObligationAction } from "@/app/actions/obligations";
import { useActionState } from "react";

const sourceOptions = [
  { value: "MANUAL", label: "Manual", icon: MoreHorizontal },
  { value: "SUBSCRIPTION", label: "Suscripción", icon: CreditCard },
  { value: "RECURRING", label: "Recurrente", icon: Repeat },
  { value: "OTHER", label: "Otro", icon: AlertCircle },
];

const currencyOptions = [
  { value: "COP", label: "COP - Peso colombiano" },
  { value: "USD", label: "USD - Dólar estadounidense" },
  { value: "EUR", label: "EUR - Euro" },
];

const statusOptions = [
  { value: "PENDING", label: "Pendiente" },
  { value: "PAID", label: "Pagada" },
  { value: "CANCELLED", label: "Cancelada" },
];

const initialState = { error: undefined, data: undefined };

type Obligation = {
  id: string;
  name: string;
  amount: number;
  currency_code: string;
  due_date: string;
  description: string | null;
  status: "PENDING" | "PAID" | "CANCELLED";
  source: "MANUAL" | "SUBSCRIPTION" | "RECURRING" | "OTHER";
  created_at: string;
};

function EditObligationForm({ obligationId }: { obligationId: string }) {
  const router = useRouter();
  const [obligation, setObligation] = useState<Obligation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingAction, setPendingAction] = useState<"markPaid" | "archive" | null>(null);
  const [formState, formAction, isPending] = useActionState(updateObligationAction, initialState);

  useEffect(() => {
    async function loadObligation() {
      const res = await getObligationByIdAction(obligationId);
      if (res.data) {
        setObligation(res.data);
      }
      setIsLoading(false);
    }
    loadObligation();
  }, [obligationId]);

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

  const handleMarkPaid = async () => {
    if (!obligation) return;
    setPendingAction("markPaid");
    setIsSubmitting(true);
    const result = await markObligationPaidAction(obligation.id);
    setPendingAction(null);
    setIsSubmitting(false);
    if ("success" in result && result.success) {
      router.push("/obligaciones");
      router.refresh();
    }
  };

  const handleArchive = async () => {
    if (!obligation) return;
    if (!confirm("¿Cancelar esta obligación? Esta acción no se puede deshacer.")) return;
    setPendingAction("archive");
    setIsSubmitting(true);
    const result = await archiveObligationAction(obligation.id);
    setPendingAction(null);
    setIsSubmitting(false);
    if ("success" in result && result.success) {
      router.push("/obligaciones");
      router.refresh();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!obligation) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto w-12 h-12 text-destructive mb-4" />
        <h3 className="text-lg font-medium text-foreground">Obligación no encontrada</h3>
        <Link href="/obligaciones" className="mt-4 inline-block">
          <Button variant="outline">Volver a obligaciones</Button>
        </Link>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge className="bg-warning/10 text-warning border-warning/20" variant="outline">Pendiente</Badge>;
      case "PAID":
        return <Badge className="bg-success/10 text-success border-success/20" variant="outline">Pagada</Badge>;
      case "CANCELLED":
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20" variant="outline">Cancelada</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/obligaciones" className="p-2 hover:bg-muted rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground font-heading">Editar obligación</h1>
          <p className="text-sm text-muted-foreground">Modifica los detalles de tu compromiso</p>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(obligation.status)}
        </div>
      </div>

      <form action={formAction} id="edit-form" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-warning" />
              Información de la obligación
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <input type="hidden" name="id" value={obligation.id} />

            <div>
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                name="name"
                defaultValue={obligation.name}
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
                  defaultValue={obligation.amount.toString()}
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
                  defaultValue={obligation.currency_code}
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
                  defaultValue={obligation.due_date}
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
                defaultValue={obligation.source}
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
                        <span>{source.label}</span>
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
              <Label htmlFor="status">Estado</Label>
              <Select
                name="status"
                disabled={isPending}
                defaultValue={obligation.status}
                aria-describedby={getFieldError("status") ? "status-error" : undefined}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el estado" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {getFieldError("status") && (
                <p id="status-error" className="mt-1 text-sm text-destructive" role="alert">
                  {getFieldError("status")}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Descripción (opcional)</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={obligation.description || ""}
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
            <Button type="button" variant="outline" disabled={isPending || isSubmitting}>
              Cancelar
            </Button>
          </Link>
          {obligation.status === "PENDING" && (
            <Button
              type="button"
              onClick={handleMarkPaid}
              disabled={isSubmitting}
              className="bg-success/10 hover:bg-success/20 text-success hover:text-success-foreground border-success/30"
            >
              {pendingAction === "markPaid" ? "Marcando..." : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Marcar como pagada
                </>
              )}
            </Button>
          )}
          <Button
            type="button"
            onClick={handleArchive}
            disabled={isSubmitting}
            variant="destructive"
            className="bg-destructive/10 hover:bg-destructive/20 border-destructive/30"
          >
            {pendingAction === "archive" ? "Cancelando..." : "Cancelar obligación"}
          </Button>
          <Button type="submit" disabled={isPending || isSubmitting} className="bg-primary hover:bg-primary/90">
            {isPending ? "Guardando..." : "Guardar cambios"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function EditarObligacionPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState("");

  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-2xl">
        {id && <EditObligationForm obligationId={id} />}
      </div>
    </main>
  );
}