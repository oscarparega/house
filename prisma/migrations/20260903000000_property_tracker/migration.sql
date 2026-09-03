CREATE TYPE "PropertyType" AS ENUM ('APARTMENT', 'HOUSE', 'LAND', 'OTHER');
CREATE TYPE "OperationType" AS ENUM ('SALE');
CREATE TYPE "DecisionStatus" AS ENUM ('NEW', 'INTERESTED', 'CONTACTED', 'VISIT_SCHEDULED', 'VISITED', 'OFFER_MADE', 'REJECTED', 'PURCHASED');
CREATE TYPE "FeatureCategory" AS ENUM ('AREA', 'EQUIPMENT', 'OTHER');

CREATE TABLE "Property" (
    "id" TEXT NOT NULL,
    "sourceProvider" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "sourceListingId" TEXT,
    "sourceListingKey" TEXT,
    "sourceObservedAt" TIMESTAMP(3) NOT NULL,
    "sourceMetadata" JSONB NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "propertyType" "PropertyType" NOT NULL,
    "operationType" "OperationType" NOT NULL DEFAULT 'SALE',
    "priceAmount" DECIMAL(14,2),
    "priceCurrency" VARCHAR(3),
    "street" TEXT,
    "exteriorNumber" TEXT,
    "interiorNumber" TEXT,
    "neighborhood" TEXT,
    "municipality" TEXT,
    "state" TEXT,
    "postalCode" TEXT,
    "countryCode" VARCHAR(2) NOT NULL DEFAULT 'MX',
    "formattedAddress" TEXT,
    "latitude" DECIMAL(9,6),
    "longitude" DECIMAL(9,6),
    "landAreaM2" DECIMAL(10,2),
    "constructionAreaM2" DECIMAL(10,2),
    "bedrooms" INTEGER,
    "bathrooms" DECIMAL(4,1),
    "parkingSpaces" INTEGER,
    "parkingType" TEXT,
    "serviceRoom" BOOLEAN,
    "propertyAgeYears" INTEGER,
    "condition" TEXT,
    "orientation" TEXT,
    "landUse" TEXT,
    "buildingLevels" INTEGER,
    "unitFloor" INTEGER,
    "maintenanceAmount" DECIMAL(12,2),
    "maintenanceCurrency" VARCHAR(3),
    "technicalSheetQrUrl" TEXT,
    "agentName" TEXT,
    "agentAvatarUrl" TEXT,
    "agentPhones" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "agentEmail" TEXT,
    "officeName" TEXT,
    "sourceOfficeId" TEXT,
    "decisionStatus" "DecisionStatus" NOT NULL DEFAULT 'NEW',
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "rating" INTEGER,
    "notes" TEXT,
    "visitAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Property_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Property_rating_check" CHECK ("rating" IS NULL OR ("rating" BETWEEN 1 AND 5))
);

CREATE TABLE "PropertyImage" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT,
    "sortOrder" INTEGER NOT NULL,
    CONSTRAINT "PropertyImage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PropertyFeature" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "category" "FeatureCategory" NOT NULL,
    "name" TEXT NOT NULL,
    CONSTRAINT "PropertyFeature_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Property_sourceUrl_key" ON "Property"("sourceUrl");
CREATE UNIQUE INDEX "Property_sourceProvider_sourceListingId_key" ON "Property"("sourceProvider", "sourceListingId");
CREATE INDEX "Property_decisionStatus_idx" ON "Property"("decisionStatus");
CREATE INDEX "Property_archivedAt_idx" ON "Property"("archivedAt");
CREATE INDEX "Property_isFavorite_idx" ON "Property"("isFavorite");
CREATE UNIQUE INDEX "PropertyImage_propertyId_url_key" ON "PropertyImage"("propertyId", "url");
CREATE INDEX "PropertyImage_propertyId_sortOrder_idx" ON "PropertyImage"("propertyId", "sortOrder");
CREATE UNIQUE INDEX "PropertyFeature_propertyId_category_name_key" ON "PropertyFeature"("propertyId", "category", "name");
CREATE INDEX "PropertyFeature_propertyId_idx" ON "PropertyFeature"("propertyId");

ALTER TABLE "PropertyImage" ADD CONSTRAINT "PropertyImage_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PropertyFeature" ADD CONSTRAINT "PropertyFeature_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;
