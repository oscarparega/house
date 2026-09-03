"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { canonicalizeListingUrl } from "@/lib/property-input";

const optionalText = z.string().trim().transform((value) => value || null);
const optionalNumber = z.string().trim().transform((value, context) => {
  if (!value) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    context.addIssue({ code: "custom", message: "Debe ser un número positivo." });
    return z.NEVER;
  }
  return parsed;
});
const optionalInteger = optionalNumber.pipe(z.number().int().nullable());

const editorSchema = z.object({
  id: z.string().min(1),
  sourceProvider: z.string().trim().min(1),
  sourceUrl: z.url(),
  sourceListingId: optionalText,
  sourceListingKey: optionalText,
  title: z.string().trim().min(1),
  description: optionalText,
  propertyType: z.enum(["APARTMENT", "HOUSE", "LAND", "OTHER"]),
  priceAmount: optionalNumber,
  priceCurrency: z.string().trim().toUpperCase().length(3).or(z.literal("")),
  street: optionalText,
  exteriorNumber: optionalText,
  interiorNumber: optionalText,
  neighborhood: optionalText,
  municipality: optionalText,
  state: optionalText,
  postalCode: optionalText,
  countryCode: z.string().trim().toUpperCase().length(2),
  formattedAddress: optionalText,
  latitude: z.string().trim().transform((value) => (value ? Number(value) : null)).pipe(z.number().min(-90).max(90).nullable()),
  longitude: z.string().trim().transform((value) => (value ? Number(value) : null)).pipe(z.number().min(-180).max(180).nullable()),
  landAreaM2: optionalNumber,
  constructionAreaM2: optionalNumber,
  bedrooms: optionalInteger,
  bathrooms: optionalNumber,
  parkingSpaces: optionalInteger,
  parkingType: optionalText,
  serviceRoom: z.enum(["", "true", "false"]),
  propertyAgeYears: optionalInteger,
  condition: optionalText,
  orientation: optionalText,
  landUse: optionalText,
  buildingLevels: optionalInteger,
  unitFloor: optionalInteger,
  maintenanceAmount: optionalNumber,
  maintenanceCurrency: z.string().trim().toUpperCase().length(3).or(z.literal("")),
  technicalSheetQrUrl: z.string().trim().url().or(z.literal("")),
  agentName: optionalText,
  agentAvatarUrl: z.string().trim().url().or(z.literal("")),
  agentPhones: z.string(),
  agentEmail: z.string().trim().email().or(z.literal("")),
  officeName: optionalText,
  sourceOfficeId: optionalText,
  decisionStatus: z.enum(["NEW", "INTERESTED", "CONTACTED", "VISIT_SCHEDULED", "VISITED", "OFFER_MADE", "REJECTED", "PURCHASED"]),
  rating: z.string().transform((value) => (value ? Number(value) : null)).pipe(z.number().int().min(1).max(5).nullable()),
  notes: optionalText,
  visitAt: z.string().transform((value) => (value ? new Date(value) : null)).pipe(z.date().nullable()),
  rejectionReason: optionalText,
  sourceMetadata: z.string().transform((value, context) => {
    try {
      return JSON.parse(value) as unknown;
    } catch {
      context.addIssue({ code: "custom", message: "Los metadatos deben ser JSON válido." });
      return z.NEVER;
    }
  }),
  images: z.string(),
  areaFeatures: z.string(),
  equipmentFeatures: z.string(),
  otherFeatures: z.string(),
});

function lines(value: string) {
  return [...new Set(value.split("\n").map((line) => line.trim()).filter(Boolean))];
}

