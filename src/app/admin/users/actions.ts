"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import {
  adminCreateUser,
  setUserRole,
  deleteUserById,
  countAdmins,
  getUserRole,
} from "@/lib/services/user.service";
import type { Role } from "@/types/role";

async function assertAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("No autorizado");
  }
  return session;
}

const createSchema = z.object({
  name: z.string().trim().max(80).optional(),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  role: z.enum(["USER", "ADMIN"]),
});

export async function createUser(
  _prev: { error?: string },
  formData: FormData,
): Promise<{ error?: string }> {
  await assertAdmin();

  const parsed = createSchema.safeParse({
    name: formData.get("name") ?? undefined,
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return {
      error:
        "Datos inválidos. Verifica el correo y usa una contraseña de al menos 8 caracteres.",
    };
  }

  try {
    await adminCreateUser({
      name: parsed.data.name,
      email: parsed.data.email,
      password: parsed.data.password,
      role: parsed.data.role as Role,
    });
  } catch (e) {
    return { error: (e as Error).message };
  }

  revalidatePath("/admin/users");
  return { error: undefined };
}

export async function updateUserRole(
  id: string,
  role: Role,
  _formData: FormData,
) {
  const session = await assertAdmin();
  if (session.user.id === id) return; // no cambiarse a sí mismo
  await setUserRole(id, role);
  revalidatePath("/admin/users");
}

export async function deleteUser(id: string, _formData: FormData) {
  const session = await assertAdmin();
  if (session.user.id === id) return; // no borrarse a sí mismo

  const role = await getUserRole(id);
  if (role === "ADMIN" && (await countAdmins()) <= 1) {
    return; // mantener al menos un administrador
  }

  await deleteUserById(id);
  revalidatePath("/admin/users");
}
