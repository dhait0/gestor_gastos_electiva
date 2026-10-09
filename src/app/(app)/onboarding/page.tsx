"use client";

import { useState, FormEvent } from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { updateProfileAction, createFirstAccountAction } from "@/app/actions/onboarding";
import { cn } from "@/lib/utils";
import { ChevronRight, CheckCircle } from "lucide-react";

type OnboardingFormData = {
  displayName: string;
  currencyCode: string;
  timezone: string;
  safetyReserve: number;
};

const currencies = [
  { code: "COP", label: "Peso colombiano (COP)", symbol: "$" },
  { code: "USD", label: "Dólar estadounidense (USD)", symbol: "$" },
  { code: "EUR", label: "Euro (EUR)", symbol: "€" },
];

const timezones = [
  { value: "America/Bogota", label: "Bogotá (GMT-5)" },
  { value: "America/Mexico_City", label: "Ciudad de México (GMT-6)" },
  { value: "America/Lima", label: "Lima (GMT-5)" },
  { value: "America/Santiago", label: "Santiago (GMT-4)" },
  { value: "America/Argentina/Buenos_Aires", label: "Buenos Aires (GMT-3)" },
  { value: "Europe/Madrid", label: "Madrid (GMT+1)" },
];

const steps = [
  { id: 1, title: "Perfil", description: "Nombre, moneda y zona horaria" },
  { id: 2, title: "Reserva", description: "Colchón de seguridad" },
  { id: 3, title: "Cuenta", description: "Primera cuenta y saldo inicial" },
];

