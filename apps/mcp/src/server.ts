import { McpServer } from "@modelcontextprotocol/server";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import { z } from "zod";

const API_URL = process.env.JOB_SCOUT_API_URL ?? "http://localhost:3001";

const applicationStatusSchema = z.enum([
  "Applied", "Recruiter Contacted", "Interview", "Technical Interview", "Test Assignment",
  "EM Interview", "VP/CTO Interview", "Cultural Interview", "Offer", "Parked", "Rejected",
]);

type Application = { id: string; company: string; role: string; status: string };

async function ownerFetch(path: string, init?: RequestInit): Promise<Response> {
  const password = process.env.OWNER_PASSWORD;
  if (!password) throw new Error("OWNER_PASSWORD is required for MCP access");

  const loginResponse = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  const sessionCookie = loginResponse.headers.get("set-cookie");
  if (!loginResponse.ok || !sessionCookie) throw new Error("MCP could not authenticate with the Job Scout API");
  const sessionId = sessionCookie.split(";")[0];
  if (!sessionId) throw new Error("MCP did not receive an authentication cookie");

  return fetch(`${API_URL}${path}`, {
    ...init,
    headers: { ...init?.headers, Cookie: sessionId },
  });
}

async function getOwnerApplications(): Promise<Application[]> {
  const response = await ownerFetch("/applications");
  if (!response.ok) throw new Error("Failed to fetch applications");
  return response.json() as Promise<Application[]>;
}

function createServer() {
  const server = new McpServer({ name: "job-scout", version: "1.0.0" });

  server.registerTool("get_applications", { description: "Get all owner job applications from Job Scout Hub" }, async () => ({
    content: [{ type: "text", text: JSON.stringify(await getOwnerApplications(), null, 2) }],
  }));

  server.registerTool("get_application_stats", { description: "Get owner application counts by status" }, async () => {
    const applications = await getOwnerApplications();
    const byStatus = applications.reduce<Record<string, number>>((counts, application) => {
      counts[application.status] = (counts[application.status] ?? 0) + 1;
      return counts;
    }, {});
    return { content: [{ type: "text", text: JSON.stringify({ total: applications.length, byStatus }, null, 2) }] };
  });

  server.registerTool("search_applications", { description: "Search owner applications by company or role", inputSchema: z.object({ query: z.string().min(1) }) }, async ({ query }) => {
    const normalizedQuery = query.trim().toLowerCase();
    const matches = (await getOwnerApplications()).filter((application) => application.company.toLowerCase().includes(normalizedQuery) || application.role.toLowerCase().includes(normalizedQuery));
    return { content: [{ type: "text", text: JSON.stringify(matches, null, 2) }] };
  });

  server.registerTool("create_application", {
    description: "Create a new owner job application",
    inputSchema: z.object({ company: z.string().min(1), role: z.string().min(1), status: applicationStatusSchema.default("Applied"), appliedDate: z.coerce.date().optional(), recruiterName: z.string().nullable().optional(), salaryExpectation: z.string().nullable().optional(), description: z.string().nullable().optional() }),
  }, async ({ company, role, status, appliedDate, recruiterName, salaryExpectation, description }) => {
    const response = await ownerFetch("/applications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ company, role, status, appliedDate, recruiterName: recruiterName ?? null, salaryExpectation: salaryExpectation ?? null, description: description ?? null }) });
    if (!response.ok) throw new Error("Failed to create application");
    return { content: [{ type: "text", text: JSON.stringify(await response.json(), null, 2) }] };
  });

  server.registerTool("update_application", {
    description: "Update fields on an owner job application",
    inputSchema: z.object({ id: z.string().uuid(), company: z.string().min(1).optional(), role: z.string().min(1).optional(), status: applicationStatusSchema.optional(), appliedDate: z.coerce.date().optional(), recruiterName: z.string().nullable().optional(), salaryExpectation: z.string().nullable().optional(), description: z.string().nullable().optional() }),
  }, async ({ id, ...updates }) => {
    const response = await ownerFetch(`/applications/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updates) });
    if (!response.ok) throw new Error("Failed to update application");
    return { content: [{ type: "text", text: JSON.stringify(await response.json(), null, 2) }] };
  });

  server.registerTool("update_application_status", { description: "Update only the status of an owner job application", inputSchema: z.object({ id: z.string().uuid(), status: applicationStatusSchema }) }, async ({ id, status }) => {
    const response = await ownerFetch(`/applications/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    if (!response.ok) throw new Error("Failed to update application status");
    return { content: [{ type: "text", text: JSON.stringify(await response.json(), null, 2) }] };
  });

  server.registerTool("delete_application", { description: "Delete an owner job application by ID", inputSchema: z.object({ id: z.string().uuid() }) }, async ({ id }) => {
    const response = await ownerFetch(`/applications/${id}`, { method: "DELETE" });
    if (!response.ok) throw new Error("Failed to delete application");
    return { content: [{ type: "text", text: JSON.stringify({ success: true, id }, null, 2) }] };
  });

  return server;
}

void serveStdio(createServer);
