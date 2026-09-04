import Link from "next/link";
/* eslint-disable @next/next/no-img-element -- listing photos use arbitrary external hosts */
import { MaterialIcon } from "@/components/material-icon";
import { prisma } from "@/lib/prisma";
import { listDraftProperties } from "@/lib/property-store";

export const dynamic = "force-dynamic";

export default async function DraftsPage() {
  const drafts = await listDraftProperties(prisma);
  return <main className="drafts-page"><header className="detail-topbar"><Link href="/" className="detail-brand"><span><MaterialIcon name="home" /></span><strong>Casa Clara</strong></Link><Link href="/" className="back-link"><MaterialIcon name="arrowBack" /> Volver</Link></header><section className="drafts-content"><div className="drafts-heading"><div><span className="eyebrow">Pendientes de revisión</span><h1>Borradores</h1></div><Link className="button primary" href="/properties/new">Agregar propiedad</Link></div>{drafts.length ? <div className="draft-grid">{drafts.map((property) => <article className="draft-card" key={property.id}>{property.images[0] ? <>{/* Listing images use arbitrary external hosts. */}<img src={property.images[0].url} alt={property.title} /></> : <div className="image-placeholder">Sin foto</div>}<div><span>{property.sourceProvider}</span><h2>{property.title}</h2><p>{property.formattedAddress ?? "Ubicación pendiente"}</p><Link href={`/properties/${property.id}/review`}>Revisar y publicar <MaterialIcon name="arrowForward" /></Link></div></article>)}</div> : <div className="empty-state"><h2>No hay borradores</h2><p>Las importaciones aparecerán aquí antes de publicarse.</p></div>}</section></main>;
}
