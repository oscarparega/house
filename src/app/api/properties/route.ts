import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { propertyInputSchema } from "@/lib/property-input";
import { toPropertyDto, upsertProperty } from "@/lib/property-store";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "El cuerpo debe ser JSON válido." },
      { status: 400 },
    );
  }

  const parsed = propertyInputSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      {
        error: "La propiedad no cumple el contrato de ingestión.",
        details: z.treeifyError(parsed.error),
      },
      { status: 400 },
    );
  }

  try {
    const result = await upsertProperty(prisma, parsed.data);
    return Response.json(
      {
        action: result.action,
        property: toPropertyDto(result.property),
      },
      { status: result.action === "created" ? 201 : 200 },
    );
  } catch (error) {
    console.error("No fue posible guardar la propiedad", error);
    return Response.json(
      { error: "No fue posible guardar la propiedad." },
      { status: 500 },
    );
  }
}
