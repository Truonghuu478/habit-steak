const resolveApiUrl = (apiUrl: string | undefined) => {
  if (!apiUrl) {
    throw new Error("VITE_API_URL is required and must include the /api suffix");
  }

  const normalizedUrl = apiUrl.trim().replace(/\/+$/, "");

  if (!normalizedUrl.endsWith("/api")) {
    throw new Error("VITE_API_URL must include the /api suffix");
  }

  return normalizedUrl;
};

const API_URL = resolveApiUrl(import.meta.env.VITE_API_URL);

export type HabitDay = {
  dateKey: string;
  completed: boolean;
};

export type User = {
  id: string;
  email: string;
};

export type Habit = {
  id: string;
  name: string;
  createdAt: string;
  currentStreak: number;
  shareId: string | null;
  isPublic: boolean;
  lastSevenDays: HabitDay[];
};

export type PublicHabit = {
  name: string;
  createdAt: string;
  currentStreak: number;
  lastSevenDays: HabitDay[];
};

export type StreakRecord = { id?: string; dateKey: string; completed?: boolean };

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
  }
}

const request = async <T>(path: string, options: RequestInit = {}, token?: string) => {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });

  const data = (await response.json().catch(() => ({}))) as { message?: string };

  if (!response.ok) {
    throw new ApiError(data.message ?? "Request failed", response.status);
  }

  return data as T;
};

export const api = {
  register: (email: string, password: string) =>
    request<{ user: User; token: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password })
    }),
  login: (email: string, password: string) =>
    request<{ user: User; token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    }),
  habits: (token: string) => request<{ habits: Habit[] }>("/habits", {}, token),
  createHabit: (name: string, token: string) =>
    request<{ habit: Habit }>("/habits", {
      method: "POST",
      body: JSON.stringify({ name })
    }, token),
  setHabitSharing: (habitId: string, isPublic: boolean, token: string) =>
    request<{ habit: { id: string; shareId: string | null; isPublic: boolean } }>(`/habits/${habitId}/share`, {
      method: "PATCH",
      body: JSON.stringify({ isPublic })
    }, token),
  updateHabit: (habitId: string, name: string, token: string) =>
    request<{ habit: Habit }>(`/habits/${habitId}`, {
      method: "PATCH",
      body: JSON.stringify({ name })
    }, token),
  deleteHabit: (habitId: string, token: string) =>
    request<void>(`/habits/${habitId}`, { method: "DELETE" }, token),
  markDone: (habitId: string, token: string) =>
    request<{ streak: { id: string; dateKey: string } }>(`/streaks/${habitId}`, {
      method: "POST"
    }, token),
  unmarkStreak: (habitId: string, dateKey: string, token: string) =>
    request<{ habitId: string; deleted: { id: string; dateKey: string }; currentStreak: number }>(`/streaks/${habitId}?date=${dateKey}`, {
      method: "DELETE"
    }, token),
  getStreakHistory: (habitId: string, token?: string, range?: number) =>
    request<{ habitId: string; currentStreak: number; history: StreakRecord[] }>(`/streaks/${habitId}${range ? `?range=${range}` : ""}`, {}, token),
  publicHabit: (shareId: string) => request<{ habit: PublicHabit }>(`/public/habits/${shareId}`)
};
