import { FormEvent, useEffect, useState, useTransition } from "react";
import { ApiError, Habit, PublicHabit, User, api, StreakRecord } from "./lib/api";
import ConfirmModal from "./components/ConfirmModal";
import { HabitCardSkeleton, WeekGridSkeleton } from "./components/Skeletons";
import { showSuccess, showError } from "./lib/toast";
import Skeleton from "react-loading-skeleton";

const tokenStorageKey = "habit-steak-token";
const userStorageKey = "habit-steak-user";
const vietnamTimeZone = "Asia/Ho_Chi_Minh";

const getPublicShareId = (pathname: string) => {
  const match = pathname.match(/^\/public\/habits\/([^/]+)$/);

  return match ? decodeURIComponent(match[1]) : null;
};

const getShareLink = (shareId: string) => `${window.location.origin}/public/habits/${shareId}`;

const formatVietnamWeekday = (dateKey: string) =>
  new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    timeZone: vietnamTimeZone
  }).format(new Date(`${dateKey}T12:00:00Z`));

const formatVietnamDate = (value: string) =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeZone: vietnamTimeZone
  }).format(new Date(value));

function WeekGrid({
  days,
  onUnmark
}: {
  days: { dateKey: string; completed?: boolean }[];
  onUnmark?: (dateKey: string) => void;
}) {
  return (
    <div className="week">
      {days.map((day) => (
        <div className={`day ${day.completed ? "done" : ""}`} key={day.dateKey}>
          <span>{formatVietnamWeekday(day.dateKey)}</span>
          <b>{day.dateKey.slice(8)}</b>
          {day.completed && onUnmark ? (
            <button className="small" onClick={() => onUnmark(day.dateKey)}>
              Unmark
            </button>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function PublicHabitPage({ shareId }: { shareId: string }) {
  const [habit, setHabit] = useState<PublicHabit | null>(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    setIsLoading(true);
    setMessage("");

    api.publicHabit(shareId)
      .then((result) => {
        if (!cancelled) {
          setHabit(result.habit);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setHabit(null);
          setMessage(error instanceof ApiError ? error.message : "Could not load shared habit");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [shareId]);

  return (
    <main className="shell public-shell">
      <section className="hero">
        <div>
          <p className="eyebrow">Shared Habit</p>
          <h1>Read-only streak snapshot for one habit.</h1>
          <p className="lede">This public page exposes only the habit name, current streak, and the last seven days.</p>
        </div>
        <a className="button-link ghost" href="/">
          Open app
        </a>
      </section>

      {message ? <div className="notice">{message}</div> : null}

      <section className="panel public-card">
        {isLoading ? (
          <>
            <div className="public-meta">
              <Skeleton width={220} height={30} />
              <div className="h-2" />
              <Skeleton width={140} height={16} />
              <div className="h-2" />
              <Skeleton width={200} height={14} />
            </div>
            <WeekGridSkeleton />
          </>
        ) : habit ? (
          <>
            <div className="public-meta">
              <h2>{habit.name}</h2>
              <p>{habit.currentStreak} day current streak</p>
              <p>Tracking since {formatVietnamDate(habit.createdAt)}</p>
            </div>
            <WeekGrid days={habit.lastSevenDays} />
          </>
        ) : (
          <div className="empty">This share link is unavailable.</div>
        )}
      </section>
    </main>
  );
}

function App() {
  const publicShareId = getPublicShareId(window.location.pathname);

  if (publicShareId) {
    return <PublicHabitPage shareId={publicShareId} />;
  }

  const [token, setToken] = useState(() => localStorage.getItem(tokenStorageKey));
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem(userStorageKey);
    return raw ? (JSON.parse(raw) as User) : null;
  });
  const [habits, setHabits] = useState<Habit[]>([]);
  const [viewRange, setViewRange] = useState<number>(7);
  const [histories, setHistories] = useState<Record<string, StreakRecord[]>>({});
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [habitName, setHabitName] = useState("");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isLoadingHabits, setIsLoadingHabits] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<{
    type: "delete" | "unmark";
    habitId: string;
    dateKey?: string;
  } | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const authenticated = Boolean(token && user);

  const loadHabits = async (authToken = token) => {
    if (!authToken) return;

    setIsLoadingHabits(true);
    try {
      const result = await api.habits(authToken);
      setHabits(result.habits);
    } finally {
      setIsLoadingHabits(false);
    }
  };

  const load30DayHistories = async (authToken = token) => {
    if (!authToken) return;

    const map: Record<string, StreakRecord[]> = {};

    await Promise.all(
      habits.map(async (h) => {
        try {
          const res = await api.getStreakHistory(h.id, authToken, 30);
          map[h.id] = res.history;
        } catch {
          map[h.id] = [];
        }
      })
    );

    setHistories(map);
  };

  useEffect(() => {
    if (!token) return;
    loadHabits().catch((error) => {
      const msg = error instanceof ApiError ? error.message : "Could not load habits";
      setMessage(msg);
      showError(msg);
    });
  }, [token]);

  useEffect(() => {
    if (viewRange === 30 && token) {
      load30DayHistories(token).catch(() => {});
    }
  }, [viewRange, habits]);

  const persistSession = (nextUser: User, nextToken: string) => {
    localStorage.setItem(tokenStorageKey, nextToken);
    localStorage.setItem(userStorageKey, JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
  };

  const handleAuth = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");

    startTransition(async () => {
      try {
        const action = mode === "login" ? api.login : api.register;
        const result = await action(email, password);
        persistSession(result.user, result.token);
        await loadHabits(result.token);
      } catch (error) {
        setMessage(error instanceof ApiError ? error.message : "Authentication failed");
      }
    });
  };

  const handleCreateHabit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token || !habitName.trim()) return;

    startTransition(async () => {
      try {
        setMessage("");
        await api.createHabit(habitName.trim(), token);
        setHabitName("");
        await loadHabits(token);
        showSuccess("Habit created");
      } catch (error) {
        const msg = error instanceof ApiError ? error.message : "Could not create habit";
        setMessage(msg);
        showError(msg);
      }
    });
  };

  const handleMarkDone = (habitId: string) => {
    if (!token) return;

    startTransition(async () => {
      try {
        setMessage("");
        await api.markDone(habitId, token);
        await loadHabits(token);
        showSuccess("Streak marked");
      } catch (error) {
        const msg = error instanceof ApiError ? error.message : "Could not mark habit";
        setMessage(msg);
        showError(msg);
      }
    });
  };

  const handleUnmark = (habitId: string, dateKey: string) => {
    if (!token) return;

    // Open confirm modal for unmarking a streak
    setConfirmTarget({ type: "unmark", habitId, dateKey });
    setConfirmOpen(true);
  };

  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const startEdit = (habitId: string, currentName: string) => {
    setEditingHabitId(habitId);
    setEditingName(currentName);
  };

  const cancelEdit = () => {
    setEditingHabitId(null);
    setEditingName("");
  };

  const saveEdit = (habitId: string) => {
    if (!token) return;
    const name = editingName.trim();
    if (!name) {
      setMessage("Habit name is required");
      return;
    }

    startTransition(async () => {
      try {
        setMessage("");
        await api.updateHabit(habitId, name, token);
        cancelEdit();
        await loadHabits(token);
      } catch (error) {
        setMessage(error instanceof ApiError ? error.message : "Could not update habit");
      }
    });
  };

  const handleDeleteHabit = (habitId: string) => {
    if (!token) return;

    setConfirmTarget({ type: "delete", habitId });
    setConfirmOpen(true);
  };

  const handleShareToggle = (habitId: string, isPublic: boolean) => {
    if (!token) return;

    startTransition(async () => {
      try {
        setMessage("");
        await api.setHabitSharing(habitId, isPublic, token);
        await loadHabits(token);
        showSuccess(isPublic ? "Share enabled" : "Share disabled");
      } catch (error) {
        const msg = error instanceof ApiError ? error.message : "Could not update sharing";
        setMessage(msg);
        showError(msg);
      }
    });
  };

  const handleLogout = () => {
    localStorage.removeItem(tokenStorageKey);
    localStorage.removeItem(userStorageKey);
    setToken(null);
    setUser(null);
    setHabits([]);
  };

  const handleConfirmAction = async () => {
    if (!confirmTarget || !token) return;
    setConfirmLoading(true);
    try {
      if (confirmTarget.type === "delete") {
        await api.deleteHabit(confirmTarget.habitId, token);
        showSuccess("Habit deleted");
        await loadHabits(token);
        if (viewRange === 30) await load30DayHistories(token);
      } else {
        // unmark
        await api.unmarkStreak(confirmTarget.habitId, confirmTarget.dateKey!, token);
        showSuccess("Streak unmarked");
        await loadHabits(token);
        if (viewRange === 30) await load30DayHistories(token);
      }
      setConfirmOpen(false);
      setConfirmTarget(null);
    } catch (error) {
      const msg = error instanceof ApiError ? error.message : "Action failed";
      setMessage(msg);
      showError(msg);
    } finally {
      setConfirmLoading(false);
    }
  };

  return (
    <main className="shell">
      <section className="hero">
        <div>
          <p className="eyebrow">Habit Streak</p>
          <h1>Build boring consistency into visible momentum.</h1>
          <p className="lede">
            Create habits, mark one completion per day, and track the last seven days without editable history.
          </p>
        </div>
        {authenticated ? (
          <button className="ghost" onClick={handleLogout}>
            Log out {user?.email}
          </button>
        ) : null}
      </section>

      {message ? <div className="notice">{message}</div> : null}

      {!authenticated ? (
        <section className="panel auth-panel">
          <div>
            <h2>{mode === "login" ? "Log in" : "Create account"}</h2>
            <p>Passwords must be at least 8 characters. Tokens are stored locally for this MVP.</p>
          </div>
          <form onSubmit={handleAuth}>
            <label>
              Email
              <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required />
            </label>
            <label>
              Password
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                minLength={8}
                required
              />
            </label>
            <button disabled={isPending}>{isPending ? "Working..." : mode === "login" ? "Log in" : "Register"}</button>
          </form>
          <button className="link" onClick={() => setMode(mode === "login" ? "register" : "login")}>
            {mode === "login" ? "Need an account?" : "Already have an account?"}
          </button>
        </section>
      ) : (
        <section className="dashboard">
          <form className="create-card" onSubmit={handleCreateHabit}>
            <label>
              New habit
              <input
                value={habitName}
                onChange={(event) => setHabitName(event.target.value)}
                placeholder="Drink water, read 20 pages..."
                maxLength={80}
                required
              />
            </label>
            <button disabled={isPending}>{isPending ? "Saving..." : "Add habit"}</button>
          </form>

          <div className="habit-grid">
            {isLoadingHabits ? (
              <>
                <HabitCardSkeleton />
                <HabitCardSkeleton />
              </>
            ) : habits.length === 0 ? (
              <div className="empty">No habits yet. Add one habit to start a streak.</div>
            ) : (
              <>
                <div className="controls">
                  <span>View:</span>
                  <button className={viewRange === 7 ? "active" : ""} onClick={() => setViewRange(7)}>
                    7 days
                  </button>
                  <button className={viewRange === 30 ? "active" : ""} onClick={() => setViewRange(30)}>
                    30 days
                  </button>
                </div>
                {habits.map((habit) => (
                  <article className="habit-card" key={habit.id}>
                    <div className="habit-header">
                      <div>
                        {editingHabitId === habit.id ? (
                          <div>
                            <input value={editingName} onChange={(e) => setEditingName(e.target.value)} maxLength={80} />
                            <div>
                              <button onClick={() => saveEdit(habit.id)}>Save</button>
                              <button className="link" onClick={cancelEdit}>
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <h2>{habit.name}</h2>
                            <p>{habit.currentStreak} day current streak</p>
                          </>
                        )}
                      </div>
                      <div>
                        <button onClick={() => handleMarkDone(habit.id)} disabled={isPending}>
                          Mark done
                        </button>
                        <button className="ghost" onClick={() => startEdit(habit.id, habit.name)}>
                          Edit
                        </button>
                        <button className="ghost danger" onClick={() => handleDeleteHabit(habit.id)}>
                          Delete
                        </button>
                      </div>
                    </div>
                    {viewRange === 7 ? (
                      <WeekGrid days={habit.lastSevenDays} onUnmark={(date) => handleUnmark(habit.id, date)} />
                    ) : (
                      <WeekGrid days={histories[habit.id] ?? []} onUnmark={(date) => handleUnmark(habit.id, date)} />
                    )}
                    <div className="share-row">
                      <div>
                        <strong>Public share</strong>
                        <p>{habit.isPublic ? "Read-only link is live." : "Disabled until you enable sharing."}</p>
                      </div>
                      <button className="ghost" onClick={() => handleShareToggle(habit.id, !habit.isPublic)} disabled={isPending}>
                        {habit.isPublic ? "Disable share" : "Enable share"}
                      </button>
                    </div>
                    {habit.isPublic && habit.shareId ? (
                      <>
                        <a className="share-link" href={getShareLink(habit.shareId)} target="_blank" rel="noreferrer">
                          {getShareLink(habit.shareId)}
                        </a>
                        <div className="mt-2">
                          <button
                            className="ghost"
                            onClick={async () => {
                              try {
                                await navigator.clipboard.writeText(getShareLink(habit.shareId!));
                                showSuccess("Share link copied");
                              } catch {
                                showError("Could not copy link");
                              }
                            }}
                          >
                            Copy
                          </button>
                        </div>
                      </>
                    ) : null}
                  </article>
                ))}
              </>
            )}
          </div>
        </section>
      )}
      <ConfirmModal
        open={confirmOpen}
        title={confirmTarget?.type === "delete" ? "Delete habit?" : "Unmark streak?"}
        description={
          confirmTarget?.type === "delete"
            ? "This will permanently delete the habit and its history."
            : `Unmark streak on ${confirmTarget?.dateKey}? This cannot be undone.`
        }
        confirmLabel={confirmTarget?.type === "delete" ? "Delete" : "Unmark"}
        onCancel={() => {
          setConfirmOpen(false);
          setConfirmTarget(null);
        }}
        onConfirm={handleConfirmAction}
        loading={confirmLoading}
      />
    </main>
  );
}

export default App;
