import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cors, { type CorsOptions } from "cors";
import express from "express";
import { clientOrigin } from "./config/env.js";
import { authRoutes } from "./routes/authRoutes.js";
import { habitRoutes } from "./routes/habitRoutes.js";
import { publicRoutes } from "./routes/publicRoutes.js";
import { systemRoutes } from "./routes/systemRoutes.js";

const serverDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(serverDir, path.basename(serverDir) === "src" ? "../.." : "..");
const clientDistDir = path.join(projectRoot, "dist");
const clientIndexPath = path.join(clientDistDir, "index.html");
const canServeClient = existsSync(clientIndexPath);

type CreateAppOptions = {
  clientOrigin?: string;
};

const resolveCorsOrigin = (allowedOrigin?: string): CorsOptions["origin"] => {
  if (!allowedOrigin) {
    return true;
  }

  return (requestOrigin, callback) => {
    if (!requestOrigin) {
      callback(null, true);
      return;
    }

    callback(null, requestOrigin === allowedOrigin ? requestOrigin : false);
  };
};

const createApp = (options: CreateAppOptions = {}) => {
  const app = express();

  app.use(
    cors({
      origin: resolveCorsOrigin(options.clientOrigin ?? clientOrigin)
    })
  );
  app.use(express.json());

  app.use("/api", systemRoutes);
  app.use("/api", authRoutes);
  app.use("/api", habitRoutes);
  app.use("/api", publicRoutes);

  if (canServeClient) {
    app.use(express.static(clientDistDir));

    app.get("/", (_req, res) => {
      res.sendFile(clientIndexPath);
    });

    app.get("/public/habits/:shareId", (_req, res) => {
      res.sendFile(clientIndexPath);
    });
  }

  app.use((_req, res) => {
    res.status(404).json({ message: "Route not found" });
  });

  return app;
};

const app = createApp();

export { app, createApp };