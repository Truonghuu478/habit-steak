import { useEffect, useState, useTransition } from "react";
import { ApiError, type Habit, type StreakRecord, type User, api } from "../../lib/api";
import { showSuccess, showError } from "../../lib/toast";
import AuthForm from "../auth/AuthForm";
import CreateHabitForm from "../habit/CreateHabitForm";
import HabitList from "../habit/HabitList";
import ConfirmModal from "../ui/ConfirmModal";

type Props = {
  token: string | null;
  user: User | null;
  onAuthenticated: (user: User, token: string) => void;
};

export default function Body({ token, user, onAuthenticated }: Props) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [viewRange, setViewRange] = useState(7);
  const [histories, setHistories] = useState<Record<string, StreakRecord[]>>({});
  const [message, setMessage] = useState("");
  const [isLoadingHabits, setIsLoadingHabits] = useState(false);
  const [isPending, startTransition] = useTransition();

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

  const handleAuthenticated = (nextUser: User, nextToken: string) => {
    onAuthenticated(nextUser, nextToken);
    loadHabits(nextToken).catch(() => {});
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
    setConfirmTarget({ type: "unmark", habitId, dateKey });
    setConfirmOpen(true);
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

  const handleSaveEdit = (habitId: string, name: string) => {
    if (!token) return;
    if (!name) {
      setMessage("Habit name is required");
      return;
    }
    startTransition(async () => {
      try {
        setMessage("");
        await api.updateHabit(habitId, name, token);
        await loadHabits(token);
      } catch (error) {
        setMessage(error instanceof ApiError ? error.message : "Could not update habit");
      }
    });
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

  if (!authenticated) {
    return <AuthForm onAuthenticated={handleAuthenticated} />;
  }

  return (
    <>
      {message ? <div className="notice">{message}</div> : null}

      <section className="dashboard">
        <CreateHabitForm token={token!} onCreated={() => loadHabits(token)} />
        <HabitList
          habits={habits}
          histories={histories}
          viewRange={viewRange}
          isLoading={isLoadingHabits}
          isPending={isPending}
          onViewRangeChange={setViewRange}
          onMarkDone={handleMarkDone}
          onDelete={handleDeleteHabit}
          onUnmark={handleUnmark}
          onShareToggle={handleShareToggle}
          onSaveEdit={handleSaveEdit}
        />
      </section>

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
    </>
  );
}
