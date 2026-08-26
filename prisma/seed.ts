import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { Role } from "../src/types/role";

const prisma = new PrismaClient();

const DEFAULT_CATEGORIES = [
  { name: "Alimentación", type: "EXPENSE" as const, icon: "🍔", color: "#f97316" },
  { name: "Transporte", type: "EXPENSE" as const, icon: "🚗", color: "#3b82f6" },
  { name: "Vivienda", type: "EXPENSE" as const, icon: "🏠", color: "#8b5cf6" },
  { name: "Servicios", type: "EXPENSE" as const, icon: "💡", color: "#eab308" },
  { name: "Entretenimiento", type: "EXPENSE" as const, icon: "🎬", color: "#ec4899" },
  { name: "Salud", type: "EXPENSE" as const, icon: "🏥", color: "#10b981" },
  { name: "Educación", type: "EXPENSE" as const, icon: "📚", color: "#6366f1" },
  { name: "Compras", type: "EXPENSE" as const, icon: "🛒", color: "#f43f5e" },
  { name: "Deudas", type: "EXPENSE" as const, icon: "💳", color: "#64748b" },
  { name: "Suscripciones", type: "EXPENSE" as const, icon: "🔄", color: "#06b6d4" },
  { name: "Viajes", type: "EXPENSE" as const, icon: "✈️", color: "#0ea5e9" },
  { name: "Otros", type: "EXPENSE" as const, icon: "📦", color: "#94a3b8" },
  { name: "Salario", type: "INCOME" as const, icon: "💰", color: "#059669" },
  { name: "Freelance", type: "INCOME" as const, icon: "💻", color: "#10b981" },
  { name: "Negocio", type: "INCOME" as const, icon: "🏢", color: "#3b82f6" },
  { name: "Inversiones", type: "INCOME" as const, icon: "📈", color: "#8b5cf6" },
  { name: "Regalos", type: "INCOME" as const, icon: "🎁", color: "#ec4899" },
  { name: "Otros ingresos", type: "INCOME" as const, icon: "💵", color: "#64748b" },
];

async function seedAdmin() {
  const adminEmail = (process.env.ADMIN_EMAIL ?? "admin@finwise.dev").toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD ?? "admin1234";
  const adminName = process.env.ADMIN_NAME ?? "Administrador";

  const existingAdmin = await prisma.user.findFirst({
    where: { role: "ADMIN" },
    select: { id: true },
  });

  if (existingAdmin) {
    console.log(`[seed] Ya existe un administrador: ${adminEmail}`);
    return existingAdmin.id;
  }

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.create({
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
  return admin.id;
}

async function seedCategories(userId: string) {
  const existing = await prisma.category.count({ where: { userId } });
  if (existing > 0) {
    console.log(`[seed] El usuario ${userId} ya tiene categorías.`);
    return;
  }

  await prisma.category.createMany({
    data: DEFAULT_CATEGORIES.map((c) => ({ ...c, userId, isDefault: true })),
  });

  console.log(`[seed] ${DEFAULT_CATEGORIES.length} categorías creadas para ${userId}`);
}

export async function runSeed(): Promise<void> {
  try {
    const adminId = await seedAdmin();
    await seedCategories(adminId);
    console.log("[seed] Completado.");
  } catch (error) {
    console.warn("[seed] Error:", (error as Error).message);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  runSeed();
}
