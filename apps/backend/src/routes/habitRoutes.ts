import { Router } from "express";
import {
  createHabit,
  getStreakHistory,
  listHabits,
  markHabitDone,
  updateHabit,
  deleteHabit,
  unmarkStreak,
  setHabitSharing
} from "../controllers/habitController.js";
import { requireAuth } from "../middleware/auth.js";

const habitRoutes = Router();

habitRoutes.get("/habits", requireAuth, listHabits);
habitRoutes.post("/habits", requireAuth, createHabit);
habitRoutes.patch("/habits/:habitId", requireAuth, updateHabit);
habitRoutes.delete("/habits/:habitId", requireAuth, deleteHabit);
habitRoutes.patch("/habits/:habitId/share", requireAuth, setHabitSharing);
habitRoutes.post("/streaks/:habitId", requireAuth, markHabitDone);
habitRoutes.get("/streaks/:habitId", requireAuth, getStreakHistory);
habitRoutes.delete("/streaks/:habitId", requireAuth, unmarkStreak);

export { habitRoutes };