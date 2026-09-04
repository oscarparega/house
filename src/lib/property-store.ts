import type { Prisma, PrismaClient } from "@/generated/prisma/client";
import {
  canonicalizeListingUrl,
  type PropertyInput,
} from "@/lib/property-input";

const includeRelations = {
  images: { orderBy: { sortOrder: "asc" as const } },
  features: { orderBy: [{ category: "asc" as const }, { name: "asc" as const }] },
};

export type PropertyRecord = Prisma.PropertyGetPayload<{
  include: typeof includeRelations;
}>;

function sourceData(input: PropertyInput) {
  const { source, property, contact } = input;
  return {
    sourceProvider: source.provider,
    sourceUrl: canonicalizeListingUrl(source.url),
    sourceListingId: source.listingId,
    sourceListingKey: source.listingKey,
    sourceObservedAt: new Date(source.observedAt),
    sourceMetadata: source.rawMetadata as Prisma.InputJsonValue,
    title: property.title,
    description: property.description,
    propertyType: property.propertyType,
    operationType: property.operationType,
    priceAmount: property.price.amount,
    priceCurrency: property.price.currency,
    street: property.address.street,
    exteriorNumber: property.address.exteriorNumber,
    interiorNumber: property.address.interiorNumber,
    neighborhood: property.address.neighborhood,
    municipality: property.address.municipality,
    state: property.address.state,
    postalCode: property.address.postalCode,
    countryCode: property.address.countryCode,
    formattedAddress: property.address.formatted,
    latitude: property.coordinates?.latitude ?? null,
    longitude: property.coordinates?.longitude ?? null,
    landAreaM2: property.details.landAreaM2,
    constructionAreaM2: property.details.constructionAreaM2,
    bedrooms: property.details.bedrooms,
    bathrooms: property.details.bathrooms,
    parkingSpaces: property.details.parkingSpaces,
    parkingType: property.details.parkingType,
    serviceRoom: property.details.serviceRoom,
    propertyAgeYears: property.details.propertyAgeYears,
    condition: property.details.condition,
    orientation: property.details.orientation,
    landUse: property.details.landUse,
    buildingLevels: property.details.buildingLevels,
    unitFloor: property.details.unitFloor,
    maintenanceAmount: property.details.maintenanceAmount,
    maintenanceCurrency: property.details.maintenanceCurrency,
    technicalSheetQrUrl: property.technicalSheetQrUrl,
    agentName: contact.agentName,
    agentAvatarUrl: contact.agentAvatarUrl,
    agentPhones: contact.phones,
    agentEmail: contact.email,
    officeName: contact.officeName,
    sourceOfficeId: contact.sourceOfficeId,
  } satisfies Prisma.PropertyUncheckedCreateInput;
}

function relationData(input: PropertyInput) {
  return {
    images: input.images.map((image) => ({
      url: image.url,
      alt: image.alt,
      sortOrder: image.order,
    })),
    features: input.features.map((feature) => ({
      category: feature.category,
      name: feature.name,
    })),
  };
}

export async function upsertProperty(db: PrismaClient, input: PropertyInput) {
  const data = sourceData(input);
  const relations = relationData(input);

  return db.$transaction(async (tx) => {
    const existing = await tx.property.findFirst({
      where: {
        OR: [
          { sourceUrl: data.sourceUrl },
          ...(data.sourceListingId
            ? [
                {
                  sourceProvider: data.sourceProvider,
                  sourceListingId: data.sourceListingId,
                },
              ]
            : []),
        ],
      },
      select: { id: true },
    });

    if (existing) {
      const property = await tx.property.update({
        where: { id: existing.id },
        data: {
          ...data,
          images: { deleteMany: {}, create: relations.images },
          features: { deleteMany: {}, create: relations.features },
        },
        include: includeRelations,
      });
      return { action: "updated" as const, property };
    }

    const property = await tx.property.create({
      data: {
        ...data,
        images: { create: relations.images },
        features: { create: relations.features },
      },
      include: includeRelations,
    });
    return { action: "created" as const, property };
  });
}

function number(value: { toString(): string } | null) {
  return value === null ? null : Number(value.toString());
}

export function toPropertyDto(record: PropertyRecord) {
  return {
    ...record,
    sourceObservedAt: record.sourceObservedAt.toISOString(),
    visitAt: record.visitAt?.toISOString() ?? null,
    archivedAt: record.archivedAt?.toISOString() ?? null,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    priceAmount: number(record.priceAmount),
    latitude: number(record.latitude),
    longitude: number(record.longitude),
    landAreaM2: number(record.landAreaM2),
    constructionAreaM2: number(record.constructionAreaM2),
    bathrooms: number(record.bathrooms),
    maintenanceAmount: number(record.maintenanceAmount),
  };
}

export type PropertyDto = ReturnType<typeof toPropertyDto>;

export async function listProperties(db: PrismaClient) {
  const records = await db.property.findMany({
    where: { publicationStatus: "PUBLISHED" },
    include: includeRelations,
    orderBy: [{ archivedAt: "asc" }, { updatedAt: "desc" }],
  });
  return records.map(toPropertyDto);
}

export async function listDraftProperties(db: PrismaClient) {
  const records = await db.property.findMany({
    where: { publicationStatus: "DRAFT" },
    include: includeRelations,
    orderBy: { updatedAt: "desc" },
  });
  return records.map(toPropertyDto);
}

export async function getProperty(db: PrismaClient, id: string) {
  const record = await db.property.findUnique({
    where: { id },
    include: includeRelations,
  });
  return record ? toPropertyDto(record) : null;
}
