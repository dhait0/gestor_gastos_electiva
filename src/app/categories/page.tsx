import { redirect } from "next/navigation";
import { auth } from "@/auth";
import CategoriesClient from "./categories-client";

export default async function CategoriesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return <CategoriesClient userId={session.user.id} />;
}
