import bcrypt from "bcryptjs";
import type { RequestHandler } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { signToken, type AuthRequest } from "../middleware/auth.js";

const authSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(8)
});

export const register: RequestHandler = async (req, res) => {
  const parsed = authSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ message: "Invalid registration data" });
    return;
  }

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email }
  });

  if (existing) {
    res.status(409).json({ message: "Email is already registered" });
    return;
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const user = await prisma.user.create({
    data: {
      email: parsed.data.email,
      passwordHash
    },
    select: {
      id: true,
      email: true
    }
  });

  res.status(201).json({ user, token: signToken(user) });
};

export const login: RequestHandler = async (req, res) => {
  const parsed = authSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ message: "Invalid login data" });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email }
  });

  if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) {
    res.status(401).json({ message: "Invalid email or password" });
    return;
  }

  const safeUser = { id: user.id, email: user.email };
  res.json({ user: safeUser, token: signToken(safeUser) });
};

export const getCurrentUser: RequestHandler = (req, res) => {
  const authRequest = req as AuthRequest;

  res.json({ user: authRequest.user });
};