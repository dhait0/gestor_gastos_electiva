import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EditAccountForm } from "@/components/accounts/EditAccountForm";
import { getAccountsAction } from "@/app/actions/accounts";

export default async function EditarCuentaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: accounts } = await getAccountsAction({ includeArchived: true });
  const account = accounts?.find((a) => a.id === id);

  if (!account) {
    return (
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-destructive">Cuenta no encontrada</p>
          <Link href="/cuentas" className="mt-4 inline-block">
            <Button variant="outline">Volver a cuentas</Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-2xl">
        <EditAccountForm initialData={account} />
      </div>
    </main>
  );
}
