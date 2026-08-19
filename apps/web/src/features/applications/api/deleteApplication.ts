export async function deleteApplication(id: string): Promise<void> {
  const response = await fetch(
    `http://localhost:3001/applications/${id}`,
    {
      method: "DELETE",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to delete application");
  }
}