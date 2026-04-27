import type { RequestHandler } from "express";
import { prisma } from "../lib/prisma.js";
import { toPublicHabit } from "../utils/streaks.js";

export const getHealth: RequestHandler = (_req, res) => {
  res.json({ ok: true });
};

export const getPublicHabit: RequestHandler = async (req, res) => {
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
};