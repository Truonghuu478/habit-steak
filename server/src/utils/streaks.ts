import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone.js";
import utc from "dayjs/plugin/utc.js";
import { APP_TIMEZONE } from "../config/env.js";

dayjs.extend(utc);
dayjs.extend(timezone);

type HabitStreakRecord = {
  dateKey: string;
};

type HabitSummaryInput = {
  id: string;
  name: string;
  createdAt: Date;
  shareId: string | null;
  isPublic: boolean;
  streaks: HabitStreakRecord[];
};

type PublicHabitInput = {
  name: string;
  createdAt: Date;
  streaks: HabitStreakRecord[];
};

export const getDateKey = (value = dayjs()) => value.tz(APP_TIMEZONE).format("YYYY-MM-DD");

export const getTodayKey = () => getDateKey();

export const getLastSevenDateKeys = () => {
  const today = dayjs().tz(APP_TIMEZONE);

  return Array.from({ length: 7 }, (_value, index) => getDateKey(today.subtract(6 - index, "day")));
};

export const calculateCurrentStreak = (dateKeys: string[]) => {
  const completed = new Set(dateKeys);
  let cursor = dayjs().tz(APP_TIMEZONE).startOf("day");
  let count = 0;

  while (completed.has(cursor.format("YYYY-MM-DD"))) {
    count += 1;
    cursor = cursor.subtract(1, "day");
  }

  return count;
};

export const buildStreakMetrics = (dateKeys: string[]) => {
  const completed = new Set(dateKeys);

  return {
    currentStreak: calculateCurrentStreak(dateKeys),
    lastSevenDays: getLastSevenDateKeys().map((dateKey) => ({
      dateKey,
      completed: completed.has(dateKey)
    }))
  };
};

export const toHabitSummary = (habit: HabitSummaryInput) => {
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

export const toPublicHabit = (habit: PublicHabitInput) => ({
  name: habit.name,
  createdAt: habit.createdAt,
  ...buildStreakMetrics(habit.streaks.map((streak) => streak.dateKey))
});