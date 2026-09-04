import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { extractProperty } from "@/lib/import-extraction";
import { upsertProperty } from "@/lib/property-store";

function monthStart() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

async function budgets() {
  const [usage, aiCalls] = await Promise.all([
    prisma.propertyImport.aggregate({ where: { createdAt: { gte: monthStart() } }, _sum: { firecrawlCredits: true } }),
    prisma.propertyImport.count({ where: { createdAt: { gte: monthStart() }, inputTokens: { not: null } } }),
  ]);
  return {
    allowFirecrawl: (usage._sum.firecrawlCredits ?? 0) < Number(process.env.FIRECRAWL_CREDIT_LIMIT_MONTHLY ?? 500),
    allowAi: aiCalls < Number(process.env.OPENAI_IMPORT_LIMIT_MONTHLY ?? 100),
  };
}

export async function processImportJob(id: string) {
  const claimed = await prisma.propertyImport.updateMany({
    where: { id, status: "QUEUED" },
    data: { status: "FETCHING", processingStartedAt: new Date(), errorMessage: null },
  });
  if (!claimed.count) return false;

  const job = await prisma.propertyImport.findUniqueOrThrow({ where: { id } });
  try {
    const result = await extractProperty(job.canonicalUrl, await budgets());
    await prisma.propertyImport.update({ where: { id }, data: { status: "EXTRACTING", strategy: result.strategy, provider: result.provider, firecrawlCredits: result.firecrawlCredits } });
    const stored = await upsertProperty(prisma, result.input);
    await prisma.property.update({ where: { id: stored.property.id }, data: { publicationStatus: "DRAFT" } });
    await prisma.propertyImport.update({
      where: { id },
      data: {
        status: "READY", propertyId: stored.property.id,
        draftData: result.input as unknown as Prisma.InputJsonValue,
        evidence: result.evidence as Prisma.InputJsonValue,
        strategy: result.strategy, provider: result.provider,
        inputTokens: result.inputTokens, outputTokens: result.outputTokens,
        firecrawlCredits: result.firecrawlCredits, completedAt: new Date(),
      },
    });
    return true;
  } catch (error) {
    const retryCount = job.retryCount + 1;
    await prisma.propertyImport.update({
      where: { id },
      data: {
        retryCount,
        status: retryCount < 3 ? "QUEUED" : "FAILED",
        errorMessage: error instanceof Error ? error.message.slice(0, 500) : "Error desconocido durante la importación.",
        processingStartedAt: null,
        completedAt: retryCount < 3 ? null : new Date(),
      },
    });
    return false;
  }
}

export async function recoverStaleImports() {
  const cutoff = new Date(Date.now() - 5 * 60_000);
  await prisma.propertyImport.updateMany({
    where: { status: { in: ["FETCHING", "RENDERING", "EXTRACTING"] }, processingStartedAt: { lt: cutoff } },
    data: { status: "QUEUED", processingStartedAt: null, errorMessage: "Trabajo recuperado después de una interrupción." },
  });
}

export async function processNextImport() {
  const next = await prisma.propertyImport.findFirst({ where: { status: "QUEUED" }, orderBy: { createdAt: "asc" }, select: { id: true } });
  if (!next) return false;
  await processImportJob(next.id);
  return true;
}
