"use client";

import { useEffect, useState } from "react";
import { getDashboardData } from "./actions";
import type { DashboardSummary, ExpenseByCategory } from "@/lib/services/dashboard.service";
import Link from "next/link";

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export default function DashboardClient({ userId }: { userId: string }) {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [expenses, setExpenses] = useState<ExpenseByCategory[]>([]);
  const [recent, setRecent] = useState<Awaited<ReturnType<typeof getDashboardData>>["recent"]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate] = useState(() => new Date());

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getDashboardData();
        setSummary(data.summary);
        setExpenses(data.expenses);
        setRecent(data.recent);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [userId, currentDate]);

  const formatMoney = (amount: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(amount);

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat("es-CO", { day: "2-digit", month: "short" }).format(date);

  if (loading) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16">
        <p className="text-sm text-muted-foreground">Cargando dashboard...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">
          {MONTHS[currentDate.getMonth()]}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Resumen financiero de {currentDate.getFullYear()}
        </p>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Saldo total</p>
          <p className="mt-1 text-lg font-semibold text-foreground">
            {summary ? formatMoney(summary.totalBalance) : "-"}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Ingresos del mes</p>
          <p className="mt-1 text-lg font-semibold text-success">
            {summary ? formatMoney(summary.monthlyIncome) : "-"}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Gastos del mes</p>
          <p className="mt-1 text-lg font-semibold text-destructive">
            {summary ? formatMoney(summary.monthlyExpenses) : "-"}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Ahorro del mes</p>
          <p className="mt-1 text-lg font-semibold text-foreground">
            {summary ? formatMoney(summary.monthlySavings) : "-"}
          </p>
{summary && summary.monthlyIncome > 0 && (
  <p className="text-xs text-muted-foreground">{summary.savingsRate}% de ahorro</p>
)}
        </div>
      </div>

      <div className="mb-8 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-2 text-lg font-medium text-foreground">Dinero disponible</h2>
        <p className="text-3xl font-bold text-foreground">
          {summary ? formatMoney(summary.availableToSpend) : "-"}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Este es tu saldo líquido actual. Ten en cuenta tus obligaciones pendientes antes de gastar.
        </p>
      </div>

      {expenses.length > 0 && (
        <div className="mb-8 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-medium text-foreground">Gastos por categoría</h2>
          <div className="space-y-3">
            {expenses.map((expense) => (
              <div key={expense.categoryId} className="flex items-center gap-3">
                <span className="text-lg">{expense.categoryIcon || "📁"}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-foreground">{expense.categoryName}</span>
                    <span className="font-medium text-foreground">
                      {formatMoney(expense.amount)}
                    </span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{ width: `${Math.min(expense.percentage, 100)}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">{expense.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-medium text-foreground">Movimientos recientes</h2>
          <Link
            href="/transactions"
            className="text-sm font-medium text-primary hover:underline"
          >
            Ver todos
          </Link>
        </div>

        {recent.length === 0 ? (
          <p className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground shadow-sm">
            Aún no tienes transacciones.{" "}
            <Link href="/transactions" className="text-primary underline">
              Registra tu primer movimiento
            </Link>
            .
          </p>
        ) : (
          <div className="space-y-3">
            {recent.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between rounded-xl border border-border bg-card p-4 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-lg"
                    style={{
                      backgroundColor: tx.category.color ? `${tx.category.color}20` : undefined,
                    }}
                  >
                    {tx.category.icon || "📁"}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-foreground">{tx.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {tx.category.name} · {tx.account.name} · {formatDate(tx.date)}
                    </p>
                  </div>
                </div>
                <p
                  className={`text-sm font-semibold ${
                    tx.type === "EXPENSE" ? "text-destructive" : "text-success"
                  }`}
                >
                  {tx.type === "EXPENSE" ? "-" : "+"} {formatMoney(tx.amount)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link
          href="/transactions"
          className="rounded-2xl border border-border bg-card p-6 text-center shadow-sm transition hover:bg-muted"
        >
          <p className="text-2xl">💸</p>
          <p className="mt-2 text-sm font-medium text-foreground">Transacciones</p>
          <p className="text-xs text-muted-foreground">Registra ingresos y gastos</p>
        </Link>
        <Link
          href="/accounts"
          className="rounded-2xl border border-border bg-card p-6 text-center shadow-sm transition hover:bg-muted"
        >
          <p className="text-2xl">🏦</p>
          <p className="mt-2 text-sm font-medium text-foreground">Cuentas</p>
          <p className="text-xs text-muted-foreground">Administra tus cuentas</p>
        </Link>
        <Link
          href="/categories"
          className="rounded-2xl border border-border bg-card p-6 text-center shadow-sm transition hover:bg-muted"
        >
          <p className="text-2xl">🏷️</p>
          <p className="mt-2 text-sm font-medium text-foreground">Categorías</p>
          <p className="text-xs text-muted-foreground">Organiza por categoría</p>
        </Link>
      </div>
    </main>
  );
}
