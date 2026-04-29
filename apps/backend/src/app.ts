import cors, { type CorsOptions } from "cors";
import express from "express";
import { CLIENT_ORIGIN } from "./config/env.js";
import { authRoutes } from "./routes/authRoutes.js";
import { habitRoutes } from "./routes/habitRoutes.js";
import { publicRoutes } from "./routes/publicRoutes.js";
import { systemRoutes } from "./routes/systemRoutes.js";

type CreateAppOptions = {
  clientOrigin?: string;
};

const resolveCorsOrigin = (allowedOrigin: string): CorsOptions["origin"] => {
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
      origin: resolveCorsOrigin(options.clientOrigin ?? CLIENT_ORIGIN),
      credentials: true
    })
  );
  app.use(express.json());

  app.use("/api", systemRoutes);
  app.use("/api", authRoutes);
  app.use("/api", habitRoutes);
  app.use("/api", publicRoutes);

  app.use((_req, res) => {
    res.status(404).json({ message: "Route not found" });
  });

  // Global error handler
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err);
    res.status(err.status || 500).json({
      message: err.message || "Internal Server Error",
      code: err.code || "INTERNAL_ERROR"
    });
  });

  return app;
};

const app = createApp();

export { app, createApp };