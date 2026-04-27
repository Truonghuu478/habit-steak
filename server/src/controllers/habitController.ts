import { randomUUID } from "node:crypto";
import type { RequestHandler } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import type { AuthRequest } from "../middleware/auth.js";
import { calculateCurrentStreak, getTodayKey, toHabitSummary } from "../utils/streaks.js";

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
  } catch {
    res.status(409).json({ message: "Habit already marked for today" });
  }
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

  res.json({
    habitId: habit.id,
    currentStreak: calculateCurrentStreak(streaks.map((streak) => streak.dateKey)),
    history: streaks.map((streak) => ({
      id: streak.id,
      dateKey: streak.dateKey
    }))
  });
};