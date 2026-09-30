"use client";

import { useEffect, useState } from "react";
import { getCategories, createCategoryAction, updateCategoryAction, deleteCategoryAction } from "./actions";
import type { Category } from "@/lib/services/category.service";

export default function CategoriesClient({ userId }: { userId: string }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState<"ALL" | "INCOME" | "EXPENSE">("ALL");

  const [form, setForm] = useState({
    name: "",
    type: "EXPENSE" as "INCOME" | "EXPENSE",
    icon: "",
    color: "#f97316",
  });

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    load();
  }, [userId]);
  /* eslint-enable react-hooks/set-state-in-effect */

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    if (editingId) {
      const res = await updateCategoryAction(editingId, { error: undefined }, new FormData(e.target as HTMLFormElement));
      if (res?.error) {
        setFormError(res.error);
        setSubmitting(false);
        return;
      }
      setEditingId(null);
    } else {
      const res = await createCategoryAction({ error: undefined }, new FormData(e.target as HTMLFormElement));
      if (res?.error) {
        setFormError(res.error);
        setSubmitting(false);
        return;
      }
    }

    setForm({ name: "", type: "EXPENSE", icon: "", color: "#f97316" });
    setSubmitting(false);
    await load();
  }

  function startEdit(category: Category) {
    setEditingId(category.id);
    setForm({
      name: category.name,
      type: category.type,
      icon: category.icon ?? "",
      color: category.color ?? "#f97316",
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm({ name: "", type: "EXPENSE", icon: "", color: "#f97316" });
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta categoría?")) return;
    await deleteCategoryAction(id);
    await load();
  }

  const filtered = filter === "ALL" ? categories : categories.filter((c) => c.type === filter);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Categorías</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Organiza tus ingresos y gastos por categoría.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mb-8 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-medium text-foreground">
          {editingId ? "Editar categoría" : "Nueva categoría"}
        </h2>

        {formError && <p className="mb-4 text-sm text-destructive">{formError}</p>}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-foreground">Nombre</label>
            <input
              type="text"
              name="name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-lg border border-input px-3 py-2 text-sm outline-none focus:border-primary"
              placeholder="Ej: Alimentación"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Tipo</label>
            <select
              name="type"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as "INCOME" | "EXPENSE" })}
              className="w-full rounded-lg border border-input px-3 py-2 text-sm outline-none focus:border-primary bg-background"
            >
              <option value="EXPENSE">Gasto</option>
              <option value="INCOME">Ingreso</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Icono (emoji)</label>
            <input
              type="text"
              name="icon"
              maxLength={2}
              value={form.icon}
              onChange={(e) => setForm({ ...form, icon: e.target.value })}
              className="w-full rounded-lg border border-input px-3 py-2 text-sm outline-none focus:border-primary"
              placeholder="🍔"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Color</label>
            <input
              type="color"
              name="color"
              value={form.color}
              onChange={(e) => setForm({ ...form, color: e.target.value })}
              className="h-10 w-full rounded-lg border border-input px-1 py-1"
            />
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
          >
            {editingId ? "Guardar" : "Crear categoría"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              disabled={submitting}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted disabled:opacity-60"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="mb-4 flex gap-2">
        {(["ALL", "INCOME", "EXPENSE"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              filter === f
                ? "bg-primary text-primary-foreground"
                : "border border-border text-foreground hover:bg-muted"
            }`}
          >
            {f === "ALL" ? "Todas" : f === "INCOME" ? "Ingresos" : "Gastos"}
          </button>
        ))}
      </div>

      {loading && <p className="text-sm text-muted-foreground">Cargando...</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}

      {!loading && !error && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between rounded-xl border border-border bg-card p-4 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-sm"
                  style={{ backgroundColor: category.color ? `${category.color}20` : undefined }}
                >
                  {category.icon || "📁"}
                </span>
                <div>
                  <p className="text-sm font-medium text-foreground">{category.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {category.type === "INCOME" ? "Ingreso" : "Gasto"}
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => startEdit(category)}
                  className="rounded-lg px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  Editar
                </button>
                {!category.isDefault && (
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="rounded-lg px-2 py-1 text-xs text-destructive hover:bg-destructive/10"
                  >
                    Eliminar
                  </button>
                )}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="col-span-full text-sm text-muted-foreground">
              No hay categorías para mostrar.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
