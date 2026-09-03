import { PropertyWorkspace } from "@/components/property-workspace";
import { prisma } from "@/lib/prisma";
import { listProperties } from "@/lib/property-store";

export const dynamic = "force-dynamic";

export default async function Home() {
  const properties = await listProperties(prisma);
  return <PropertyWorkspace initialProperties={properties} />;
}
