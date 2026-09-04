"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MaterialIcon } from "@/components/material-icon";
import { Turnstile } from "@/components/turnstile";

type State = { importId: string; status: string; errorMessage?: string | null; propertyId?: string | null } | null;

export function UrlImportForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [job, setJob] = useState<State>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!job || ["READY", "FAILED"].includes(job.status)) return;
    const timer = window.setInterval(async () => {
      const response = await fetch(`/api/imports/${job.importId}`, { cache: "no-store" });
      if (!response.ok) return;
      const next = await response.json() as NonNullable<State>;
      setJob(next);
      if (next.status === "READY" && next.propertyId) router.push(`/properties/${next.propertyId}/review`);
    }, 1_500);
    return () => window.clearInterval(timer);
  }, [job, router]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(""); setSubmitting(true);
    const data = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/imports", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: data.get("url"), turnstileToken: data.get("cf-turnstile-response") || null }),
      });
      const payload = await response.json() as { error?: string; existing?: boolean; propertyId?: string; publicationStatus?: string; importId?: string; status?: string };
      if (!response.ok) throw new Error(payload.error ?? "No fue posible iniciar la importación.");
      if (payload.existing && payload.propertyId) {
        router.push(payload.publicationStatus === "DRAFT" ? `/properties/${payload.propertyId}/review` : `/properties/${payload.propertyId}`);
        return;
      }
      setJob({ importId: payload.importId!, status: payload.status! });
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Error inesperado."); }
    finally { setSubmitting(false); }
  }

  return (
    <form ref={formRef} className="import-form" onSubmit={submit}>
      <label><span>URL de la publicación</span><div className="url-input"><MaterialIcon name="link" /><input name="url" type="url" required placeholder="https://portal.com/propiedad/..." disabled={Boolean(job && !["READY", "FAILED"].includes(job.status))} /></div></label>
      <p>Intentaremos leer los datos directamente. Si el portal lo bloquea, usaremos el navegador administrado dentro del presupuesto configurado.</p>
      <Turnstile action="url-import" />
      {error && <p className="form-error" role="alert">{error}</p>}
      {job && <div className={`import-progress status-${job.status.toLowerCase()}`}><MaterialIcon name={job.status === "FAILED" ? "error" : "sync"} /><div><strong>{job.status === "FAILED" ? "No se pudo importar" : "Importando propiedad"}</strong><span>{job.errorMessage ?? `Estado: ${job.status.toLowerCase()}`}</span></div></div>}
      <button className="button primary" type="submit" disabled={submitting || Boolean(job && !["READY", "FAILED"].includes(job.status))}>{submitting ? "Preparando…" : "Importar y crear borrador"}</button>
    </form>
  );
}
