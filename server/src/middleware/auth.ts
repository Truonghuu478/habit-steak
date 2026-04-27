import type { Request, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { jwtSecret } from "../config/env.js";

export type AuthUser = {
  id: string;
  email: string;
};

export type AuthRequest = Request & {
  user?: AuthUser;
};

export const signToken = (user: AuthUser) => jwt.sign(user, jwtSecret, { expiresIn: "7d" });

export const requireAuth: RequestHandler = (req, res, next) => {
  const authRequest = req as AuthRequest;
  const header = authRequest.header("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;

  if (!token) {
    res.status(401).json({ message: "Missing bearer token" });
    return;
  }

  try {
    const payload = jwt.verify(token, jwtSecret);

    if (
      typeof payload !== "object" ||
      !payload ||
      typeof payload.id !== "string" ||
      typeof payload.email !== "string"
    ) {
      throw new Error("Invalid token payload");
    }

    authRequest.user = {
      id: payload.id,
      email: payload.email
    };
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};