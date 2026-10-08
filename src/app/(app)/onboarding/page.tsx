import { cn } from "@/lib/utils";
import { ArrowRight, CheckCircle } from "lucide-react";

const steps = [
  { id: 1, title: "Moneda", description: "Configura tu moneda base (COP por defecto)", href: "/onboarding/moneda" },
  { id: 2, title: "Zona horaria", description: "Establece tu zona horaria (America/Bogota)", href: "/onboarding/zona-horaria" },
  { id: 3, title: "Reserva de seguridad", description: "Define un colchón para imprevistos", href: "/onboarding/reserva" },
  { id: 4, title: "Primera cuenta", description: "Crea tu primera cuenta financiera", href: "/onboarding/cuenta" },
];

export default function OnboardingPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground font-heading tracking-tight">
            Bienvenido a FinWise
          </h1>
          <p className="mt-2 text-muted-foreground">
            Configuremos lo esencial para que empieces a gestionar tus finanzas
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-finn-soft space-y-6">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Paso 1 de 4</span>
            <span className="text-primary font-medium">25%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: "25%" }} />
          </div>

          <ul className="space-y-3" role="list" aria-label="Pasos de onboarding">
            {steps.map((step, index) => (
              <li key={step.id} className="relative">
                <a
                  href={step.href}
                  className={cn(
                    "flex items-center gap-4 p-4",
                    "rounded-xl border border-border",
                    "bg-background hover:bg-muted/50",
                    "transition-colors",
                    "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  )}
                >
                  <div className={cn(
                    "flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center",
                    "font-semibold text-sm",
                    index === 0 ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                  )}>
                    {index === 0 ? <ArrowRight className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-foreground">{step.title}</p>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                </a>
              </li>
            ))}
          </ul>

          <p className="text-center text-xs text-muted-foreground pt-4 border-t border-border">
            Podrás cambiar esta configuración después en Ajustes
          </p>
        </div>
      </div>
    </main>
  );
}