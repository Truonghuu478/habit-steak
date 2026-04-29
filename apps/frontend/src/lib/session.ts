import type { User } from "./api";

const tokenStorageKey = "habit-steak-token";
const userStorageKey = "habit-steak-user";

export function loadToken(): string | null {
  return localStorage.getItem(tokenStorageKey);
}

export function loadUser(): User | null {
  const raw = localStorage.getItem(userStorageKey);
  return raw ? (JSON.parse(raw) as User) : null;
}

export function persistSession(user: User, token: string) {
  localStorage.setItem(tokenStorageKey, token);
  localStorage.setItem(userStorageKey, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(tokenStorageKey);
  localStorage.removeItem(userStorageKey);
}
