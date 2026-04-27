import "dotenv/config";
import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import bcrypt from "bcryptjs";
import cors from "cors";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone.js";
import utc from "dayjs/plugin/utc.js";
import express from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

dayjs.extend(utc);
dayjs.extend(timezone);

const prisma = new PrismaClient();
const app = express();
const port = Number(process.env.PORT ?? 4000);
const jwtSecret = process.env.JWT_SECRET;
const appTimezone = "Asia/Ho_Chi_Minh";
const serverDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(serverDir, path.basename(serverDir) === "src" ? "../.." : "..");
const clientDistDir = path.join(projectRoot, "dist");
const clientIndexPath = path.join(clientDistDir, "index.html");
const canServeClient = existsSync(clientIndexPath);

if (!jwtSecret) {
  throw new Error("JWT_SECRET is required");
}

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN
  })
);
app.use(express.json());

type AuthRequest = express.Request & {
  user?: {
    id: string;
    email: string;
  };
};

const authSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(8)
});

const habitSchema = z.object({
  name: z.string().trim().min(1).max(80)
});

const shareSchema = z.object({
  isPublic: z.boolean()
});

const signToken = (user: { id: string; email: string }) =>
  jwt.sign(user, jwtSecret, { expiresIn: "7d" });

const requireAuth: express.RequestHandler = (req: AuthRequest, res, next) => {
  const header = req.header("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;

  if (!token) {
    res.status(401).json({ message: "Missing bearer token" });
    return;
  }

  try {
    req.user = jwt.verify(token, jwtSecret) as AuthRequest["user"];
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

const getDateKey = (value = dayjs()) => value.tz(appTimezone).format("YYYY-MM-DD");

const getTodayKey = () => getDateKey();

const getLastSevenDateKeys = () => {
  const today = dayjs().tz(appTimezone);

  return Array.from({ length: 7 }, (_value, index) => getDateKey(today.subtract(6 - index, "day")));
};

const calculateCurrentStreak = (dateKeys: string[]) => {
  const completed = new Set(dateKeys);
  let cursor = dayjs().tz(appTimezone).startOf("day");
  let count = 0;

  while (completed.has(cursor.format("YYYY-MM-DD"))) {
    count += 1;
    cursor = cursor.subtract(1, "day");
  }

  return count;
};

const buildStreakMetrics = (dateKeys: string[]) => {
  const completed = new Set(dateKeys);

  return {
    currentStreak: calculateCurrentStreak(dateKeys),
    lastSevenDays: getLastSevenDateKeys().map((dateKey) => ({
      dateKey,
      completed: completed.has(dateKey)
    }))
  };
};

const toHabitSummary = (habit: {
  id: string;
  name: string;
  createdAt: Date;
  shareId: string | null;
  isPublic: boolean;
  streaks: { dateKey: string }[];
}) => {
  const streakMetrics = buildStreakMetrics(habit.streaks.map((streak) => streak.dateKey));

  return {
    id: habit.id,
    name: habit.name,
    createdAt: habit.createdAt,
    shareId: habit.shareId,
    isPublic: habit.isPublic,
    ...streakMetrics
  };
};

const toPublicHabit = (habit: {
  name: string;
  createdAt: Date;
  streaks: { dateKey: string }[];
}) => ({
  name: habit.name,
  createdAt: habit.createdAt,
  ...buildStreakMetrics(habit.streaks.map((streak) => streak.dateKey))
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/auth/register", async (req, res) => {
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
});

app.post("/api/auth/login", async (req, res) => {
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
});

app.get("/api/me", requireAuth, (req: AuthRequest, res) => {
  res.json({ user: req.user });
});

app.get("/api/habits", requireAuth, async (req: AuthRequest, res) => {
  const habits = await prisma.habit.findMany({
    where: { userId: req.user!.id },
    orderBy: { createdAt: "desc" },
    include: {
      streaks: {
        orderBy: { dateKey: "desc" }
      }
    }
  });

  res.json({
    habits: habits.map(toHabitSummary)
  });
});

app.post("/api/habits", requireAuth, async (req: AuthRequest, res) => {
  const parsed = habitSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ message: "Habit name is required" });
    return;
  }

  const habit = await prisma.habit.create({
    data: {
      name: parsed.data.name,
      userId: req.user!.id
    }
  });

  res.status(201).json({ habit });
});

app.patch("/api/habits/:habitId/share", requireAuth, async (req: AuthRequest, res) => {
  const parsed = shareSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ message: "Invalid sharing payload" });
    return;
  }

  const habitId = String(req.params.habitId);
  const habit = await prisma.habit.findFirst({
    where: {
      id: habitId,
      userId: req.user!.id
    }
  });

  if (!habit) {
    res.status(404).json({ message: "Habit not found" });
    return;
  }

  const updatedHabit = await prisma.habit.update({
    where: { id: habit.id },
    data: {
      isPublic: parsed.data.isPublic,
      shareId: parsed.data.isPublic ? habit.shareId ?? randomUUID() : habit.shareId
    }
  });

  res.json({
    habit: {
      id: updatedHabit.id,
      shareId: updatedHabit.shareId,
      isPublic: updatedHabit.isPublic
    }
  });
});

app.post("/api/streaks/:habitId", requireAuth, async (req: AuthRequest, res) => {
  const habitId = String(req.params.habitId);
  const habit = await prisma.habit.findFirst({
    where: {
      id: habitId,
      userId: req.user!.id
    }
  });

  if (!habit) {
    res.status(404).json({ message: "Habit not found" });
    return;
  }

  const dateKey = getTodayKey();

  try {
    const streak = await prisma.streak.create({
      data: {
        habitId: habit.id,
        dateKey
      }
    });

    res.status(201).json({ streak });
  } catch {
    res.status(409).json({ message: "Habit already marked for today" });
  }
});

app.get("/api/streaks/:habitId", requireAuth, async (req: AuthRequest, res) => {
  const habitId = String(req.params.habitId);
  const habit = await prisma.habit.findFirst({
    where: {
      id: habitId,
      userId: req.user!.id
    }
  });

  if (!habit) {
    res.status(404).json({ message: "Habit not found" });
    return;
  }

  const streaks = await prisma.streak.findMany({
    where: { habitId: habit.id },
    orderBy: { dateKey: "desc" }
  });

  res.json({
    habitId: habit.id,
    currentStreak: calculateCurrentStreak(streaks.map((streak) => streak.dateKey)),
    history: streaks.map((streak) => ({
      id: streak.id,
      dateKey: streak.dateKey
    }))
  });
});

app.get("/api/public/habits/:shareId", async (req, res) => {
  const shareId = String(req.params.shareId);
  const habit = await prisma.habit.findFirst({
    where: { shareId },
    include: {
      streaks: {
        orderBy: { dateKey: "desc" }
      }
    }
  });

  if (!habit) {
    res.status(404).json({ message: "Shared habit not found" });
    return;
  }

  if (!habit.isPublic) {
    res.status(403).json({ message: "This habit is not public" });
    return;
  }

  res.json({
    habit: toPublicHabit(habit)
  });
});

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

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
