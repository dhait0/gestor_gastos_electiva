import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { Role } from "../src/types/role";

const prisma = new PrismaClient();

/**
 * Crea un usuario ADMIN la primera vez que la aplicación arranca.
 * Es idempotente: no hace nada si ya existe al menos un administrador.
 */
export async function ensureAdminSeed(): Promise<void> {
  const adminEmail = (
    process.env.ADMIN_EMAIL ?? "admin@finwise.dev"
  )
    .toLowerCase()
    .trim();
  const adminPassword = process.env.ADMIN_PASSWORD ?? "admin1234";
  const adminName = process.env.ADMIN_NAME ?? "Administrador";

  try {
    const existingAdmin = await prisma.user.findFirst({
      where: { role: "ADMIN" },
      select: { id: true },
    });

    if (existingAdmin) {
      return;
    }

    const passwordHash = await bcrypt.hash(adminPassword, 10);

    await prisma.user.create({
      data: {
        email: adminEmail,
        name: adminName,
        passwordHash,
        role: "ADMIN" as Role,
        authProvider: "EMAIL",
        currency: "COP",
        timezone: "America/Bogota",
      },
    });

    console.log(`[seed] Usuario administrador creado: ${adminEmail}`);
  } catch (error) {
    console.warn(
      "[seed] No se pudo crear el admin (¿ejecutaste `prisma db push`?):",
      (error as Error).message,
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutable directamente con `npm run db:seed`
if (require.main === module) {
  ensureAdminSeed();
}
