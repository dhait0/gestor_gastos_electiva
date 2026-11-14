import { describe, it, expect } from "vitest";
import { toDomainTransactions } from "@/lib/supabase/transactions";
import { calculateMonthlyIncomeExpense } from "@/domain/transactions";

describe("toDomainTransactions", () => {
  it("conserva transaction_date y category_id de la fila", () => {
    const [t] = toDomainTransactions(
      [
        {
          id: "t1",
          account_id: "a1",
          category_id: "c1",
          type: "EXPENSE",
          direction: "OUTFLOW",
          amount: "10",
          currency_code: "COP",
          transaction_date: "2026-03-05",
          deleted_at: null,
        },
      ],
      "u1"
    );
    expect(t.transaction_date).toBe("2026-03-05");
    expect(t.category_id).toBe("c1");
  });

  it("regresión F01: un gasto de otro mes no cuenta en el mes actual", () => {
    const rows = toDomainTransactions(
      [
        {
          id: "old",
          account_id: "a1",
          category_id: null,
          type: "EXPENSE",
          direction: "OUTFLOW",
          amount: "500",
          currency_code: "COP",
          transaction_date: "2026-01-15",
          deleted_at: null,
        },
        {
          id: "now",
          account_id: "a1",
          category_id: null,
          type: "EXPENSE",
          direction: "OUTFLOW",
          amount: "20",
          currency_code: "COP",
          transaction_date: "2026-11-03",
          deleted_at: null,
        },
      ],
      "u1"
    );
    const { expense } = calculateMonthlyIncomeExpense(rows, "COP", "America/Bogota", new Date("2026-11-14T12:00:00Z"));
    expect(expense.toString()).toBe("20");
  });
});
