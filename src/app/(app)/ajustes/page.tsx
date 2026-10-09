"use client";

import { useState, FormEvent } from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Shield, Info, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { updateProfileAction } from "@/app/actions/onboarding";
import { cn } from "@/lib/utils";
import Link from "next/link";

type ActionResult =
  | { success: true; redirectTo?: string; error?: undefined; fieldErrors?: undefined }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

const initialState: ActionResult = { success: false, error: "" };

export default function AjustesPage() {
  const router = useRouter();
  const [safetyReserve, setSafetyReserve] = useState<number>(0);
  const [state, formAction, isPending] = useActionState<ActionResult, FormData>(updateProfileAction, initialState);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("safetyReserve", safetyReserve.toString());
    await formAction(formData);
    if (state.success) {
      router.refresh();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value) || 0;
    setSafetyReserve(Math.max(0, value));
  };

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard" className="p-2 hover:bg-muted rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground font-heading">Ajustes</h1>
            <p className="text-sm text-muted-foreground">Configura tu perfil y preferencias</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Reserva de seguridad</CardTitle>
                  <CardDescription>Colchón para imprevistos que reduce tu dinero disponible</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="safetyReserve" className="block text-sm font-medium text-foreground">
                  Monto de la reserva
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="safetyReserve"
                    type="number"
                    min="0"
                    step="1000"
                    value={safetyReserve}
                    onChange={handleChange}
                    className={cn(
                      "w-full pl-8 pr-4 py-3",
                      "bg-background border border-input rounded-xl",
                      "text-foreground placeholder:text-muted-foreground",
                      "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
                      "transition-colors",
                      "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                    disabled={isPending}
                    placeholder="0"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Esta cantidad se restará de tu dinero disponible como colchón para imprevistos.
                  No afecta tu saldo bancario real.
                </p>
              </div>

              <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-primary-foreground space-y-1">
                    <p className="font-medium">¿Cómo funciona la reserva de seguridad?</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Reduce tu <strong>dinero disponible</strong> para gastar</li>
                      <li><strong>NO</strong> reduce tu saldo bancario real</li>
                      <li>Te protege ante gastos inesperados</li>
                      <li>Se muestra en el desglose del dashboard</li>
                    </ul>
                  </div>
                </div>
              </div>

              {state.error && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-4 text-sm text-destructive flex items-start gap-3" role="alert">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p>{state.error}</p>
                </div>
              )}

              {state.success && (
                <div className="rounded-lg bg-green/10 border border-green/30 p-4 text-sm text-green flex items-center gap-3" role="alert">
                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                  <p>Reserva de seguridad actualizada correctamente</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-muted/50 rounded-lg">
                  <Info className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <CardTitle className="text-lg">Moneda y zona horaria</CardTitle>
                  <CardDescription>Configuración regional de tu cuenta</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Estas opciones se configuraron durante el onboarding. Para cambiarlas, contacta con soporte.
              </p>
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}