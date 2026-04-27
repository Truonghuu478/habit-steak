import { Router } from "express";
import { getCurrentUser, login, register } from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";

const authRoutes = Router();

authRoutes.post("/auth/register", register);
authRoutes.post("/auth/login", login);
authRoutes.get("/me", requireAuth, getCurrentUser);

export { authRoutes };