function Step1({ initialData, onNext }: { initialData: OnboardingFormData; onNext: (data: OnboardingFormData) => void }) {
  const [state, formAction, isPending] = useActionState(updateProfileAction, {
    success: false,
    error: "",
  });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await formAction(formData);
    if (state.success) {
      onNext({ ...initialData, ...Object.fromEntries(formData) });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {state.error && (
        <div className="rounded-lg bg-danger-bg border border-danger/30 p-4 text-sm text-danger flex items-center gap-3" role="alert">
          <p>{state.error}</p>
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="displayName" className="block text-sm font-medium text-foreground">
          Nombre visible
        </label>
        <input
          id="displayName"
          name="displayName"
          type="text"
          autoComplete="name"
          maxLength={100}
          defaultValue={initialData.displayName || ""}
          className={cn(
            "w-full px-4 py-3",
            "bg-background border border-input rounded-xl",
            "text-foreground placeholder:text-muted-foreground",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
            "transition-colors",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
          disabled={isPending}
          placeholder="Tu nombre"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="currencyCode" className="block text-sm font-medium text-foreground">
          Moneda principal
        </label>
        <select
          id="currencyCode"
          name="currencyCode"
          defaultValue={initialData.currencyCode || "COP"}
          className={cn(
            "w-full px-4 py-3",
            "bg-background border border-input rounded-xl",
            "text-foreground",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
            "transition-colors",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
          disabled={isPending}
        >
          {currencies.map((c) => (
            <option key={c.code} value={c.code}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="timezone" className="block text-sm font-medium text-foreground">
          Zona horaria
        </label>
        <select
          id="timezone"
          name="timezone"
          defaultValue={initialData.timezone || "America/Bogota"}
          className={cn(
            "w-full px-4 py-3",
            "bg-background border border-input rounded-xl",
            "text-foreground",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
            "transition-colors",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
          disabled={isPending}
        >
          {timezones.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className={cn(
          "w-full py-3.5 px-6",
          "bg-primary text-primary-foreground",
          "rounded-xl font-semibold text-base",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          "transition-all duration-150",
          "hover:shadow-finn-elevated hover:-translate-y-0.5",
          "active:scale-[0.98] active:shadow-finn-soft",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:translate-y-0"
        )}
      >
        {isPending ? "Guardando..." : "Continuar"}
        <ChevronRight className="w-4 h-4 ml-2" />
      </button>
    </form>
  );
}

function Step2({ initialData, onNext, onBack }: { initialData: OnboardingFormData; onNext: (data: OnboardingFormData) => void; onBack: () => void }) {
  const [state, formAction, isPending] = useActionState(updateProfileAction, {
    success: false,
    error: "",
  });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await formAction(formData);
    if (state.success) {
      onNext({ ...initialData, safetyReserve: Number(formData.get("safetyReserve")) || 0 });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {state.error && (
        <div className="rounded-lg bg-danger-bg border border-danger/30 p-4 text-sm text-danger flex items-center gap-3" role="alert">
          <p>{state.error}</p>
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="safetyReserve" className="block text-sm font-medium text-foreground">
          Reserva de seguridad
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
          <input
            id="safetyReserve"
            name="safetyReserve"
            type="number"
            min="0"
            step="1000"
            defaultValue={initialData.safetyReserve || 0}
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
        </p>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className={cn(
            "flex-1 py-3.5 px-6",
            "border border-border bg-card text-foreground",
            "rounded-xl font-semibold text-base",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            "hover:bg-muted/50",
            "transition-colors"
          )}
        >
          Volver
        </button>
        <button
          type="submit"
          disabled={isPending}
          className={cn(
            "flex-1 py-3.5 px-6",
            "bg-primary text-primary-foreground",
            "rounded-xl font-semibold text-base",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            "transition-all duration-150",
            "hover:shadow-finn-elevated hover:-translate-y-0.5",
            "active:scale-[0.98] active:shadow-finn-soft",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:translate-y-0"
          )}
        >
          {isPending ? "Guardando..." : "Continuar"}
          <ChevronRight className="w-4 h-4 ml-2" />
        </button>
      </div>
    </form>
  );
}

const accountTypes = [
  { value: "CASH", label: "Efectivo", icon: "💵" },
  { value: "CHECKING", label: "Cuenta corriente", icon: "🏦" },
  { value: "SAVINGS", label: "Cuenta de ahorros", icon: "💰" },
  { value: "CREDIT_CARD", label: "Tarjeta de crédito", icon: "💳" },
  { value: "DIGITAL_WALLET", label: "Billetera digital", icon: "📱" },
  { value: "OTHER", label: "Otra", icon: "📦" },
];

function Step3({ initialData, onComplete }: { initialData: OnboardingFormData; onComplete: () => void }) {
  const [state, formAction, isPending] = useActionState(createFirstAccountAction, {
    success: false,
    error: "",
  });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await formAction(formData);
    if (state.success) {
      onComplete();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {state.error && (
        <div className="rounded-lg bg-danger-bg border border-danger/30 p-4 text-sm text-danger flex items-center gap-3" role="alert">
          <p>{state.error}</p>
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="name" className="block text-sm font-medium text-foreground">
          Nombre de la cuenta
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          maxLength={100}
          className={cn(
            "w-full px-4 py-3",
            "bg-background border border-input rounded-xl",
            "text-foreground placeholder:text-muted-foreground",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
            "transition-colors",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
          disabled={isPending}
          placeholder="Mi cuenta principal"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground">Tipo de cuenta</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {accountTypes.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => document.getElementById(`account-type-${type.value}`)?.click()}
              className={cn(
                "relative p-4 border-2 rounded-xl transition-all",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                "hover:border-primary/50"
              )}
            >
              <input
                id={`account-type-${type.value}`}
                type="radio"
                name="type"
                value={type.value}
                defaultChecked={type.value === "CHECKING"}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center gap-2">
                <span className="text-3xl">{type.icon}</span>
                <span className="text-sm font-medium text-foreground">{type.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="initialBalance" className="block text-sm font-medium text-foreground">
          Saldo inicial
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
          <input
            id="initialBalance"
            name="initialBalance"
            type="number"
            min="0"
            step="1000"
            defaultValue={0}
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
          Si es tarjeta de crédito, déjalo en 0 (el límite se gestiona aparte).
        </p>
      </div>

      <input type="hidden" name="currencyCode" value={initialData.currencyCode || "COP"} />

      <button
        type="submit"
        disabled={isPending}
        className={cn(
          "w-full py-3.5 px-6",
          "bg-primary text-primary-foreground",
          "rounded-xl font-semibold text-base",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          "transition-all duration-150",
          "hover:shadow-finn-elevated hover:-translate-y-0.5",
          "active:scale-[0.98] active:shadow-finn-soft",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:translate-y-0"
        )}
      >
        {isPending ? "Creando cuenta..." : "Comenzar a usar FinWise"}
        <CheckCircle className="w-4 h-4 ml-2" />
      </button>
    </form>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    displayName: "",
    currencyCode: "COP",
    timezone: "America/Bogota",
    safetyReserve: 0,
  });

  const handleNext = (newData: OnboardingFormData) => {
    setFormData(newData);
    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleComplete = () => {
    router.push("/dashboard");
    router.refresh();
  };

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
            <span className="text-muted-foreground">
              Paso {currentStep} de {steps.length}
            </span>
            <span className="text-primary font-medium">
              {Math.round((currentStep / steps.length) * 100)}%
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground mb-6">
            {steps.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center gap-1 flex-1">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center font-semibold",
                    index < currentStep - 1
                      ? "bg-primary text-primary-foreground"
                      : index === currentStep - 1
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {index < currentStep - 1 ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    step.id
                  )}
                </div>
                <span className={cn(index === currentStep - 1 ? "font-medium" : "")}>
                  {step.title}
                </span>
              </div>
            ))}
          </div>

          {currentStep === 1 && (
            <Step1 initialData={formData} onNext={handleNext} />
          )}
          {currentStep === 2 && (
            <Step2 initialData={formData} onNext={handleNext} onBack={handleBack} />
          )}
          {currentStep === 3 && (
            <Step3 initialData={formData} onComplete={handleComplete} />
          )}

          <p className="text-center text-xs text-muted-foreground pt-4 border-t border-border">
            Podrás cambiar esta configuración después en Ajustes
          </p>
        </div>
      </div>
    </main>
  );
}