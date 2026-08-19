import cors from "cors";
import express from "express";
import { applicationRouter } from "./modules/application.routes.js";

export const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/applications", applicationRouter);