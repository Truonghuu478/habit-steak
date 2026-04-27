import { useState } from "react";
import type { Habit, StreakRecord } from "../../lib/api";
import WeekGrid from "../streak/WeekGrid";
import HabitActions from "./HabitActions";

type Props = {
  habit: Habit;
  viewRange: number;
  history: StreakRecord[];
  isPending: boolean;
  onMarkDone: (habitId: string) => void;
  onDelete: (habitId: string) => void;
  onUnmark: (habitId: string, dateKey: string) => void;
  onShareToggle: (habitId: string, isPublic: boolean) => void;
  onSaveEdit: (habitId: string, name: string) => void;
};

export default function HabitCard({
  habit,
  viewRange,
  history,
  isPending,
  onMarkDone,
  onDelete,
  onUnmark,
  onShareToggle,
  onSaveEdit
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingName, setEditingName] = useState("");

  const startEdit = () => {
    setIsEditing(true);
    setEditingName(habit.name);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditingName("");
  };

  const handleSave = () => {
    onSaveEdit(habit.id, editingName.trim());
    setIsEditing(false);
    setEditingName("");
  };

  return (
    <article className="habit-card">
      <div className="habit-header">
        <div>
          {isEditing ? (
            <div>
              <input
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                maxLength={80}
              />
              <div>
                <button onClick={handleSave}>Save</button>
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
        <HabitActions
          habit={habit}
          isPending={isPending}
          onMarkDone={onMarkDone}
          onEdit={startEdit}
          onDelete={onDelete}
          onShareToggle={onShareToggle}
        />
      </div>

      {viewRange === 7 ? (
        <WeekGrid
          days={habit.lastSevenDays}
          onUnmark={(date) => onUnmark(habit.id, date)}
        />
      ) : (
        <WeekGrid
          days={history}
          onUnmark={(date) => onUnmark(habit.id, date)}
        />
      )}
    </article>
  );
}
