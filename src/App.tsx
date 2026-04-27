import { FormEvent, useEffect, useState, useTransition } from "react";
import { ApiError, Habit, PublicHabit, User, api } from "./lib/api";

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

function WeekGrid({ days }: { days: Habit["lastSevenDays"] }) {
  return (
    <div className="week">
      {days.map((day) => (
        <div className={`day ${day.completed ? "done" : ""}`} key={day.dateKey}>
          <span>{formatVietnamWeekday(day.dateKey)}</span>
          <b>{day.dateKey.slice(8)}</b>
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
          <div className="empty">Loading shared habit...</div>
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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [habitName, setHabitName] = useState("");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const authenticated = Boolean(token && user);

  const loadHabits = async (authToken = token) => {
    if (!authToken) return;

    const result = await api.habits(authToken);
    setHabits(result.habits);
  };

  useEffect(() => {
    if (!token) return;

    loadHabits().catch((error) => {
      setMessage(error instanceof ApiError ? error.message : "Could not load habits");
    });
  }, [token]);

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
      } catch (error) {
        setMessage(error instanceof ApiError ? error.message : "Could not create habit");
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
      } catch (error) {
        setMessage(error instanceof ApiError ? error.message : "Could not mark habit");
      }
    });
  };

  const handleShareToggle = (habitId: string, isPublic: boolean) => {
    if (!token) return;

    startTransition(async () => {
      try {
        setMessage("");
        await api.setHabitSharing(habitId, isPublic, token);
        await loadHabits(token);
      } catch (error) {
        setMessage(error instanceof ApiError ? error.message : "Could not update sharing");
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
            {habits.length === 0 ? (
              <div className="empty">No habits yet. Add one habit to start a streak.</div>
            ) : (
              habits.map((habit) => (
                <article className="habit-card" key={habit.id}>
                  <div className="habit-header">
                    <div>
                      <h2>{habit.name}</h2>
                      <p>{habit.currentStreak} day current streak</p>
                    </div>
                    <button onClick={() => handleMarkDone(habit.id)} disabled={isPending}>
                      Mark done
                    </button>
                  </div>
                  <WeekGrid days={habit.lastSevenDays} />
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
                    <a className="share-link" href={getShareLink(habit.shareId)} target="_blank" rel="noreferrer">
                      {getShareLink(habit.shareId)}
                    </a>
                  ) : null}
                </article>
              ))
            )}
          </div>
        </section>
      )}
    </main>
  );
}

export default App;
