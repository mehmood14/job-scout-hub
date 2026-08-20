import { API_URL } from "../../../config";
import type { ApplicationStatus } from "@job-scout/shared";

export type UpdateApplicationInput = {
  id: string;
  company?: string;
  role?: string;
  status?: ApplicationStatus;
  appliedDate?: string;
  recruiterName?: string | null;
  salaryExpectation?: string | null;
  description?: string | null;
};


export async function updateApplication({
  id,
  ...data
}: UpdateApplicationInput) {
  const response = await fetch(
    `${API_URL}/applications/${id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    },
  );

  if (!response.ok) {
    throw new Error("Failed to update application");
  }

  return response.json();
}
