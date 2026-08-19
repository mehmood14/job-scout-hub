import { API_URL } from "../../../config";

export type UpdateApplicationInput = {
  id: string;
  company?: string;
  role?: string;
  status?: string;
  salaryExpectation?: string | null;
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
      body: JSON.stringify(data),
    },
  );

  if (!response.ok) {
    throw new Error("Failed to update application");
  }

  return response.json();
}