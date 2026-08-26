"use client";

import { useEffect, useState } from "react";
import { getTransactions, getAccounts, getCategories, createTransactionAction, updateTransactionAction, deleteTransactionAction } from "./actions";
import type { Transaction } from "@/lib/services/transaction.service";
import type { FinancialAccount } from "@/lib/services/account.service";
import type { Category } from "@/lib/services/category.service";

const TRANSACTION_TYPES = [
  { value: "INCOME", label: "Ingreso" },
  { value: "EXPENSE", label: "Gasto" },
  { value: "TRANSFER", label: "Transferencia" },
] as const;

export default function TransactionsClient({ userId }: { userId: string }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<FinancialAccount[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    accountId: "",
    categoryId: "",
    type: "EXPENSE" as "INCOME" | "EXPENSE" | "TRANSFER",
    amount: "",
    description: "",
    date: new Date().toISOString().slice(0, 10),
    notes: "",
    isRecurring: false,
  });

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [txData, accData, catData] = await Promise.all([
        getTransactions(),
        getAccounts(),
        getCategories(),
      ]);
      setTransactions(txData);
      setAccounts(accData);
      setCategories(catData);
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
      const res = await updateTransactionAction(editingId, { error: undefined }, new FormData(e.target as HTMLFormElement));
      if (res?.error) {
        setFormError(res.error);
        setSubmitting(false);
        return;
      }
      setEditingId(null);
    } else {
      const res = await createTransactionAction({ error: undefined }, new FormData(e.target as HTMLFormElement));
      if (res?.error) {
        setFormError(res.error);
        setSubmitting(false);
        return;
      }
    }

    setForm({
      accountId: "",
      categoryId: "",
      type: "EXPENSE",
      amount: "",
      description: "",
      date: new Date().toISOString().slice(0, 10),
      notes: "",
      isRecurring: false,
    });
    setSubmitting(false);
    await load();
  }

  function startEdit(tx: Transaction) {
    setEditingId(tx.id);
    setForm({
      accountId: tx.accountId,
      categoryId: tx.categoryId,
      type: tx.type,
      amount: String(tx.amount),
      description: tx.description,
      date: tx.date.toISOString().slice(0, 10),
      notes: tx.notes ?? "",
      isRecurring: tx.isRecurring,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm({
      accountId: "",
      categoryId: "",
      type: "EXPENSE",
      amount: "",
      description: "",
      date: new Date().toISOString().slice(0, 10),
      notes: "",
      isRecurring: false,
    });
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta transacción?")) return;
    await deleteTransactionAction(id);
    await load();
  }

  const formatMoney = (amount: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(amount);

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat("es-CO", { day: "2-digit", month: "short", year: "numeric" }).format(date);

  const getCategory = (id: string) => categories.find((c) => c.id === id);
  const getAccount = (id: string) => accounts.find((a) => a.id === id);

  const expenseCategories = categories.filter((c) => c.type === "EXPENSE");
  const incomeCategories = categories.filter((c) => c.type === "INCOME");
  const filteredCategories = form.type === "EXPENSE" ? expenseCategories : form.type === "INCOME" ? incomeCategories : categories;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Transacciones</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Registra tus ingresos, gastos y transferencias.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mb-8 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-medium text-foreground">
          {editingId ? "Editar transacción" : "Nueva transacción"}
        </h2>

        {formError && <p className="mb-4 text-sm text-destructive">{formError}</p>}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Tipo</label>
            <select
              name="type"
              value={form.type}
              onChange={(e) => {
                const newType = e.target.value as "INCOME" | "EXPENSE" | "TRANSFER";
                const currentCategory = categories.find((c) => c.id === form.categoryId);
                const valid = !currentCategory || currentCategory.type === newType || newType === "TRANSFER";
                setForm({
                  ...form,
                  type: newType,
                  categoryId: valid ? form.categoryId : "",
                });
              }}
              className="w-full rounded-lg border border-input px-3 py-2 text-sm outline-none focus:border-primary bg-background"
            >
              {TRANSACTION_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Cuenta</label>
            <select
              name="accountId"
              required
              value={form.accountId}
              onChange={(e) => setForm({ ...form, accountId: e.target.value })}
              className="w-full rounded-lg border border-input px-3 py-2 text-sm outline-none focus:border-primary bg-background"
            >
              <option value="">Selecciona una cuenta</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({formatMoney(a.currentBalance)})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Categoría</label>
            <select
              name="categoryId"
              required
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              className="w-full rounded-lg border border-input px-3 py-2 text-sm outline-none focus:border-primary bg-background"
            >
              <option value="">Selecciona una categoría</option>
              {filteredCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Monto</label>
            <input
              type="number"
              name="amount"
              required
              min={1}
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="w-full rounded-lg border border-input px-3 py-2 text-sm outline-none focus:border-primary"
              placeholder="0"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-foreground">Descripción</label>
            <input
              type="text"
              name="description"
              required
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full rounded-lg border border-input px-3 py-2 text-sm outline-none focus:border-primary"
              placeholder="Ej: Almuerzo"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Fecha</label>
            <input
              type="date"
              name="date"
              required
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full rounded-lg border border-input px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Notas</label>
            <input
              type="text"
              name="notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full rounded-lg border border-input px-3 py-2 text-sm outline-none focus:border-primary"
              placeholder="Opcional"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isRecurring"
              id="isRecurring"
              checked={form.isRecurring}
              onChange={(e) => setForm({ ...form, isRecurring: e.target.checked })}
              className="h-4 w-4 rounded border-border"
            />
            <label htmlFor="isRecurring" className="text-sm text-foreground">
              Transacción recurrente
            </label>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
          >
            {editingId ? "Guardar" : "Crear transacción"}
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

      {loading && <p className="text-sm text-muted-foreground">Cargando...</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}

      {!loading && !error && (
        <div className="space-y-3">
          {transactions.map((tx) => {
            const category = getCategory(tx.categoryId);
            const account = getAccount(tx.accountId);
            const isExpense = tx.type === "EXPENSE";

            return (
              <div
                key={tx.id}
                className="flex items-center justify-between rounded-xl border border-border bg-card p-4 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-lg"
                    style={{ backgroundColor: category?.color ? `${category.color}20` : undefined }}
                  >
                    {category?.icon || "📁"}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-foreground">{tx.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {category?.name} · {account?.name} · {formatDate(tx.date)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className={`text-sm font-semibold ${isExpense ? "text-destructive" : "text-success"}`}>
                    {isExpense ? "-" : "+"} {formatMoney(tx.amount)}
                  </p>
                  <div className="flex gap-1">
                    <button
                      onClick={() => startEdit(tx)}
                      className="rounded-lg px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(tx.id)}
                      className="rounded-lg px-2 py-1 text-xs text-destructive hover:bg-destructive/10"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {transactions.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Aún no tienes transacciones. Registra tu primer ingreso o gasto para comenzar.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
