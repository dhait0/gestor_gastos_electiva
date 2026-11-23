"use client";

import { useState, useRef, useTransition } from "react";
import { Download, Upload, Trash2, AlertTriangle, CheckCircle, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { resetUserDataAction } from "@/app/actions/reset";

type Step = "idle" | "confirming-reset" | "resetting" | "reset-done" | "importing" | "import-done" | "error";

export function DataManagement() {
  const [step, setStep] = useState<Step>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [importSummary, setImportSummary] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const [, startTransition] = useTransition();

  const [isResetting, setIsResetting] = useState(false);

  const handleReset = () => {
    setIsResetting(true);
    setStep("resetting");
    startTransition(async () => {
      const result = await resetUserDataAction();
      setIsResetting(false);
      if (result.error) {
        setErrorMsg(result.error);
        setStep("error");
      } else {
        setStep("reset-done");
      }
    });
  };

  const handleImport = async (file: File) => {
    setStep("importing");
    setErrorMsg("");
    try {
      const { read, utils } = await import("xlsx");
      const buffer = await file.arrayBuffer();
      const wb = read(buffer);

      const summary: string[] = [];

      const parseSheet = (name: string) => {
        const ws = wb.Sheets[name];
        if (!ws) return [];
        const rows = utils.sheet_to_json<Record<string, string | number>>(ws);
        return rows;
      };

      const cuentas = parseSheet("Cuentas");
      const deudas = parseSheet("Deudas");
      const obligaciones = parseSheet("Obligaciones");
      const recurrentes = parseSheet("Recurrentes");
      const suscripciones = parseSheet("Suscripciones");
      const presupuestos = parseSheet("Presupuestos");
      const transacciones = parseSheet("Transacciones");

      const totalRows = cuentas.length + deudas.length + obligaciones.length + recurrentes.length + suscripciones.length + presupuestos.length + transacciones.length;

      if (totalRows === 0) {
        setErrorMsg("El archivo no tiene datos para importar. Verificá que estés usando la plantilla de Lukiva.");
        setStep("error");
        return;
      }

      // Enviar al servidor
      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cuentas, deudas, obligaciones, recurrentes, suscripciones, presupuestos, transacciones }),
      });

      const json = await res.json() as Record<string, number | string>;
      if (!res.ok) {
        setErrorMsg(String(json.error ?? "Error al importar"));
        setStep("error");
        return;
      }

      if (cuentas.length) summary.push(`${cuentas.length} cuentas`);
      if (deudas.length) summary.push(`${deudas.length} deudas`);
      if (obligaciones.length) summary.push(`${obligaciones.length} obligaciones`);
      if (recurrentes.length) summary.push(`${recurrentes.length} recurrentes`);
      if (suscripciones.length) summary.push(`${suscripciones.length} suscripciones`);
      if (presupuestos.length) summary.push(`${presupuestos.length} presupuestos`);
      if (transacciones.length) summary.push(`${transacciones.length} transacciones`);

      setImportSummary(summary);
      setStep("import-done");
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Error inesperado al leer el archivo");
      setStep("error");
    }
  };

  return (
    <div className="space-y-5">
      {/* Descargar plantilla */}
      <div className="rounded-xl border border-border bg-muted/20 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-start gap-3 flex-1">
          <div className="w-9 h-9 rounded-lg bg-green-100 dark:bg-green-950/40 flex items-center justify-center flex-shrink-0">
            <FileSpreadsheet className="w-5 h-5 text-green-700 dark:text-green-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Plantilla de configuración inicial</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Excel con 7 hojas: cuentas, deudas, obligaciones, recurrentes, suscripciones, presupuestos y transacciones.
              Incluye instrucciones y ejemplos.
            </p>
          </div>
        </div>
        <a href="/api/template" download="plantilla-lukiva.xlsx" className="flex-shrink-0">
          <Button variant="outline" size="sm" className="gap-2 w-full sm:w-auto">
            <Download className="w-4 h-4" /> Descargar plantilla
          </Button>
        </a>
      </div>

      {/* Importar datos */}
      <div className="rounded-xl border border-border bg-muted/20 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-start gap-3 flex-1">
          <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center flex-shrink-0">
            <Upload className="w-5 h-5 text-blue-700 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Importar desde Excel</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Subí la plantilla completada. Los datos existentes NO se borran; se agregan los nuevos.
            </p>
          </div>
        </div>
        <div className="flex-shrink-0">
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImport(file);
            }}
          />
          <Button
            variant="outline"
            size="sm"
            className="gap-2 w-full sm:w-auto"
            disabled={step === "importing"}
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="w-4 h-4" />
            {step === "importing" ? "Importando..." : "Seleccionar archivo"}
          </Button>
        </div>
      </div>

      {/* Feedback de importación */}
      {step === "import-done" && (
        <div className="rounded-xl border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/20 p-4 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">Importación completada</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Se importaron: {importSummary.join(", ")}.
            </p>
          </div>
        </div>
      )}

      {step === "error" && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">{errorMsg}</p>
        </div>
      )}

      {/* Zona de peligro: limpiar datos */}
      <div className="rounded-xl border border-orange-200 dark:border-orange-900/60 bg-orange-50/50 dark:bg-orange-950/10 p-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-orange-100 dark:bg-orange-950/40 flex items-center justify-center flex-shrink-0">
            <Trash2 className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Limpiar todos los datos financieros</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Elimina cuentas, movimientos, deudas, obligaciones, suscripciones, presupuestos y metas.
              Tu perfil, correo y contraseña no se tocan.
            </p>
          </div>
        </div>

        {step === "confirming-reset" ? (
          <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 p-3 space-y-3">
            <p className="text-sm text-foreground font-medium">¿Estás seguro? Esta acción no se puede deshacer.</p>
            <div className="flex gap-2">
              <Button
                variant="destructive"
                size="sm"
                disabled={isResetting}
                onClick={handleReset}
              >
                Sí, limpiar todo
              </Button>
              <Button variant="outline" size="sm" onClick={() => setStep("idle")}>
                Cancelar
              </Button>
            </div>
          </div>
        ) : step === "reset-done" ? (
          <div className="mt-4 flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
            <CheckCircle className="w-4 h-4" />
            Datos eliminados. Podés empezar de cero.
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className={cn("mt-4 gap-2 border-orange-300 dark:border-orange-800 text-orange-700 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-950/40")}
            onClick={() => setStep("confirming-reset")}
          >
            <Trash2 className="w-4 h-4" />
            Limpiar datos de prueba
          </Button>
        )}
      </div>
    </div>
  );
}
