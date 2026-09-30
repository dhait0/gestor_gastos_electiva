export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { runSeed } = await import("../prisma/seed");
    await runSeed();
  }
}
