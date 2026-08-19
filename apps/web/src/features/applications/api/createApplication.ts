import { API_URL } from "../../../config";

export type CreateApplicationInput = {
  company: string;
  role: string;
  status: string;
  salaryExpectation?: string | null;
};

export async function createApplication(
  input: CreateApplicationInput,
) {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/applications`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
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
      body: JSON.stringify(applications),
    },
  );

  if (!response.ok) {
    throw new Error("Failed to import applications");
  }

  return response.json();
}