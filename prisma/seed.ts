import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { pulppoSeedProperty } from "../src/lib/pulppo-seed";
import { remaxSeedProperties } from "../src/lib/remax-seed";
import { upsertProperty } from "../src/lib/property-store";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL es obligatoria para cargar las propiedades iniciales.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

try {
  for (const property of [...remaxSeedProperties, pulppoSeedProperty]) {
    const result = await upsertProperty(prisma, property);
    console.log(`${result.action}: ${result.property.title}`);
  }
} finally {
  await prisma.$disconnect();
}
