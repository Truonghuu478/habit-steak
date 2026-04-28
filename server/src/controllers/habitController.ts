import { randomUUID } from "node:crypto";
import type { RequestHandler } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import type { AuthRequest } from "../middleware/auth.js";
import dayjs from "dayjs";
import { calculateCurrentStreak, getTodayKey, toHabitSummary, getDateKey, getLastDateKeys } from "../utils/streaks.js";

const habitSchema = z.object({
  name: z.string().trim().min(1).max(80)
});

const shareSchema = z.object({
  isPublic: z.boolean()
});

const getOwnedHabit = async (habitId: string, userId: string) =>
  prisma.habit.findFirst({
    where: {
      id: habitId,
      userId
    }
  });

export const listHabits: RequestHandler = async (req, res) => {
  const authRequest = req as AuthRequest;
  const habits = await prisma.habit.findMany({
    where: { userId: authRequest.user!.id },
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
};

export const createHabit: RequestHandler = async (req, res) => {
  const authRequest = req as AuthRequest;
  const parsed = habitSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ message: "Habit name is required" });
    return;
  }

  const habit = await prisma.habit.create({
    data: {
      name: parsed.data.name,
      userId: authRequest.user!.id
    }
  });

  res.status(201).json({ habit });
};

export const setHabitSharing: RequestHandler = async (req, res) => {
  const authRequest = req as AuthRequest;
  const parsed = shareSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ message: "Invalid sharing payload" });
    return;
  }

  const habitId = String(req.params.habitId);
  const habit = await getOwnedHabit(habitId, authRequest.user!.id);

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
};

export const markHabitDone: RequestHandler = async (req, res) => {
  const authRequest = req as AuthRequest;
  const habitId = String(req.params.habitId);
  const habit = await getOwnedHabit(habitId, authRequest.user!.id);

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
  } catch (error: any) {
    if (error?.code === "P2002") {
      const existingStreak = await prisma.streak.findFirst({
        where: { habitId: habit.id, dateKey }
      });
      res.status(200).json({ streak: existingStreak });
      return;
    }
    throw error;
  }
};

export const updateHabit: RequestHandler = async (req, res) => {
  const authRequest = req as AuthRequest;
  const parsed = habitSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ message: "Habit name is required" });
    return;
  }

  const habitId = String(req.params.habitId);
  const habit = await getOwnedHabit(habitId, authRequest.user!.id);

  if (!habit) {
    res.status(404).json({ message: "Habit not found" });
    return;
  }

  const updatedHabit = await prisma.habit.update({
    where: { id: habit.id },
    data: { name: parsed.data.name }
  });

  res.json({ habit: updatedHabit });
};

export const deleteHabit: RequestHandler = async (req, res) => {
  const authRequest = req as AuthRequest;
  const habitId = String(req.params.habitId);
  const habit = await getOwnedHabit(habitId, authRequest.user!.id);

  if (!habit) {
    res.status(404).json({ message: "Habit not found" });
    return;
  }

  await prisma.habit.delete({ where: { id: habit.id } });

  res.status(204).end();
};

export const unmarkStreak: RequestHandler = async (req, res) => {
  const authRequest = req as AuthRequest;
  const habitId = String(req.params.habitId);
  const habit = await getOwnedHabit(habitId, authRequest.user!.id);

  if (!habit) {
    res.status(404).json({ message: "Habit not found" });
    return;
  }

  const dateParam = String(req.query.date || "");

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
    res.status(400).json({ message: "Invalid date format, expected YYYY-MM-DD" });
    return;
  }

  const dateKey = getDateKey(dayjs(dateParam));
  const todayKey = getTodayKey();

  if (dayjs(dateKey).isAfter(dayjs(todayKey))) {
    res.status(400).json({ message: "Cannot unmark a future date" });
    return;
  }

  const streak = await prisma.streak.findFirst({ where: { habitId: habit.id, dateKey } });

  if (!streak) {
    res.status(404).json({ message: "Streak not found for that date" });
    return;
  }

  await prisma.streak.delete({ where: { id: streak.id } });

  const remaining = await prisma.streak.findMany({ where: { habitId: habit.id } });

  res.json({
    habitId: habit.id,
    deleted: { id: streak.id, dateKey: streak.dateKey },
    currentStreak: calculateCurrentStreak(remaining.map((s) => s.dateKey))
  });
};

export const getStreakHistory: RequestHandler = async (req, res) => {
  const authRequest = req as AuthRequest;
  const habitId = String(req.params.habitId);
  const habit = await getOwnedHabit(habitId, authRequest.user!.id);

  if (!habit) {
    res.status(404).json({ message: "Habit not found" });
    return;
  }

  const streaks = await prisma.streak.findMany({
    where: { habitId: habit.id },
    orderBy: { dateKey: "desc" }
  });

  const rangeParam = req.query.range;

  if (rangeParam !== undefined) {
    const range = Number(String(rangeParam));

    if (!Number.isInteger(range) || range <= 0 || range > 365) {
      res.status(400).json({ message: "Invalid range, must be an integer between 1 and 365" });
      return;
    }

    const lastDateKeys = getLastDateKeys(range);
    const completed = new Set(streaks.map((s) => s.dateKey));

    res.json({
      habitId: habit.id,
      currentStreak: calculateCurrentStreak(streaks.map((streak) => streak.dateKey)),
      history: lastDateKeys.map((dateKey) => ({ dateKey, completed: completed.has(dateKey) }))
    });

    return;
  }

  res.json({
    habitId: habit.id,
    currentStreak: calculateCurrentStreak(streaks.map((streak) => streak.dateKey)),
    history: streaks.map((streak) => ({
      id: streak.id,
      dateKey: streak.dateKey
    }))
  });
};