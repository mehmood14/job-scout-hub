import { API_URL } from "../../../config";
import type { ApplicationStatus } from "@job-scout/shared";

export type CreateApplicationInput = {
  company: string;
  role: string;
  status: ApplicationStatus;
  appliedDate?: string;
  recruiterName?: string | null;
  salaryExpectation?: string | null;
  description?: string | null;
};

export async function createApplication(
  input: CreateApplicationInput,
) {
  const response = await fetch(
    `${API_URL}/applications`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(input),
    },
  );

  if (!response.ok) {
    throw new Error("Failed to create application");
  }

  return response.json();
}

export async function createApplicationsBulk(
  applications: CreateApplicationInput[],
) {
  const response = await fetch(
    `${API_URL}/applications/bulk`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(applications),
    },
  );

  if (!response.ok) {
    throw new Error("Failed to import applications");
  }

  return response.json();
}
