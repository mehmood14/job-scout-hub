import { describe, expect, it } from "vitest";

import { timelineEventForStatus, timelineStepState } from "./timelineUtils";

describe("application timeline helpers", () => {
  it("uses the application applied date as the Applied event date", () => {
    const event = timelineEventForStatus([
      { id: "old", applicationId: "application", status: "Applied", occurredAt: "2026-08-10T09:00:00.000Z", createdAt: "2026-08-10T09:00:00.000Z" },
    ], "Applied", "2026-08-16T12:30:00.000Z");

    expect(event?.occurredAt).toBe("2026-08-16T12:30:00.000Z");
  });

  it("distinguishes a finished current step from an upcoming one", () => {
    expect(timelineStepState({ id: "past", applicationId: "application", status: "Interview", occurredAt: "2020-08-16T12:30:00.000Z", createdAt: "2020-08-16T12:30:00.000Z" })).toBe("Finished");
    expect(timelineStepState({ id: "future", applicationId: "application", status: "Interview", occurredAt: "2100-08-16T12:30:00.000Z", createdAt: "2100-08-16T12:30:00.000Z" })).toBe("Upcoming");
  });
});
