import { describe, expect, it } from "vitest";
import type { ApplicationStatus } from "@job-scout/shared";

import { compareRecruitmentStatus } from "./applicationStatus";

describe("compareRecruitmentStatus", () => {
  it("puts active recruitment stages before Rejected and Applied", () => {
    const statuses: ApplicationStatus[] = ["Applied", "Rejected", "Interview", "Offer"];

    expect(statuses.toSorted(compareRecruitmentStatus)).toEqual([
      "Interview",
      "Offer",
      "Rejected",
      "Applied",
    ]);
  });
});
