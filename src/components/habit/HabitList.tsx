import type { Habit, StreakRecord } from "../../lib/api";
import { HabitCardSkeleton } from "../ui/Skeletons";
import HabitCard from "./HabitCard";

type Props = {
  habits: Habit[];
  histories: Record<string, StreakRecord[]>;
  viewRange: number;
  isLoading: boolean;
  isPending: boolean;
  onViewRangeChange: (range: number) => void;
  onMarkDone: (habitId: string) => void;
  onDelete: (habitId: string) => void;
  onUnmark: (habitId: string, dateKey: string) => void;
  onShareToggle: (habitId: string, isPublic: boolean) => void;
  onSaveEdit: (habitId: string, name: string) => void;
};

export default function HabitList({
  habits,
  histories,
  viewRange,
  isLoading,
  isPending,
  onViewRangeChange,
  onMarkDone,
  onDelete,
  onUnmark,
  onShareToggle,
  onSaveEdit
}: Props) {
  return (
    <div className="habit-grid">
      {isLoading ? (
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
            <button
              className={viewRange === 7 ? "active" : ""}
              onClick={() => onViewRangeChange(7)}
            >
              7 days
            </button>
            <button
              className={viewRange === 30 ? "active" : ""}
              onClick={() => onViewRangeChange(30)}
            >
              30 days
            </button>
          </div>
          {habits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              viewRange={viewRange}
              history={histories[habit.id] ?? []}
              isPending={isPending}
              onMarkDone={onMarkDone}
              onDelete={onDelete}
              onUnmark={onUnmark}
              onShareToggle={onShareToggle}
              onSaveEdit={onSaveEdit}
            />
          ))}
        </>
      )}
    </div>
  );
}
