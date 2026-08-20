import { describe, expect, it } from "vitest";

import { createApplicationSchema, updateTimelineOrderSchema } from "../src/modules/application.schema.js";

describe("application schemas", () => {
  it("rejects an application without the required company and role", () => {
    expect(createApplicationSchema.safeParse({ status: "Applied" }).success).toBe(false);
  });

  it("rejects a timeline order that repeats a status", () => {
    expect(updateTimelineOrderSchema.safeParse({
      statusOrder: [
        "Applied", "Applied", "Interview", "Technical Interview", "Test Assignment",
        "EM Interview", "VP/CTO Interview", "Cultural Interview", "Offer", "Parked", "Rejected",
      ],
    }).success).toBe(false);
  });
});
