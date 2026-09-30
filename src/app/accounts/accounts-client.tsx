"use client";

import { useEffect, useState } from "react";
import { getAccounts, createAccountAction, updateAccountAction, deleteAccountAction } from "./actions";
import type { FinancialAccount, AccountType } from "@/lib/services/account.service";

const ACCOUNT_TYPES = [
  { value: "CASH", label: "Efectivo" },
  { value: "CHECKING", label: "Cuenta corriente" },
  { value: "SAVINGS", label: "Ahorros" },
  { value: "CREDIT_CARD", label: "Tarjeta de crédito" },
  { value: "DIGITAL_WALLET", label: "Billetera digital" },
  { value: "OTHER", label: "Otro" },
];

export default function AccountsClient({ userId }: { userId: string }) {
  const [accounts, setAccounts] = useState<FinancialAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    type: "CHECKING" as AccountType,
    initialBalance: "",
    currency: "COP",
    color: "",
    icon: "",
    creditLimit: "",
    paymentDay: "",
  });

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await getAccounts();
      setAccounts(data);
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
      const res = await updateAccountAction(editingId, { error: undefined }, new FormData(e.target as HTMLFormElement));
      if (res?.error) {
        setFormError(res.error);
        setSubmitting(false);
        return;
      }
      setEditingId(null);
    } else {
      const res = await createAccountAction({ error: undefined }, new FormData(e.target as HTMLFormElement));
      if (res?.error) {
        setFormError(res.error);
        setSubmitting(false);
        return;
      }
    }

    setForm({
      name: "",
      type: "CHECKING",
      initialBalance: "",
      currency: "COP",
      color: "",
      icon: "",
      creditLimit: "",
      paymentDay: "",
    });
    setSubmitting(false);
    await load();
  }

  function startEdit(account: FinancialAccount) {
    setEditingId(account.id);
    setForm({
      name: account.name,
      type: account.type,
      initialBalance: String(account.initialBalance),
      currency: account.currency,
      color: account.color ?? "",
      icon: account.icon ?? "",
      creditLimit: account.creditLimit !== null ? String(account.creditLimit) : "",
      paymentDay: account.paymentDay !== null ? String(account.paymentDay) : "",
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm({
      name: "",
      type: "CHECKING",
      initialBalance: "",
      currency: "COP",
      color: "",
      icon: "",
      creditLimit: "",
      paymentDay: "",
    });
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta cuenta?")) return;
    await deleteAccountAction(id);
    await load();
  }

  const formatMoney = (amount: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(amount);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Cuentas</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Administra tus cuentas bancarias, efectivo y tarjetas.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mb-8 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-medium text-foreground">
          {editingId ? "Editar cuenta" : "Nueva cuenta"}
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
              placeholder="Ej: Bancolombia"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Tipo</label>
            <select
              name="type"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as AccountType })}
              className="w-full rounded-lg border border-input px-3 py-2 text-sm outline-none focus:border-primary bg-background"
            >
              {ACCOUNT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Saldo inicial</label>
            <input
              type="number"
              name="initialBalance"
              required
              min={0}
              value={form.initialBalance}
              onChange={(e) => setForm({ ...form, initialBalance: e.target.value })}
              className="w-full rounded-lg border border-input px-3 py-2 text-sm outline-none focus:border-primary"
              placeholder="0"
            />
          </div>

          {form.type === "CREDIT_CARD" && (
            <>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Límite de crédito</label>
                <input
                  type="number"
                  name="creditLimit"
                  min={0}
                  value={form.creditLimit}
                  onChange={(e) => setForm({ ...form, creditLimit: e.target.value })}
                  className="w-full rounded-lg border border-input px-3 py-2 text-sm outline-none focus:border-primary"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Día de pago</label>
                <input
                  type="number"
                  name="paymentDay"
                  min={1}
                  max={31}
                  value={form.paymentDay}
                  onChange={(e) => setForm({ ...form, paymentDay: e.target.value })}
                  className="w-full rounded-lg border border-input px-3 py-2 text-sm outline-none focus:border-primary"
                  placeholder="15"
                />
              </div>
            </>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Color</label>
            <input
              type="color"
              name="color"
              value={form.color || "#f97316"}
              onChange={(e) => setForm({ ...form, color: e.target.value })}
              className="h-10 w-full rounded-lg border border-input px-1 py-1"
            />
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
              placeholder="💳"
            />
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
          >
            {editingId ? "Guardar" : "Crear cuenta"}
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => (
            <div
              key={account.id}
              className="rounded-2xl border border-border bg-card p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{account.icon || "💰"}</span>
                    <h3 className="font-medium text-foreground">{account.name}</h3>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {ACCOUNT_TYPES.find((t) => t.value === account.type)?.label}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => startEdit(account)}
                    className="rounded-lg px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(account.id)}
                    className="rounded-lg px-2 py-1 text-xs text-destructive hover:bg-destructive/10"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
              <p className="mt-4 text-xl font-semibold text-foreground">
                {formatMoney(account.currentBalance)}
              </p>
              {account.type === "CREDIT_CARD" && account.creditLimit !== null && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Disponible: {formatMoney(account.availableCredit ?? 0)}
                </p>
              )}
            </div>
          ))}
          {accounts.length === 0 && (
            <p className="col-span-full text-sm text-muted-foreground">
              Aún no tienes cuentas. Crea tu primera cuenta para comenzar.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
