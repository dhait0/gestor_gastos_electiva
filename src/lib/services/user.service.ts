import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import type { Role } from "@/types/role";

export type UserListItem = {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  authProvider: string;
  createdAt: Date;
  accountCount: number;
};

export async function listUsers(): Promise<UserListItem[]> {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      authProvider: true,
      createdAt: true,
      _count: {
        select: { accounts: true },
      },
    },
  });

  return users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    authProvider: u.authProvider,
    createdAt: u.createdAt,
    accountCount: u._count.accounts,
  }));
}

export async function adminCreateUser(input: {
  name?: string;
  email: string;
  password: string;
  role: Role;
}) {
  const email = input.email.toLowerCase().trim();
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    throw new Error("El correo ya está registrado.");
  }

  const passwordHash = await bcrypt.hash(input.password, 10);

  await prisma.user.create({
    data: {
      email,
      name: input.name ?? null,
      passwordHash,
      role: input.role,
      authProvider: "EMAIL",
      currency: "COP",
      timezone: "America/Bogota",
    },
  });
}

export async function setUserRole(id: string, role: Role) {
  await prisma.user.update({
    where: { id },
    data: { role },
  });
}

export async function deleteUserById(id: string) {
  await prisma.user.delete({
    where: { id },
  });
}

export async function getUserRole(id: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { role: true },
  });
  return user?.role ?? null;
}

export async function countAdmins(): Promise<number> {
  return prisma.user.count({ where: { role: "ADMIN" } });
}
