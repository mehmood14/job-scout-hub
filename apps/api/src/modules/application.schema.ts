import { z } from "zod";

export const createApplicationSchema = z.object({
  company: z.string().min(1),
  role: z.string().min(1),
  status: z.enum([
    "Applied",
    "Recruiter Contacted",
    "Interview",
    "Technical Interview",
    "Offer",
    "Rejected",
  ]),
  salaryExpectation: z.string().nullable().optional(),
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