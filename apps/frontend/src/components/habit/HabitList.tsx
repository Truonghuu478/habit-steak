import type { Habit, StreakRecord } from "../../lib/api";
import { HabitCardSkeleton } from "../ui/Skeletons";
import HabitCard from "./HabitCard";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";

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
    <Box className="grid gap-5">
      {isLoading ? (
        <>
          <HabitCardSkeleton />
          <HabitCardSkeleton />
        </>
      ) : habits.length === 0 ? (
        <Paper className="p-6">
          <Typography className="text-center">
            No habits yet. Add one habit to start a streak.
          </Typography>
        </Paper>
      ) : (
        <>
          <Box className="flex items-center gap-2">
            <Typography className="font-bold mr-1">View:</Typography>
            <ToggleButtonGroup
              value={viewRange}
              exclusive
              onChange={(_, val) => {
                if (val !== null) onViewRangeChange(val);
              }}
              size="small"
            >
              <ToggleButton value={7}>7 days</ToggleButton>
              <ToggleButton value={30}>30 days</ToggleButton>
            </ToggleButtonGroup>
          </Box>
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
    </Box>
  );
}
