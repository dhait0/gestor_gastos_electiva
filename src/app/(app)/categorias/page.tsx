import { cn } from "@/lib/utils";
import { Plus, Wallet, CreditCard, MoreHorizontal, Edit, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { getCategoriesAction } from "@/app/actions/categories";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { archiveCategoryAction } from "@/app/actions/categories";

interface Category {
  id: string;
  name: string;
  type: "INCOME" | "EXPENSE";
  color: string | null;
  icon: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
  deleted_at: string | null;
}

const categoryTypeIcons: Record<string, React.ElementType> = {
  INCOME: Wallet,
  EXPENSE: CreditCard,
};

const categoryTypeLabels: Record<string, string> = {
  INCOME: "Ingresos",
  EXPENSE: "Gastos",
};

export default async function CategoriasPage() {
  const { data: categories, error } = await getCategoriesAction();

  if (error) {
    return (
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-6 text-center">
            <p className="text-destructive">Error al cargar las categorías</p>
          </div>
        </div>
      </main>
    );
  }

  const categoryList = categories ?? [];
  const incomeCategories = categoryList.filter((c) => c.type === "INCOME");
  const expenseCategories = categoryList.filter((c) => c.type === "EXPENSE");

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-heading">
              Categorías
            </h1>
            <p className="text-muted-foreground mt-1">
              Organiza tus ingresos y gastos
            </p>
          </div>
          <Link href="/categorias/nueva">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nueva categoría
            </Button>
          </Link>
        </header>

        {categoryList.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <CreditCard className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground">Aún no tienes categorías</h3>
            <p className="mt-1 text-sm text-muted-foreground max-w-xs mx-auto">
              Crea categorías para clasificar tus ingresos y gastos.
            </p>
            <Link href="/categorias/nueva" className="mt-6 inline-block">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Crear primera categoría
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <section aria-labelledby="income-categories-heading" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 id="income-categories-heading" className="text-lg font-semibold text-foreground">
                  Ingresos ({incomeCategories.length})
                </h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {incomeCategories.map((category) => (
                  <CategoryCard key={category.id} category={category} />
                ))}
              </div>
            </section>

            <section aria-labelledby="expense-categories-heading" className="space-y-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <h2 id="expense-categories-heading" className="text-lg font-semibold text-foreground">
                  Gastos ({expenseCategories.length})
                </h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {expenseCategories.map((category) => (
                  <CategoryCard key={category.id} category={category} />
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

function CategoryCard({ category }: { category: Category }) {
  const Icon = categoryTypeIcons[category.type] || MoreHorizontal;

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("p-3 rounded-xl", category.color ? `bg-[${category.color}]/10` : "bg-primary/10")}>
              <Icon className={cn("w-5 h-5", category.color ? `text-[${category.color}]` : "text-primary")} />
            </div>
            <div>
              <CardTitle className="text-base font-medium truncate">{category.name}</CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{categoryTypeLabels[category.type]}</span>
                {category.is_default && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                    Default
                  </span>
                )}
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <Link href={`/categorias/${category.id}/editar`} className="block">
                <DropdownMenuItem className="flex items-center gap-2 px-2 py-1.5">
                  <Edit className="w-4 h-4" />
                  Editar
                </DropdownMenuItem>
              </Link>
              <DropdownMenuItem
                className="flex items-center gap-2 px-2 py-1.5 text-destructive focus:text-destructive"
                onClick={() => archiveCategory(category.id)}
              >
                <Archive className="w-4 h-4" />
                Archivar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        {category.icon && (
          <p className="text-xs text-muted-foreground">Icono: {category.icon}</p>
        )}
        {category.color && (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Color:</span>
            <div className="w-5 h-5 rounded border" style={{ backgroundColor: category.color }} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

async function archiveCategory(categoryId: string) {
  const result = await archiveCategoryAction(categoryId);
  if (result.error) {
    console.error("Error archiving category:", result.error);
  } else {
    window.location.reload();
  }
}