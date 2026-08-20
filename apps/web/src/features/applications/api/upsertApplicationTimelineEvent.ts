import { API_URL } from "../../../config";
import type { ApplicationStatus } from "@job-scout/shared";

export async function upsertApplicationTimelineEvent({
  applicationId,
  status,
  occurredAt,
}: {
  applicationId: string;
  status: ApplicationStatus;
  occurredAt: string;
}): Promise<void> {
  const response = await fetch(
    `${API_URL}/applications/${applicationId}/timeline-events`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status, occurredAt }),
    },
  );

  if (!response.ok) {
    throw new Error("Failed to save the timeline date and time");
  }
}
