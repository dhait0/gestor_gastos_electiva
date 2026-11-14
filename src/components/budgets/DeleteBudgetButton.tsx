"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteBudgetAction } from "@/app/actions/budgets";

export function DeleteBudgetButton({ budgetId, categoryName }: { budgetId: string; categoryName: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!window.confirm(`¿Eliminar el presupuesto de ${categoryName}?`)) return;
    startTransition(async () => {
      await deleteBudgetAction(budgetId);
      router.refresh();
    });
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={handleDelete}
      disabled={isPending}
      aria-label={`Eliminar presupuesto de ${categoryName}`}
      className="text-muted-foreground hover:text-danger"
    >
      <Trash2 className="w-4 h-4" />
    </Button>
  );
}
