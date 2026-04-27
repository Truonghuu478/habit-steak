import { useEffect, useState } from "react";
import { ApiError, type PublicHabit, api } from "../../lib/api";
import { formatVietnamDate } from "../../lib/format";
import WeekGrid from "../streak/WeekGrid";
import { WeekGridSkeleton } from "../ui/Skeletons";
import Skeleton from "react-loading-skeleton";

type Props = {
  shareId: string;
};

export default function PublicHabitPage({ shareId }: Props) {
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
