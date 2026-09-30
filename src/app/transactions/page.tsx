import { redirect } from "next/navigation";
import { auth } from "@/auth";
import TransactionsClient from "./transactions-client";

export default async function TransactionsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return <TransactionsClient userId={session.user.id} />;
}