export async function savePropertyAction(formData: FormData) {
  const parsed = editorSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Datos inválidos.");
  }
  const data = parsed.data;
  if ((data.latitude === null) !== (data.longitude === null)) {
    throw new Error("Latitud y longitud deben capturarse juntas.");
  }

  const featureRows = [
    ...lines(data.areaFeatures).map((name) => ({ category: "AREA" as const, name })),
    ...lines(data.equipmentFeatures).map((name) => ({ category: "EQUIPMENT" as const, name })),
    ...lines(data.otherFeatures).map((name) => ({ category: "OTHER" as const, name })),
  ];
  const imageRows = lines(data.images).map((url, sortOrder) => ({ url, sortOrder }));

  await prisma.property.update({
    where: { id: data.id },
    data: {
      sourceProvider: data.sourceProvider,
      sourceUrl: canonicalizeListingUrl(data.sourceUrl),
      sourceListingId: data.sourceListingId,
      sourceListingKey: data.sourceListingKey,
      sourceMetadata: data.sourceMetadata as Prisma.InputJsonValue,
      title: data.title,
      description: data.description,
      propertyType: data.propertyType,
      priceAmount: data.priceAmount,
      priceCurrency: data.priceCurrency || null,
      street: data.street,
      exteriorNumber: data.exteriorNumber,
      interiorNumber: data.interiorNumber,
      neighborhood: data.neighborhood,
      municipality: data.municipality,
      state: data.state,
      postalCode: data.postalCode,
      countryCode: data.countryCode,
      formattedAddress: data.formattedAddress,
      latitude: data.latitude,
      longitude: data.longitude,
      landAreaM2: data.landAreaM2,
      constructionAreaM2: data.constructionAreaM2,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      parkingSpaces: data.parkingSpaces,
      parkingType: data.parkingType,
      serviceRoom: data.serviceRoom === "" ? null : data.serviceRoom === "true",
      propertyAgeYears: data.propertyAgeYears,
      condition: data.condition,
      orientation: data.orientation,
      landUse: data.landUse,
      buildingLevels: data.buildingLevels,
      unitFloor: data.unitFloor,
      maintenanceAmount: data.maintenanceAmount,
      maintenanceCurrency: data.maintenanceCurrency || null,
      technicalSheetQrUrl: data.technicalSheetQrUrl || null,
      agentName: data.agentName,
      agentAvatarUrl: data.agentAvatarUrl || null,
      agentPhones: lines(data.agentPhones),
      agentEmail: data.agentEmail || null,
      officeName: data.officeName,
      sourceOfficeId: data.sourceOfficeId,
      decisionStatus: data.decisionStatus,
      rating: data.rating,
      notes: data.notes,
      visitAt: data.visitAt,
      rejectionReason: data.rejectionReason,
      images: { deleteMany: {}, create: imageRows },
      features: { deleteMany: {}, create: featureRows },
    },
  });
  revalidatePath("/");
  revalidatePath(`/properties/${data.id}`);
}

const decisionSchema = z.object({
  id: z.string().min(1),
  decisionStatus: z.enum(["NEW", "INTERESTED", "CONTACTED", "VISIT_SCHEDULED", "VISITED", "OFFER_MADE", "REJECTED", "PURCHASED"]),
  rating: z.string().transform((value) => (value ? Number(value) : null)).pipe(z.number().int().min(1).max(5).nullable()),
  visitAt: z.string().transform((value) => (value ? new Date(value) : null)).pipe(z.date().nullable()),
  notes: optionalText,
  rejectionReason: optionalText,
});

export async function saveDecisionAction(formData: FormData) {
  const parsed = decisionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Datos de decisión inválidos.");
  }
  const data = parsed.data;
  await prisma.property.update({
    where: { id: data.id },
    data: {
      decisionStatus: data.decisionStatus,
      isFavorite: formData.get("isFavorite") === "on",
      rating: data.rating,
      visitAt: data.visitAt,
      notes: data.notes,
      rejectionReason: data.rejectionReason,
      archivedAt: formData.get("archived") === "on" ? new Date() : null,
    },
  });
  revalidatePath("/");
  revalidatePath(`/properties/${data.id}`);
}

export async function toggleFavoriteAction(id: string) {
  const property = await prisma.property.findUniqueOrThrow({
    where: { id },
    select: { isFavorite: true },
  });
  await prisma.property.update({
    where: { id },
    data: { isFavorite: !property.isFavorite },
  });
  revalidatePath("/");
  revalidatePath(`/properties/${id}`);
}

export async function setArchivedAction(id: string, archived: boolean) {
  await prisma.property.update({
    where: { id },
    data: { archivedAt: archived ? new Date() : null },
  });
  revalidatePath("/");
  revalidatePath(`/properties/${id}`);
}
