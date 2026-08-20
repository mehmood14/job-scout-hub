import { Router } from "express";
import type { AccessMode } from "@job-scout/shared";
import { requireSession } from "./auth.routes.js";
import {
  createApplication,
  createApplicationsBulk,
  deleteApplication,
  getApplicationTimeline,
  getApplications,
  updateApplicationTimelineOrder,
  updateApplicationTimelineSkippedStatuses,
  upsertApplicationTimelineEvent,
  updateApplication,
} from "./application.service.js";
import { bulkCreateApplicationsSchema, createApplicationSchema, upsertTimelineEventSchema, updateApplicationSchema, updateTimelineOrderSchema, updateTimelineSkippedStatusesSchema } from "./application.schema.js";

export const applicationRouter = Router();
applicationRouter.use(requireSession);

applicationRouter.get("/", async (_req, res) => {
  const accessMode = res.locals.accessMode as AccessMode;

  const applications = await getApplications(accessMode);

  res.json(applications);

});

applicationRouter.get("/:id/timeline", async (req, res) => {
  const accessMode = res.locals.accessMode as AccessMode;
  const timeline = await getApplicationTimeline(req.params.id, accessMode);

  if (!timeline) {
    return res.status(404).json({ message: "Application not found" });
  }

  return res.json(timeline);
});

applicationRouter.patch("/:id/timeline-order", async (req, res) => {
  const accessMode = res.locals.accessMode as AccessMode;

  if (accessMode === "viewer") {
    return res.status(403).json({ message: "Demo mode is read-only" });
  }

  const parsed = updateTimelineOrderSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid timeline order",
      errors: parsed.error.flatten(),
    });
  }

  const application = await updateApplicationTimelineOrder(
    req.params.id,
    parsed.data,
    accessMode,
  );

  return res.json(application);
});

applicationRouter.patch("/:id/timeline-skipped-statuses", async (req, res) => {
  const accessMode = res.locals.accessMode as AccessMode;

  if (accessMode === "viewer") {
    return res.status(403).json({ message: "Demo mode is read-only" });
  }

  const parsed = updateTimelineSkippedStatusesSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid skipped timeline statuses",
      errors: parsed.error.flatten(),
    });
  }

  const application = await updateApplicationTimelineSkippedStatuses(
    req.params.id,
    parsed.data,
    accessMode,
  );

  return res.json(application);
});

applicationRouter.post("/:id/timeline-events", async (req, res) => {
  const accessMode = res.locals.accessMode as AccessMode;

  if (accessMode === "viewer") {
    return res.status(403).json({ message: "Demo mode is read-only" });
  }

  const parsed = upsertTimelineEventSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid timeline event",
      errors: parsed.error.flatten(),
    });
  }

  const event = await upsertApplicationTimelineEvent(
    req.params.id,
    parsed.data,
    accessMode,
  );

  return res.json(event);
});

applicationRouter.post("/", async (req, res) => {
  const accessMode = res.locals.accessMode as AccessMode;

  if (accessMode === "viewer") {
    return res.status(403).json({ message: "Demo mode is read-only" });
  }

  const parsed = createApplicationSchema.safeParse(req.body);

  if (!parsed.success) {

    return res.status(400).json({

      message: "Invalid application data",

      errors: parsed.error.flatten(),

    });

  }

  const application = await createApplication(parsed.data, accessMode);

  res.status(201).json(application);

});

applicationRouter.delete("/:id", async (req, res) => {
  const accessMode = res.locals.accessMode as AccessMode;
  if (accessMode === "viewer") {
    return res.status(403).json({ message: "Demo mode is read-only" });
  }
  await deleteApplication(req.params.id, accessMode);

  res.status(204).send();
});

applicationRouter.patch("/:id", async (req, res) => {
  const accessMode = res.locals.accessMode as AccessMode;
  if (accessMode === "viewer") {
    return res.status(403).json({ message: "Demo mode is read-only" });
  }
  const parsed = updateApplicationSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid application data",
      errors: parsed.error.flatten(),
    });
  }

  const application = await updateApplication(
    req.params.id,
    parsed.data,
    accessMode,
  );

  res.json(application);
});

applicationRouter.post("/bulk", async (req, res) => {
  const accessMode = res.locals.accessMode as AccessMode;
  if (accessMode === "viewer") {
    return res.status(403).json({ message: "Demo mode is read-only" });
  }
  const parsed = bulkCreateApplicationsSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid application data",
      errors: parsed.error.flatten(),
    });
  }

  const applications = await createApplicationsBulk(parsed.data, accessMode);

  res.status(201).json(applications);
});
