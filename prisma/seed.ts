import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { remaxSeedProperty } from "../src/lib/remax-seed";
import { upsertProperty } from "../src/lib/property-store";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL es obligatoria para cargar la propiedad inicial.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

try {
  const result = await upsertProperty(prisma, remaxSeedProperty);
  console.log(`${result.action}: ${result.property.title}`);
} finally {
  await prisma.$disconnect();
}
