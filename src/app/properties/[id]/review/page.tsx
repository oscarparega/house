import { notFound, redirect } from "next/navigation";
import { ReviewPropertyEditor } from "@/components/review-property-editor";
import { prisma } from "@/lib/prisma";
import { getProperty } from "@/lib/property-store";

export const dynamic = "force-dynamic";

export default async function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const property = await getProperty(prisma, (await params).id);
  if (!property) notFound();
  if (property.publicationStatus === "PUBLISHED") redirect(`/properties/${property.id}`);
  return <ReviewPropertyEditor property={property} />;
}
