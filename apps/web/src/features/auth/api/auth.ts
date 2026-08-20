import { API_URL } from "../../../config";

export type AccessMode = "owner" | "viewer";

export type Session = {
  authenticated: true;
  accessMode: AccessMode;
};

async function request(path: string, init?: RequestInit): Promise<Response> {
  return fetch(`${API_URL}${path}`, { credentials: "include", ...init });
}

export async function getSession(): Promise<Session | null> {
  const response = await request("/auth/session");

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Failed to check session");
  }

  return response.json() as Promise<Session>;
}

export async function login(password: string): Promise<Session> {
  const response = await request("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });

  if (!response.ok) {
    throw new Error("The password was not recognised.");
  }

  return response.json() as Promise<Session>;
}

export async function enterDemo(): Promise<Session> {
  const response = await request("/auth/demo", { method: "POST" });

  if (!response.ok) {
    throw new Error("Unable to start demo mode.");
  }

  return response.json() as Promise<Session>;
}

export async function logout(): Promise<void> {
  const response = await request("/auth/logout", { method: "POST" });

  if (!response.ok) {
    throw new Error("Unable to log out.");
  }
}
