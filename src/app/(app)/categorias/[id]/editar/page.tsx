"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Wallet, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { updateCategoryAction } from "@/app/actions/categories";
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

interface CategoryData {
  id: string;
  name: string;
  type: "INCOME" | "EXPENSE";
  color: string | null;
  icon: string | null;
  is_default: boolean;
}

function EditCategoryForm({ initialData }: { initialData: CategoryData }) {
  const router = useRouter();
  const params = useParams();
  const categoryId = params.id as string;
  const [formState, formAction, isPending] = useActionState(updateCategoryAction, initialState);

  useEffect(() => {
    if ("data" in formState && formState.data) {
      router.push("/categorias");
      router.refresh();
    }
  }, [formState, router]);

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

  const handleSubmit = (formData: FormData) => {
    formData.set("id", categoryId);
    formAction(formData);
  };

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/categorias" className="p-2 hover:bg-muted rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground font-heading">Editar categoría</h1>
          <p className="text-sm text-muted-foreground">Modifica la configuración de tu categoría</p>
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
              defaultValue={initialData.name}
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
              defaultValue={initialData.type}
              aria-describedby={getFieldError("type") ? "type-error" : undefined}
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
              defaultValue={initialData.color || "#2563EB"}
              disabled={isPending}
            />
          </div>

          <div>
            <Label htmlFor="icon">Icono (opcional)</Label>
            <Input
              id="icon"
              name="icon"
              placeholder="Ej: wallet, credit-card, utensils, car"
              defaultValue={initialData.icon || ""}
              disabled={isPending}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_default"
              name="is_default"
              defaultChecked={initialData.is_default}
              disabled={isPending}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label htmlFor="is_default" className="text-sm font-normal text-foreground cursor-pointer">
              Categoría por defecto
            </Label>
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
          {isPending ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}

export default async function EditarCategoriaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { getCategoriesAction } = await import("@/app/actions/categories");
  const { data: categories } = await getCategoriesAction();
  const category = categories?.find((c) => c.id === id);

  if (!category) {
    return (
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-destructive">Categoría no encontrada</p>
          <Link href="/categorias" className="mt-4 inline-block">
            <Button variant="outline">Volver a categorías</Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-2xl">
        <EditCategoryForm initialData={category} />
      </div>
    </main>
  );
}