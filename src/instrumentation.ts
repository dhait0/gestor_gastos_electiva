export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { ensureAdminSeed } = await import("../prisma/seed");
    await ensureAdminSeed();
  }
}
