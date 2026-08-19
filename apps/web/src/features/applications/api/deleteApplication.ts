import { API_URL } from "../../../config";

export async function deleteApplication(id: string): Promise<void> {
  const response = await fetch(
    `${API_URL}/applications/${id}`,
    {
      method: "DELETE",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to delete application");
  }
}