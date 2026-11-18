import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EditCategoryForm } from "@/components/categories/EditCategoryForm";
import { getCategoriesAction } from "@/app/actions/categories";

export default async function EditarCategoriaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: categories } = await getCategoriesAction();
  const category = categories?.find((c) => c.id === id);

  if (!category) {
    return (
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-destructive">Categoría no encontrada</p>
          <Link href="/categorias" className="mt-4 inline-block">
            <Button variant="outline">Volver a categorías</Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-2xl">
        <EditCategoryForm initialData={category} />
      </div>
    </main>
  );
}
