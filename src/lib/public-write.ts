import "server-only";

import { createHmac } from "node:crypto";
import { prisma } from "@/lib/prisma";

type WriteContext = {
  ip: string;
  ipHash: string;
};

function clientIp(headers: Headers) {
  return (
    headers.get("cf-connecting-ip") ??
    headers.get("x-real-ip") ??
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

function hashIp(ip: string) {
  const secret = process.env.PUBLIC_WRITE_HASH_SECRET ?? "casa-clara-development-only";
  return createHmac("sha256", secret).update(ip).digest("hex");
}

export async function validateTurnstile(token: string | null, headers: Headers) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("La protección anti-bots no está configurada.");
    }
    return;
  }
  if (!token) throw new Error("Completa la verificación anti-bots.");

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      secret,
      response: token,
      remoteip: clientIp(headers),
    }),
    signal: AbortSignal.timeout(10_000),
  });
  const result = (await response.json()) as { success?: boolean };
  if (!result.success) throw new Error("La verificación anti-bots no fue válida.");
}

export async function enforceRateLimit(
  action: string,
  headers: Headers,
  options: { perHour: number; globalPerDay: number },
): Promise<WriteContext> {
  const ip = clientIp(headers);
  const ipHash = hashIp(ip);
  const now = new Date();
  const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const [byIp, global] = await Promise.all([
    prisma.mutationAudit.count({ where: { action, ipHash, createdAt: { gte: hourAgo } } }),
    prisma.mutationAudit.count({ where: { action, createdAt: { gte: dayAgo } } }),
  ]);
  if (byIp >= options.perHour || global >= options.globalPerDay) {
    throw new Error("Se alcanzó el límite temporal. Intenta más tarde.");
  }
  return { ip, ipHash };
}

export async function auditMutation(
  action: string,
  targetType: string,
  targetId: string | null,
  ipHash: string,
) {
  await prisma.mutationAudit.create({ data: { action, targetType, targetId, ipHash } });
}

export async function protectExpensiveWrite(
  action: string,
  token: string | null,
  headers: Headers,
  limits = { perHour: 5, globalPerDay: 25 },
) {
  await validateTurnstile(token, headers);
  return enforceRateLimit(action, headers, limits);
}
