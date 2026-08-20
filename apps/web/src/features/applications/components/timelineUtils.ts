import type { ApplicationStatus } from "@job-scout/shared";

import type { ApplicationTimelineEvent } from "../api/getApplicationTimeline";

export function timelineEventForStatus(
  events: ApplicationTimelineEvent[],
  status: ApplicationStatus,
  appliedDate: string | null,
): ApplicationTimelineEvent | undefined {
  if (status === "Applied" && appliedDate) {
    const existingEvent = latestEventForStatus(events, status);

    return existingEvent
      ? { ...existingEvent, occurredAt: appliedDate }
      : {
        id: "applied-date",
        applicationId: "",
        status: "Applied",
        occurredAt: appliedDate,
        createdAt: appliedDate,
      };
  }

  return latestEventForStatus(events, status);
}

export function timelineStepState(event: ApplicationTimelineEvent | undefined): "Finished" | "Upcoming" {
  return event && new Date(event.occurredAt).getTime() <= Date.now()
    ? "Finished"
    : "Upcoming";
}

function latestEventForStatus(events: ApplicationTimelineEvent[], status: ApplicationStatus): ApplicationTimelineEvent | undefined {
  return events.findLast((event) => event.status === status);
}
