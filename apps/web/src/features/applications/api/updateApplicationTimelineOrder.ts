import { API_URL } from "../../../config";
import type { ApplicationStatus } from "@job-scout/shared";

export async function updateApplicationTimelineOrder({
  applicationId,
  statusOrder,
}: {
  applicationId: string;
  statusOrder: ApplicationStatus[];
}): Promise<void> {
  const response = await fetch(
    `${API_URL}/applications/${applicationId}/timeline-order`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ statusOrder }),
    },
  );

  if (!response.ok) {
    throw new Error("Failed to save the timeline order");
  }
}
