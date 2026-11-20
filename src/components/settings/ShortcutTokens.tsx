"use client";

import { useActionState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createShortcutTokenAction, revokeShortcutTokenAction, type ShortcutTokenResult } from "@/app/actions/account";
import { preventFormReset } from "@/lib/keep-form-on-error";
import { CopyButton } from "./CopyButton";

export interface ShortcutTokenRow {
  id: string;
  name: string;
  prefix: string;
  createdAt: string;
  lastUsedAt: string | null;
  revoked: boolean;
}

const initialState: ShortcutTokenResult = { success: false, error: "" };

export function ShortcutTokens({ tokens, baseUrl, accounts, expenseCategories }: { tokens: ShortcutTokenRow[]; baseUrl: string; accounts: string[]; expenseCategories: string[] }) {
  const [state, formAction, isPending] = useActionState(createShortcutTokenAction, initialState);
  const [isRevoking, startRevoke] = useTransition();
  const active = tokens.filter((token) => !token.revoked);
  const movementsUrl = `${baseUrl}/api/atajos/movimientos`;
  const getBaseUrl = `${movementsUrl}?cuenta=${encodeURIComponent(accounts[0] ?? "Efectivo")}&categoria=${encodeURIComponent(expenseCategories[0] ?? "Alimentación")}&monto=`;
  const exampleToken = state.success ? state.token : "<tu token>";
  const exampleBody = JSON.stringify(
    { tipo: "gasto", monto: 45000, descripcion: "Almuerzo", cuenta: accounts[0] ?? "Efectivo", categoria: expenseCategories[0] ?? "Alimentación" },
    null,
    2
  );

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Registra un gasto o ingreso desde la app <strong className="text-foreground">Atajos</strong> del iPhone (o con Siri) y aparece en Lukiva al instante. Cada token solo puede
        <strong className="text-foreground"> crear</strong> movimientos: no puede leer tus saldos ni tus datos.
      </p>

      <form action={formAction} onReset={preventFormReset} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <Label htmlFor="shortcut-name">Nombre del token</Label>
          <Input id="shortcut-name" name="name" placeholder="Mi iPhone" maxLength={60} required disabled={isPending} />
        </div>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Creando..." : "Crear token"}
        </Button>
      </form>

      {!state.success && state.error && (
        <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}

      {state.success && (
        <div role="status" className="space-y-2 rounded-lg border border-success/30 bg-success/10 p-4">
          <p className="text-sm font-medium text-foreground">Token «{state.name}» creado. Cópialo ahora: no se vuelve a mostrar.</p>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <code data-testid="shortcut-token" className="block flex-1 break-all rounded-md bg-background px-3 py-2 text-xs">{state.token}</code>
            <CopyButton value={state.token} label="token" />
          </div>
        </div>
      )}

      <section aria-labelledby="atajos-tokens-titulo" className="space-y-2">
        <h3 id="atajos-tokens-titulo" className="text-sm font-semibold text-foreground">
          Tus tokens ({active.length} activos)
        </h3>
        {tokens.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aún no has creado ninguno.</p>
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border" role="list">
            {tokens.map((token) => (
              <li key={token.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">
                    {token.name} <span className="font-mono text-xs text-muted-foreground">{token.prefix}…</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Creado {token.createdAt} · {token.lastUsedAt ? `último uso ${token.lastUsedAt}` : "sin usar"}
                  </p>
                </div>
                {token.revoked ? (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">Revocado</span>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isRevoking}
                    aria-label={`Revocar token ${token.name}`}
                    onClick={() => startRevoke(async () => void (await revokeShortcutTokenAction(token.id)))}
                  >
                    Revocar
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="atajos-guia-titulo" className="space-y-3">
        <h3 id="atajos-guia-titulo" className="text-sm font-semibold text-foreground">
          Cómo armar el atajo «Gasto rápido»
        </h3>
        <ol className="list-decimal space-y-2 pl-5 text-sm text-foreground">
          <li>En el iPhone abre <strong>Atajos</strong>, toca <strong>+</strong> y ponle de nombre «Gasto rápido».</li>
          <li>Añade <strong>Solicitar entrada</strong> (tipo Número) con la pregunta «¿Cuánto gastaste?».</li>
          <li>Añade otra <strong>Solicitar entrada</strong> (tipo Texto) con la pregunta «¿En qué?».</li>
          <li>
            Añade <strong>Obtener contenido de URL</strong> y toca «Mostrar más». <strong>Opción recomendada (GET, sin cuerpo):</strong>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-muted-foreground">
              <li>
                URL: empieza con <code className="break-all text-xs text-foreground">{getBaseUrl}</code> <CopyButton value={getBaseUrl} label="URL base" />
                {" "}y a continuación escribe <code className="text-xs text-foreground">&amp;descripcion=</code> y la variable del paso 3, y al final de la parte que ya trae <code className="text-xs text-foreground">monto=</code> inserta la variable del paso 2.
              </li>
              <li>Método: <strong className="text-foreground">GET</strong> (el que viene por defecto).</li>
              <li>
                Encabezado: <code className="text-xs text-foreground">Authorization</code> con el valor{" "}
                <code className="break-all text-xs text-foreground">Bearer {exampleToken}</code>
              </li>
            </ul>
            <p className="mt-2 text-muted-foreground">
              <strong className="text-foreground">Alternativa (POST con JSON):</strong> URL <code className="break-all text-xs text-foreground">{movementsUrl}</code>, método POST, el mismo encabezado y cuerpo JSON con estos campos
              (en <em>monto</em> y <em>descripcion</em> usa las variables de los pasos 2 y 3). Si te sale «la conexión de red se perdió», usa la opción GET.
            </p>
            <pre className="mt-2 overflow-x-auto rounded-md bg-muted p-3 text-xs">{exampleBody}</pre>
          </li>
          <li>Añade <strong>Obtener valor del diccionario</strong> con la clave <code className="text-xs">mensaje</code> y luego <strong>Mostrar notificación</strong>: verás «Gasto de $45.000 registrado en…».</li>
          <li>Toca el ⓘ del atajo para <strong>añadirlo a la pantalla de inicio</strong>, asignarlo al botón de Acción o llamarlo con Siri: «Oye Siri, gasto rápido».</li>
        </ol>

        <div className="space-y-1 text-sm text-muted-foreground">
          <p>
            <strong className="text-foreground">Cuenta y categoría</strong> deben escribirse tal como las tienes en Lukiva (da igual mayúsculas o minúsculas).
            Para un ingreso usa <code className="text-xs">&quot;tipo&quot;: &quot;ingreso&quot;</code> y una categoría de ingreso. Si solo tienes una cuenta activa puedes omitir <code className="text-xs">cuenta</code>.
          </p>
          <p>
            <strong className="text-foreground">Tus cuentas:</strong> {accounts.length ? accounts.join(", ") : "aún no tienes cuentas activas"}.
          </p>
          <p>
            <strong className="text-foreground">Tus categorías de gasto:</strong> {expenseCategories.length ? expenseCategories.join(", ") : "aún no tienes categorías"}.
          </p>
          <p>
            Opcional: <code className="text-xs">fecha</code> (AAAA-MM-DD) y <code className="text-xs">clave</code> (un texto único; si el atajo se dispara dos veces con la misma clave, no se duplica).
            Para armar listas de elección dinámicas, consulta <code className="break-all text-xs">{baseUrl}/api/atajos/opciones</code> (GET, mismo encabezado).
          </p>
        </div>
      </section>
    </div>
  );
}
