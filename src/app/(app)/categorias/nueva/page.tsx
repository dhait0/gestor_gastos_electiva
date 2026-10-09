"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Wallet, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { createCategoryAction } from "@/app/actions/categories";
import { useActionState } from "react";

const categoryTypes = [
  { value: "INCOME", label: "Ingreso", icon: Wallet, description: "Para clasificar ingresos (salario, honorarios, etc.)" },
  { value: "EXPENSE", label: "Gasto", icon: CreditCard, description: "Para clasificar gastos (alimentación, transporte, etc.)" },
];

type FormState =
  | { error: string }
  | { error: Record<string, string[]> }
  | { data: { id: string } }
  | { error?: undefined; data?: undefined };

const initialState: FormState = { error: undefined, data: undefined };

function NewCategoryForm() {
  const router = useRouter();
  const [formState, formAction, isPending] = useActionState(createCategoryAction, initialState);

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
      router.push("/categorias");
      router.refresh();
    }
  };

  if ("data" in formState && formState.data) {
    handleSuccess();
  }

  return (
    <form action={formAction} className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/categorias" className="p-2 hover:bg-muted rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground font-heading">Nueva categoría</h1>
          <p className="text-sm text-muted-foreground">Crea una categoría para clasificar tus movimientos</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Información de la categoría</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              name="name"
              placeholder="Ej: Salario, Alimentación, Transporte"
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
            <Label htmlFor="type">Tipo *</Label>
            <Select
              name="type"
              required
              disabled={isPending}
              aria-describedby={getFieldError("type") ? "type-error" : undefined}
              defaultValue="INCOME"
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un tipo" />
              </SelectTrigger>
              <SelectContent>
                {categoryTypes.map((type) => (
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
              placeholder="Ej: wallet, credit-card, utensils, car"
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
        <Link href="/categorias">
          <Button type="button" variant="outline" disabled={isPending}>
            Cancelar
          </Button>
        </Link>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Creando..." : "Crear categoría"}
        </Button>
      </div>
    </form>
  );
}

export default function NuevaCategoriaPage() {
  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-2xl">
        <NewCategoryForm />
      </div>
    </main>
  );
}