import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = await prisma.propertyImport.findUnique({
    where: { id },
    select: { id: true, status: true, strategy: true, provider: true, retryCount: true, errorMessage: true, propertyId: true, createdAt: true, updatedAt: true },
  });
  if (!job) return Response.json({ error: "Importación no encontrada." }, { status: 404 });
  return Response.json(job);
}
