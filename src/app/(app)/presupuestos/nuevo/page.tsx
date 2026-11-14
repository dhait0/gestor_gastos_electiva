"use client";

import { Suspense, useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createBudgetAction } from "@/app/actions/budgets";
import { getCategoriesByTypeAction } from "@/app/actions/categories";

const initialState = { error: undefined, data: undefined };

interface CategoryOption {
  id: string;
  name: string;
}

function currentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function NewBudgetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultMonth = /^\d{4}-(0[1-9]|1[0-2])$/.test(searchParams.get("month") ?? "")
    ? (searchParams.get("month") as string)
    : currentMonth();

  const [formState, formAction, isPending] = useActionState(createBudgetAction, initialState);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getCategoriesByTypeAction("EXPENSE").then((res) => {
      if ("data" in res && res.data) setCategories(res.data);
      setIsLoading(false);
    });
  }, []);

  const succeeded = "data" in formState && !!formState.data;
  useEffect(() => {
    if (succeeded) {
      router.push(`/presupuestos?month=${defaultMonth}`);
      router.refresh();
    }
  }, [succeeded, router, defaultMonth]);

  const fieldError = (field: string) =>
    "error" in formState && formState.error && typeof formState.error === "object"
      ? formState.error[field]?.[0]
      : undefined;
  const generalError =
    "error" in formState && typeof formState.error === "string" ? formState.error : undefined;

  const selectClass =
    "flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <form action={formAction} className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground font-heading">Nuevo presupuesto</h1>

      <div>
        <Label htmlFor="category_id">Categoría de gasto *</Label>
        <select
          id="category_id"
          name="category_id"
          required
          disabled={isPending || isLoading}
          className={selectClass}
          defaultValue=""
          aria-describedby={fieldError("category_id") ? "category_id-error" : undefined}
        >
          <option value="" disabled>
            {isLoading ? "Cargando..." : "Selecciona una categoría"}
          </option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {fieldError("category_id") && (
          <p id="category_id-error" className="mt-1 text-sm text-destructive" role="alert">
            {fieldError("category_id")}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="month">Mes *</Label>
          <Input id="month" name="month" type="month" required defaultValue={defaultMonth} disabled={isPending} />
          {fieldError("month") && (
            <p className="mt-1 text-sm text-destructive" role="alert">{fieldError("month")}</p>
          )}
        </div>
        <div>
          <Label htmlFor="limit_amount">Límite *</Label>
          <Input
            id="limit_amount"
            name="limit_amount"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            required
            disabled={isPending}
            className="tabular-nums"
          />
          {fieldError("limit_amount") && (
            <p className="mt-1 text-sm text-destructive" role="alert">{fieldError("limit_amount")}</p>
          )}
        </div>
      </div>

      {generalError && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive" role="alert">
          {generalError}
        </div>
      )}

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
        <Link href="/presupuestos">
          <Button type="button" variant="outline" disabled={isPending}>
            Cancelar
          </Button>
        </Link>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Guardando..." : "Crear presupuesto"}
        </Button>
      </div>
    </form>
  );
}

export default function NuevoPresupuestoPage() {
  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-2xl">
        <Suspense fallback={null}>
          <NewBudgetForm />
        </Suspense>
      </div>
    </main>
  );
}
