import { Router } from "express";
import { getPublicHabit } from "../controllers/publicController.js";

const publicRoutes = Router();

publicRoutes.get("/public/habits/:shareId", getPublicHabit);

export { publicRoutes };