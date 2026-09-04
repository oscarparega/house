"use client";

import Script from "next/script";

export function Turnstile({ action }: { action: string }) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  if (!siteKey) {
    return process.env.NODE_ENV === "development" ? (
      <p className="form-note">Turnstile omitido en desarrollo.</p>
    ) : (
      <p className="form-error">Falta configurar Turnstile para habilitar envíos.</p>
    );
  }
  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" />
      <div className="cf-turnstile" data-sitekey={siteKey} data-action={action} data-theme="light" />
    </>
  );
}
