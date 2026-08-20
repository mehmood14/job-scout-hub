import { z } from "zod";
import { APPLICATION_STATUSES } from "@job-scout/shared";

export const applicationStatusSchema = z.enum(APPLICATION_STATUSES);

export const createApplicationSchema = z.object({
  company: z.string().min(1),
  role: z.string().min(1),
  status: applicationStatusSchema,
  appliedDate: z.coerce.date().optional(),
  recruiterName: z.string().trim().max(200).nullable().optional(),
  salaryExpectation: z.string().nullable().optional(),
  description: z.string().trim().max(10_000).nullable().optional(),
});

export type CreateApplicationInput = z.infer<
  typeof createApplicationSchema
>;

export const updateApplicationSchema = createApplicationSchema.partial();

export type UpdateApplicationInput = z.infer<
  typeof updateApplicationSchema
>;

export const bulkCreateApplicationsSchema = z.array(
  createApplicationSchema,
).min(1);

export const updateTimelineOrderSchema = z.object({
  statusOrder: z
    .array(applicationStatusSchema)
    .length(APPLICATION_STATUSES.length)
    .refine(
      (statuses) => new Set(statuses).size === APPLICATION_STATUSES.length,
      "Each status must appear once",
    ),
});

export type UpdateTimelineOrderInput = z.infer<
  typeof updateTimelineOrderSchema
>;

export const upsertTimelineEventSchema = z.object({
  status: applicationStatusSchema,
  occurredAt: z.coerce.date(),
});

export type UpsertTimelineEventInput = z.infer<
  typeof upsertTimelineEventSchema
>;

export const updateTimelineSkippedStatusesSchema = z.object({
  skippedStatuses: z
    .array(applicationStatusSchema)
    .refine(
      (statuses) => new Set(statuses).size === statuses.length,
      "A status can only be skipped once",
    ),
});

export type UpdateTimelineSkippedStatusesInput = z.infer<
  typeof updateTimelineSkippedStatusesSchema
>;
