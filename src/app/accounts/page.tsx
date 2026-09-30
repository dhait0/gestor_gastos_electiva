import { redirect } from "next/navigation";
import { auth } from "@/auth";
import AccountsClient from "./accounts-client";

export default async function AccountsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return <AccountsClient userId={session.user.id} />;
}
