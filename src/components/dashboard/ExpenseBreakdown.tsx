interface Item {
  name: string;
  color: string | null;
  amount: string;
  percent: number;
}

export function ExpenseBreakdown({ items, periodLabel }: { items: Item[]; periodLabel: string }) {
  if (items.length === 0) {
    return (
      <p className="py-6 text-center text-muted-foreground">
        No hay gastos registrados en «{periodLabel.toLowerCase()}».
      </p>
    );
  }

  return (
    <ul className="space-y-4" role="list">
      {items.map((item) => (
        <li key={item.name}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="font-medium text-foreground">{item.name}</span>
            <span className="tabular-nums text-muted-foreground">
              {item.amount} · {item.percent}%
            </span>
          </div>
          <div
            className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-label={`${item.name}: ${item.percent}% del gasto`}
            aria-valuenow={item.percent}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full"
              style={{ width: `${item.percent}%`, backgroundColor: item.color || "#315CF5" }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
