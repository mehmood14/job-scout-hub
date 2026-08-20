import { API_URL } from "../../../config";
import type { ApplicationStatus } from "@job-scout/shared";

export async function updateApplicationTimelineSkippedStatuses({
  applicationId,
  skippedStatuses,
}: {
  applicationId: string;
  skippedStatuses: ApplicationStatus[];
}): Promise<void> {
  const response = await fetch(
    `${API_URL}/applications/${applicationId}/timeline-skipped-statuses`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ skippedStatuses }),
    },
  );

  if (!response.ok) {
    throw new Error("Failed to save skipped timeline steps");
  }
}
