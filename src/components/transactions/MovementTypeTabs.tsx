import Link from "next/link";
import { cn } from "@/lib/utils";
import { MOVEMENT_TONE_CLASSES, describeMovement, type MovementTone } from "@/lib/movement-kind";

const TABS: { tone: MovementTone; type: string; href: string; label: string; help: string }[] = [
  { tone: "expense", type: "EXPENSE", href: "/transacciones/nuevo?type=expense", label: "Gasto", help: "Compraste o pagaste algo: el dinero sale de tu patrimonio." },
  { tone: "income", type: "INCOME", href: "/transacciones/nuevo?type=income", label: "Ingreso", help: "Recibiste dinero (salario, venta, regalo): entra a tu patrimonio." },
  { tone: "transfer", type: "TRANSFER", href: "/transacciones/transferir", label: "Transferencia", help: "Mueves dinero entre tus propias cuentas: no es gasto ni ingreso, solo cambia de lugar." },
];

/** Selector de tipo de movimiento: deja claro qué es cada uno y permite cambiar sin volver atrás. */
export function MovementTypeTabs({ current }: { current: MovementTone }) {
  const active = TABS.find((tab) => tab.tone === current) ?? TABS[0];
  return (
    <div className="space-y-2" data-tour="tipo-movimiento">
      <nav aria-label="Tipo de movimiento" className="grid grid-cols-3 gap-2">
        {TABS.map((tab) => {
          const kind = describeMovement(tab.type);
          const selected = tab.tone === current;
          return (
            <Link
              key={tab.tone}
              href={tab.href}
              aria-current={selected ? "page" : undefined}
              className={cn(
                "flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                selected ? cn("border-transparent", MOVEMENT_TONE_CLASSES[tab.tone].badge) : "border-border bg-card text-muted-foreground hover:bg-muted"
              )}
            >
              <kind.Icon className="h-4 w-4" aria-hidden="true" />
              {tab.label}
            </Link>
          );
        })}
      </nav>
      <p className="text-sm text-muted-foreground">{active.help}</p>
    </div>
  );
}
