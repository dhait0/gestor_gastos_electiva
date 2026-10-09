"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Plus, Calendar, AlertCircle, CheckCircle, XCircle, MoreHorizontal, ChevronDown, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { getObligationsAction, markObligationPaidAction, archiveObligationAction } from "@/app/actions/obligations";
import { useToast } from "@/components/ui/toast";

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

type ObligationsFilters = "all" | "PENDING" | "PAID" | "CANCELLED";

function ObligationsList() {
  const [filter, setFilter] = useState<ObligationsFilters>("all");
  const [obligations, setObligations] = useState<Obligation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();

  useEffect(() => {
    let mounted = true;
    (async () => {
      setIsLoading(true);
      setError(null);
      const res = await getObligationsAction(
        filter === "all" ? undefined : { status: filter }
      );
      if (mounted) {
        if (res.error) {
          setError(res.error);
        } else if (res.data) {
          setObligations(res.data);
        }
        setIsLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [filter]);

  const handleMarkPaid = async (obligationId: string) => {
    setPendingActionId(obligationId);
    const result = await markObligationPaidAction(obligationId);
    setPendingActionId(null);
    if ("success" in result && result.success) {
      addToast({
        title: "Obligación pagada",
        description: "La obligación se ha marcado como pagada correctamente.",
        type: "success",
      });
      const res = await getObligationsAction(
        filter === "all" ? undefined : { status: filter }
      );
      if (res.data) {
        setObligations(res.data);
      }
    } else {
      addToast({
        title: "Error",
        description: result.error || "No se pudo marcar la obligación como pagada.",
        type: "error",
      });
    }
  };

  const handleArchive = async (obligationId: string) => {
    if (confirm("¿Cancelar esta obligación? Esta acción no se puede deshacer.")) {
      setPendingActionId(obligationId);
      const result = await archiveObligationAction(obligationId);
      setPendingActionId(null);
      if ("success" in result && result.success) {
        addToast({
          title: "Obligación cancelada",
          description: "La obligación se ha cancelado correctamente.",
          type: "success",
        });
        const res = await getObligationsAction(
          filter === "all" ? undefined : { status: filter }
        );
        if (res.data) {
          setObligations(res.data);
        }
      } else {
        addToast({
          title: "Error",
          description: result.error || "No se pudo cancelar la obligación.",
          type: "error",
        });
      }
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <h3 className="text-lg font-medium text-foreground">Error al cargar obligaciones</h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-xs mx-auto">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="mt-4 gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reintentar
          </Button>
        </CardContent>
      </Card>
    );
  }

  const pendingObligations = obligations.filter((o) => o.status === "PENDING");
  const totalPending = pendingObligations.reduce((sum, o) => sum + (o.amount || 0), 0);
  const currency = pendingObligations[0]?.currency_code || "COP";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard" className="p-2 hover:bg-muted rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground font-heading">Obligaciones</h1>
          <p className="text-sm text-muted-foreground">Compromisos de pago pendientes y historial</p>
        </div>
        <Link href="/obligaciones/nueva">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nueva obligación
          </Button>
        </Link>
      </div>

      {pendingObligations.length > 0 && (
        <Card className="border-warning/30 bg-warning/5">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-warning/20 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Total pendiente</p>
                  <p className="text-2xl font-bold text-warning tabular-nums">
                    {formatCurrency(totalPending, currency)}
                  </p>
                </div>
              </div>
              <span className="text-sm text-muted-foreground">
                {pendingObligations.length} obligación{pendingObligations.length !== 1 ? "es" : ""}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center gap-2 border-b border-border pb-2">
        <span className="text-sm font-medium text-muted-foreground">Filtrar:</span>
        <div className="flex gap-2">
          {(["all", "PENDING", "PAID", "CANCELLED"] as ObligationsFilters[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                filter === f
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {f === "all" ? "Todas" : f === "PENDING" ? "Pendientes" : f === "PAID" ? "Pagadas" : "Canceladas"}
            </button>
          ))}
        </div>
      </div>

      {obligations.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <Calendar className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground">
              {filter === "all" ? "No tienes obligaciones" : `No hay obligaciones ${filter.toLowerCase()}`}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground max-w-xs mx-auto">
              {filter === "all"
                ? "Crea tu primera obligación para empezar a rastrear tus compromisos de pago."
                : "Cambia el filtro para ver otras obligaciones."}
            </p>
            {filter === "all" && (
              <Link href="/obligaciones/nueva" className="mt-4 inline-block">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Crear obligación
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {obligations.map((obligation) => (
            <Card key={obligation.id} className="hover:shadow-finn-elevated transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-semibold text-foreground truncate">{obligation.name}</h3>
                      {getStatusBadge(obligation.status)}
                      <Badge variant="secondary" className="text-xs">
                        {obligation.source}
                      </Badge>
                    </div>
                    {obligation.description && (
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{obligation.description}</p>
                    )}
                    <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Vence: {format(new Date(obligation.due_date), "dd MMM yyyy", { locale: es })}
                      </span>
                      <span className="font-medium tabular-nums">
                        {formatCurrency(obligation.amount, obligation.currency_code)}
                      </span>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      {obligation.status === "PENDING" && (
                        <DropdownMenuItem
                          onClick={() => handleMarkPaid(obligation.id)}
                          disabled={pendingActionId === obligation.id}
                          className="flex items-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4 text-success" />
                          Marcar como pagada
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => handleArchive(obligation.id)}
                        disabled={pendingActionId === obligation.id}
                        className="flex items-center gap-2 text-destructive focus:text-destructive"
                      >
                        <XCircle className="w-4 h-4" />
                        Cancelar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        asChild
                        className="flex items-center gap-2"
                      >
                        <Link href={`/obligaciones/${obligation.id}/editar`}>
                          <ChevronDown className="w-4 h-4" />
                          Editar
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ObligacionesPage() {
  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-3xl">
        <ObligationsList />
      </div>
    </main>
  );
}