import { API_URL } from "../../../config";
import type { ApplicationStatus } from "@job-scout/shared";

export type ApplicationTimelineEvent = {
  id: string;
  applicationId: string;
  status: ApplicationStatus;
  occurredAt: string;
  createdAt: string;
};

export type ApplicationTimeline = {
  events: ApplicationTimelineEvent[];
  statusOrder: unknown;
  skippedStatuses: unknown;
};

export async function getApplicationTimeline(
  applicationId: string,
): Promise<ApplicationTimeline> {
  const response = await fetch(
    `${API_URL}/applications/${applicationId}/timeline`,
    { credentials: "include" },
  );

  if (!response.ok) {
    throw new Error("Failed to load application timeline");
  }

  return response.json() as Promise<ApplicationTimeline>;
}
