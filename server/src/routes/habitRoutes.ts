import { Router } from "express";
import {
  createHabit,
  getStreakHistory,
  listHabits,
  markHabitDone,
  setHabitSharing
} from "../controllers/habitController.js";
import { requireAuth } from "../middleware/auth.js";

const habitRoutes = Router();

habitRoutes.get("/habits", requireAuth, listHabits);
habitRoutes.post("/habits", requireAuth, createHabit);
habitRoutes.patch("/habits/:habitId/share", requireAuth, setHabitSharing);
habitRoutes.post("/streaks/:habitId", requireAuth, markHabitDone);
habitRoutes.get("/streaks/:habitId", requireAuth, getStreakHistory);

export { habitRoutes };