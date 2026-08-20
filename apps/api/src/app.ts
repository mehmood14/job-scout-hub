import cors from "cors";
import express from "express";
import { authRouter } from "./modules/auth.routes.js";
import { applicationRouter } from "./modules/application.routes.js";

export const app = express();

const clientOrigin = process.env.CLIENT_ORIGIN;

app.use(cors({
  origin: clientOrigin
    ? clientOrigin.split(",")
    : process.env.NODE_ENV === "production"
      ? false
      : true,
  credentials: true,
}));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/auth", authRouter);
app.use("/applications", applicationRouter);
