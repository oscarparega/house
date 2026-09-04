import { after } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { canonicalizeListingUrl } from "@/lib/property-input";
import { assertSafePublicUrl } from "@/lib/import-extraction";
import { processImportJob } from "@/lib/import-jobs";
import { auditMutation, protectExpensiveWrite } from "@/lib/public-write";

const requestSchema = z.object({ url: z.url(), turnstileToken: z.string().nullable().optional() });

export async function POST(request: Request) {
  try {
    const parsed = requestSchema.parse(await request.json());
    const canonicalUrl = canonicalizeListingUrl(parsed.url);
    await assertSafePublicUrl(canonicalUrl);

    const existing = await prisma.property.findUnique({ where: { sourceUrl: canonicalUrl }, select: { id: true, publicationStatus: true } });
    if (existing) return Response.json({ existing: true, propertyId: existing.id, publicationStatus: existing.publicationStatus });

    const active = await prisma.propertyImport.findFirst({
      where: { canonicalUrl, status: { in: ["QUEUED", "FETCHING", "RENDERING", "EXTRACTING"] } },
      orderBy: { createdAt: "desc" },
      select: { id: true, status: true },
    });
    if (active) return Response.json({ importId: active.id, status: active.status }, { status: 202 });

    const context = await protectExpensiveWrite("url-import", parsed.turnstileToken ?? null, request.headers);
    const job = await prisma.propertyImport.create({ data: { url: parsed.url, canonicalUrl } });
    await auditMutation("url-import", "import", job.id, context.ipHash);
    after(() => processImportJob(job.id));
    return Response.json({ importId: job.id, status: job.status }, { status: 202 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "No fue posible iniciar la importación." }, { status: 400 });
  }
}
