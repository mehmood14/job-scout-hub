import { randomBytes, timingSafeEqual } from "node:crypto";
import type { AccessMode } from "@job-scout/shared";

import { prisma } from "../shared/prisma.js";

const sessionTtlMs = Number.parseInt(process.env.SESSION_TTL_HOURS ?? "168", 10) * 60 * 60 * 1_000;

type Session = {
  accessMode: AccessMode;
  expiresAt: Date;
};

function ownerPassword(): string {
  const password = process.env.OWNER_PASSWORD;
  if (!password) throw new Error("OWNER_PASSWORD is not defined");
  return password;
}

export function verifyOwnerPassword(password: string): boolean {
  const expected = Buffer.from(ownerPassword());
  const supplied = Buffer.from(password);
  return expected.length === supplied.length && timingSafeEqual(expected, supplied);
}

export async function createSession(accessMode: AccessMode): Promise<{ id: string; expiresAt: Date }> {
  const id = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + sessionTtlMs);
  await prisma.session.create({ data: { id, accessMode, expiresAt } });
  return { id, expiresAt };
}

export async function getSession(id: string | undefined): Promise<Session | undefined> {
  if (!id) return undefined;
  const session = await prisma.session.findUnique({ where: { id } });
  if (!session) return undefined;
  if (session.expiresAt <= new Date()) {
    await prisma.session.delete({ where: { id } });
    return undefined;
  }
  return { accessMode: session.accessMode as AccessMode, expiresAt: session.expiresAt };
}

export async function removeSession(id: string | undefined): Promise<void> {
  if (id) await prisma.session.deleteMany({ where: { id } });
}

export const sessionCookieName = "job_scout_session";
export const sessionMaxAgeMs = sessionTtlMs;
