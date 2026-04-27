import { Router } from "express";
import { getHealth } from "../controllers/publicController.js";

const systemRoutes = Router();

systemRoutes.get("/health", getHealth);

export { systemRoutes };