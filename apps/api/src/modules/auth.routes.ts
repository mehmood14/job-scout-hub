import { Router, type Request, type Response } from "express";
import { z } from "zod";
import {
  createSession,
  getSession,
  removeSession,
  sessionCookieName,
  sessionMaxAgeMs,
  verifyOwnerPassword,
} from "./auth.service.js";
import { ensureDemoApplications } from "./demo.service.js";

const loginSchema = z.object({ password: z.string().min(1) });

function sessionIdFrom(request: Request): string | undefined {
  const cookies = request.headers.cookie?.split(";") ?? [];
  const cookie = cookies.find((value) => value.trim().startsWith(`${sessionCookieName}=`));
  return cookie?.trim().slice(`${sessionCookieName}=`.length);
}

function setSessionCookie(response: Response, sessionId: string): void {
  const isProduction = process.env.NODE_ENV === "production";

  response.cookie(sessionCookieName, sessionId, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: sessionMaxAgeMs,
    path: "/",
  });
}

function clearSessionCookie(response: Response): void {
  const isProduction = process.env.NODE_ENV === "production";

  response.clearCookie(sessionCookieName, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
  });
}

export const authRouter = Router();

authRouter.get("/session", async (request, response) => {
  const session = await getSession(sessionIdFrom(request));

  if (!session) {
    clearSessionCookie(response);
    return response.status(401).json({ authenticated: false });
  }

  return response.json({ authenticated: true, accessMode: session.accessMode });
});

authRouter.post("/login", async (request, response) => {
  const parsed = loginSchema.safeParse(request.body);

  if (!parsed.success || !verifyOwnerPassword(parsed.data.password)) {
    return response.status(401).json({ message: "Invalid password" });
  }

  const session = await createSession("owner");
  setSessionCookie(response, session.id);
  return response.status(201).json({ authenticated: true, accessMode: "owner" });
});

authRouter.post("/demo", async (_request, response) => {
  await ensureDemoApplications();
  const session = await createSession("viewer");
  setSessionCookie(response, session.id);
  return response.status(201).json({ authenticated: true, accessMode: "viewer" });
});

authRouter.post("/logout", async (request, response) => {
  await removeSession(sessionIdFrom(request));
  clearSessionCookie(response);
  return response.status(204).send();
});

export async function requireSession(request: Request, response: Response, next: () => void): Promise<void> {
  const session = await getSession(sessionIdFrom(request));

  if (!session) {
    clearSessionCookie(response);
    response.status(401).json({ message: "Authentication required" });
    return;
  }

  response.locals.accessMode = session.accessMode;
  next();
}
