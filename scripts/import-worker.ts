try {
  process.loadEnvFile(".env");
} catch (error) {
  if (!(error instanceof Error) || !("code" in error) || error.code !== "ENOENT") throw error;
}

const { processNextImport, recoverStaleImports } = await import("../src/lib/import-jobs");
const { prisma } = await import("../src/lib/prisma");

let stopping = false;
process.on("SIGINT", () => { stopping = true; });
process.on("SIGTERM", () => { stopping = true; });

await recoverStaleImports();
while (!stopping) {
  const processed = await processNextImport();
  if (!processed) await new Promise((resolve) => setTimeout(resolve, 2_000));
}
await prisma.$disconnect();

export {};
