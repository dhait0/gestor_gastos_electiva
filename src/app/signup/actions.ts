"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  email: z.string().email(),
  name: z.string().trim().max(80).optional(),
  password: z.string().min(8).max(100),
});

export async function registerUser(input: {
  email: string;
  name?: string;
  password: string;
}) {
  const parsed = schema.safeParse(input);

  if (!parsed.success) {
    return {
      error:
        "Verifica el correo y usa una contraseña de al menos 8 caracteres.",
    };
  }

  const email = parsed.data.email.toLowerCase().trim();

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    return { error: "Ya existe una cuenta con ese correo." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  await prisma.user.create({
    data: {
      email,
      name: parsed.data.name || null,
      passwordHash,
      authProvider: "EMAIL",
      currency: "COP",
      timezone: "America/Bogota",
    },
  });

  return { error: undefined as string | undefined };
}
