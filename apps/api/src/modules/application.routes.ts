import { Router } from "express";
import {
  createApplication,
  createApplicationsBulk,
  deleteApplication,
  getApplications,
  updateApplication,
} from "./application.service.js";
import { bulkCreateApplicationsSchema, createApplicationSchema, updateApplicationSchema } from "./application.schema.js";

export const applicationRouter = Router();

applicationRouter.get("/", async (_req, res) => {

  const applications = await getApplications();

  res.json(applications);

});

applicationRouter.post("/", async (req, res) => {

  const parsed = createApplicationSchema.safeParse(req.body);

  if (!parsed.success) {

    return res.status(400).json({

      message: "Invalid application data",

      errors: parsed.error.flatten(),

    });

  }

  const application = await createApplication(parsed.data);

  res.status(201).json(application);

});

applicationRouter.delete("/:id", async (req, res) => {
  await deleteApplication(req.params.id);

  res.status(204).send();
});

applicationRouter.patch("/:id", async (req, res) => {
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
  );

  res.json(application);
});

applicationRouter.post("/bulk", async (req, res) => {
  const parsed = bulkCreateApplicationsSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid application data",
      errors: parsed.error.flatten(),
    });
  }

  const applications = await createApplicationsBulk(parsed.data);

  res.status(201).json(applications);
});