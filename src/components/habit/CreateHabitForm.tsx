import { type FormEvent, useState, useTransition } from "react";
import { ApiError, api } from "../../lib/api";
import { showSuccess, showError } from "../../lib/toast";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";

type Props = {
  token: string;
  onCreated: () => void;
};

export default function CreateHabitForm({ token, onCreated }: Props) {
  const [habitName, setHabitName] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleCreateHabit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!habitName.trim()) return;

    startTransition(async () => {
      try {
        await api.createHabit(habitName.trim(), token);
        setHabitName("");
        onCreated();
        showSuccess("Habit created");
      } catch (error) {
        const msg = error instanceof ApiError ? error.message : "Could not create habit";
        showError(msg);
      }
    });
  };

  return (
    <Paper component="form" onSubmit={handleCreateHabit} className="p-5">
      <Box
        className="grid gap-4 items-end"
        sx={{ gridTemplateColumns: { xs: "1fr", sm: "1fr auto" } }}
      >
        <TextField
          label="New habit"
          value={habitName}
          onChange={(e) => setHabitName(e.target.value)}
          placeholder="Drink water, read 20 pages..."
          slotProps={{ htmlInput: { maxLength: 80 } }}
          required
        />
        <Button variant="contained" type="submit" disabled={isPending} className="h-14">
          {isPending ? "Saving..." : "Add habit"}
        </Button>
      </Box>
    </Paper>
  );
}
