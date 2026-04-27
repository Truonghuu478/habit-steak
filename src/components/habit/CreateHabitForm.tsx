import { type FormEvent, useState, useTransition } from "react";
import { ApiError, api } from "../../lib/api";
import { showSuccess, showError } from "../../lib/toast";

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
    <form className="create-card" onSubmit={handleCreateHabit}>
      <label>
        New habit
        <input
          value={habitName}
          onChange={(e) => setHabitName(e.target.value)}
          placeholder="Drink water, read 20 pages..."
          maxLength={80}
          required
        />
      </label>
      <button disabled={isPending}>{isPending ? "Saving..." : "Add habit"}</button>
    </form>
  );
}
