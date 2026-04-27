import { useState } from "react";
import type { Habit, StreakRecord } from "../../lib/api";
import WeekGrid from "../streak/WeekGrid";
import HabitActions from "./HabitActions";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

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
    <Card>
      <CardContent>
        <Box className="flex items-start justify-between gap-4 mb-5 max-md:flex-col">
          <div>
            {isEditing ? (
              <Box className="grid gap-3 mt-1">
                <TextField
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  slotProps={{ htmlInput: { maxLength: 80 } }}
                  size="small"
                />
                <Box className="flex gap-2">
                  <Button variant="contained" size="small" onClick={handleSave}>
                    Save
                  </Button>
                  <Button variant="text" size="small" onClick={cancelEdit}>
                    Cancel
                  </Button>
                </Box>
              </Box>
            ) : (
              <>
                <Typography variant="h2" className="mb-1">
                  {habit.name}
                </Typography>
                <Typography>{habit.currentStreak} day current streak</Typography>
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
        </Box>

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
      </CardContent>
    </Card>
  );
}
