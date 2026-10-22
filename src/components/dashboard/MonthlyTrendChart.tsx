"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface Point {
  month: string;
  income: number;
  expense: number;
}

export function MonthlyTrendChart({ data }: { data: Point[] }) {
  const hasData = data.some((d) => d.income > 0 || d.expense > 0);

  if (!hasData) {
    return (
      <div className="h-48 flex items-center justify-center">
        <p className="text-muted-foreground text-center px-4">
          Aún no tienes movimientos en los últimos meses.
        </p>
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="income" name="Ingresos" fill="hsl(var(--success, 142 76% 36%))" />
          <Bar dataKey="expense" name="Gastos" fill="hsl(var(--danger, 0 84% 60%))" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
