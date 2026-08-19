import { McpServer } from "@modelcontextprotocol/server";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import { z } from "zod";

const API_URL = "http://localhost:3001";

const applicationStatusSchema = z.enum([
  "Applied",
  "Recruiter Contacted",
  "Interview",
  "Technical Interview",
  "Offer",
  "Rejected",
]);

function createServer() {
  const server = new McpServer({
    name: "job-scout",
    version: "1.0.0",
  });

  server.registerTool(
    "get_applications",
    {
      description: "Get all job applications from Job Scout Hub",
    },
    async () => {
      const response = await fetch(`${API_URL}/applications`);

      if (!response.ok) {
        throw new Error("Failed to fetch applications");
      }

      const applications = await response.json();

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(applications, null, 2),
          },
        ],
      };
    },
  );

  server.registerTool(
    "get_application_stats",
    {
      description: "Get summary counts for job applications by status",
    },
    async () => {
      const response = await fetch(`${API_URL}/applications`);

      if (!response.ok) {
        throw new Error("Failed to fetch applications");
      }

      const applications = (await response.json()) as Array<{
        status: string;
      }>;

      const byStatus = applications.reduce<Record<string, number>>(
        (acc, application) => {
          acc[application.status] =
            (acc[application.status] ?? 0) + 1;

          return acc;
        },
        {},
      );

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                total: applications.length,
                byStatus,
              },
              null,
              2,
            ),
          },
        ],
      };
    },
  );

  server.registerTool(
    "search_applications",
    {
      description: "Search job applications by company or role",
      inputSchema: z.object({
        query: z.string().min(1),
      }),
    },
    async ({ query }) => {
      const response = await fetch(`${API_URL}/applications`);

      if (!response.ok) {
        throw new Error("Failed to fetch applications");
      }

      const applications = (await response.json()) as Array<{
        id: string;
        company: string;
        role: string;
        status: string;
      }>;

      const normalizedQuery = query.trim().toLowerCase();

      const matches = applications.filter(
        (application) =>
          application.company
            .toLowerCase()
            .includes(normalizedQuery) ||
          application.role
            .toLowerCase()
            .includes(normalizedQuery),
      );

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(matches, null, 2),
          },
        ],
      };
    },
  );

  server.registerTool(
    "create_application",
    {
      description: "Create a new job application",
      inputSchema: z.object({
        company: z.string().min(1),
        role: z.string().min(1),
        status: applicationStatusSchema.default("Applied"),
        salaryExpectation: z.string().nullable().optional(),
      }),
    },
    async ({
      company,
      role,
      status,
      salaryExpectation,
    }) => {
      const response = await fetch(`${API_URL}/applications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          company,
          role,
          status,
          salaryExpectation: salaryExpectation ?? null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create application");
      }

      const application = await response.json();

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(application, null, 2),
          },
        ],
      };
    },
  );

  server.registerTool(
    "update_application",
    {
      description: "Update fields on an existing job application",
      inputSchema: z.object({
        id: z.string().uuid(),
        company: z.string().min(1).optional(),
        role: z.string().min(1).optional(),
        status: applicationStatusSchema.optional(),
        salaryExpectation: z.string().nullable().optional(),
      }),
    },
    async ({ id, ...updates }) => {
      const response = await fetch(
        `${API_URL}/applications/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updates),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to update application");
      }

      const application = await response.json();

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(application, null, 2),
          },
        ],
      };
    },
  );

  server.registerTool(
    "update_application_status",
    {
      description: "Update only the status of a job application",
      inputSchema: z.object({
        id: z.string().uuid(),
        status: applicationStatusSchema,
      }),
    },
    async ({ id, status }) => {
      const response = await fetch(
        `${API_URL}/applications/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to update application status");
      }

      const application = await response.json();

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(application, null, 2),
          },
        ],
      };
    },
  );

  server.registerTool(
    "delete_application",
    {
      description: "Delete a job application by ID",
      inputSchema: z.object({
        id: z.string().uuid(),
      }),
    },
    async ({ id }) => {
      const response = await fetch(
        `${API_URL}/applications/${id}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to delete application");
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                id,
              },
              null,
              2,
            ),
          },
        ],
      };
    },
  );

  return server;
}

void serveStdio(createServer);